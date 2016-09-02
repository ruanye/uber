/**
 * Created by Diluka on 2016-04-08.
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
 *         ┃      ┃　　+
 *         ┃      ┗━━━┓ + +
 *         ┃          ┣┓
 *         ┃          ┏┛
 *         ┗┓┓┏━━━━┳┓┏┛ + + + +
 *          ┃┫┫  　┃┫┫
 *          ┗┻┛　  ┗┻┛+ + + +
 * ----------- 永 无 BUG ------------
 */
(function () {
    "use strict";

    var AV = require("leanengine");

    var config = require("../../config/global.json");
    var url = require("url");
    var redis = require('redis');

    var RedisUrl;
    if ((process.env['NODE_ENV'] || 'development') === 'development') {
        RedisUrl = url.parse('redis://localhost:6379');
    } else {
        RedisUrl = url.parse(process.env[config.redisEnvKey]);
    }

    var RedisHelper = {};

    RedisHelper.createNew = function () {
        //if ((process.env['NODE_ENV']||'development') === 'development' && (process.env['No_reids']) === 'No_reids') {
        //    return ;
        //}


        var rc = redis.createClient(RedisUrl.port, RedisUrl.hostname);
        if (RedisUrl.auth) {
            rc.auth(RedisUrl.auth.split(":")[1]);
        }
        rc.on('error', function (error) {
            return console.log('redis error:%s', error);
        });


        return rc;
    };

    var _rc = null;

    RedisHelper.create = function () {
        if (_rc && _rc.connected && _rc.ready) {

        } else {
            _rc = RedisHelper.createNew();
        }

        return _rc;
    };

    RedisHelper.execMulti = function execMulti(m) {
        return new AV.Promise((resolve, reject) => {
            m.exec((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    };

    module.exports = RedisHelper;
})();
