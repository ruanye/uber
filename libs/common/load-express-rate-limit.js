/**
 * Created by Diluka on 2016-06-16.
 *
 *
 * ----------- 神 兽 佑 我 -----------
 *        ┏┓      ┏┓+ +
 *       ┏┛┻━━━━━━┛┻┓ + +
 *       ┃          ┃
 *       ┣     ━    ┃ ++ + + +
 *      ████━████   ┃+
 *       ┃          ┃ +
 *       ┃  ┴       ┃
 *       ┃          ┃ + +
 *       ┗━┓      ┏━┛  Code is far away from bug
 *         ┃      ┃       with the animal protecting
 *         ┃      ┃ + + + +
 *         ┃      ┃
 *         ┃      ┃ +
 *         ┃      ┃      +  +
 *         ┃      ┃    +
 *         ┃      ┗━━━┓ + +
 *         ┃          ┣┓
 *         ┃          ┏┛
 *         ┗┓┓┏━━━━┳┓┏┛ + + + +
 *          ┃┫┫    ┃┫┫
 *          ┗┻┛    ┗┻┛+ + + +
 * ----------- 永 无 BUG ------------
 */
var AV = require("leanengine");
var RateLimitLog = AV.Object.extend("RateLimitLog");
var _ = require("underscore");
var RateLimit = require("express-rate-limit");

/**
 * 路由IP访问频率控制
 *
 * @see https://www.npmjs.com/package/express-rate-limit
 * @param options
 */
module.exports = function (options) {

    var getRealIp = function (req) {
        return req.headers["x-real-ip"] || req.ip;
    };
    var keyGenerator = function (req) {
        logRateLimit(req, 0);
        return getRealIp(req);
    };
    var logRateLimit = function (req, status) {
        var ip = getRealIp(req);
        var url = req.originalUrl;
        var method = req.method;

        // console.log(ip, url, method, status);
        RateLimitLog.new({
            ip: ip,
            url: url,
            method: method,
            body: req.body,
            status: status || 0
        }).save();
    };

    var app = options.app;
    var optionsGET = _.extend({
        windowMs: 1000 * 60,
        delayAfter: 20,
        delayMs: 200,
        max: 100,
        keyGenerator: keyGenerator,
        handler: function (req, res /*, next*/) {
            logRateLimit(req, 1);
            res.format({
                html: function () {
                    res.status(optionsGET.statusCode || 429).end(optionsGET.message || 'Too many requests, please try again later.');
                },
                json: function () {
                    res.status(optionsGET.statusCode || 429).json({message: optionsGET.message || 'Too many requests, please try again later.'});
                }
            });
        }
    }, options.optionsGET);

    var optionsPOST = _.extend({
        windowMs: 1000 * 60,
        delayAfter: 10,
        delayMs: 1000,
        max: 30,
        keyGenerator: keyGenerator,
        handler: function (req, res /*, next*/) {
            logRateLimit(req, 1);
            res.format({
                html: function () {
                    res.status(optionsPOST.statusCode || 429).end(optionsPOST.message || 'Too many requests, please try again later.');
                },
                json: function () {
                    res.status(optionsPOST.statusCode || 429).json({message: optionsPOST.message || 'Too many requests, please try again later.'});
                }
            });
        }
    }, options.optionsPOST);

    var _log = function () {
        if (app.get("env") === 'development') {
            _log = function () {
                Array.prototype.unshift.call(arguments, "express-rate-limit");
                return console.log.apply(console, arguments);
            };
        } else {
            _log = function () {

            }
        }

        return _log.apply(null, arguments);
    };


    function MemoryStore(windowMs) {
        windowMs = windowMs || 60 * 1000;
        var hits = {};

        this.incr = function (key, cb) {
            if (hits[key]) {
                hits[key]++;
            } else {
                hits[key] = 1;
            }

            cb(null, hits[key]);

            _log(key, hits[key]);
        };

        this.resetAll = function () {
            hits = {};
            // _log("resetAll");
        };

        // export an API to allow hits from one or all IPs to be reset
        this.resetKey = function (key) {
            delete hits[key];
            // _log("delete", key);
        };

        // simply reset ALL hits every windowMs
        setInterval(this.resetAll, windowMs);
    }

    app.enable('trust proxy');

    if (app.get("env") === 'development' && !options["store"]) {
        optionsGET["store"] = new MemoryStore(options.windowMs);
        optionsPOST["store"] = new MemoryStore(optionsPOST.windowMs);
    }

    // app.use(/^(\/(?!__)[^.]+)(\/[^.]+)*\/?([?].*)?$/, new RateLimit(options));
    // 不匹配__或者admin或者mobile/开头的，以及中间含有/admin*的
    // API中只有GET和POST请求，其他类型只会在后台管理中使用
    app.get(/^(\/(?!__|admin|mobile\/)[^./]+)(\/(?!admin)[^./]*)*([?].*)?$/, new RateLimit(optionsGET));
    app.post(/^(\/(?!__|admin|mobile\/)[^./]+)(\/(?!admin)[^./]*)*([?].*)?$/, new RateLimit(optionsPOST));
};
