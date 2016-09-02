/**
 * Created by Diluka on 2016-06-20.
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
var ErrorCode = require("../../ErrorCode.json");
var _ = require("underscore");
module.exports = {
    "commonErrorHandler": function (res) {

        var sendResponse;

        if (_.isFunction(res.success)) {
            sendResponse = function () {
                res.success.apply(res, arguments);
            }
        } else {
            sendResponse = function () {
                res.send.apply(res, arguments);
            }
        }

        return function (e) {
            console.log(e);
            if (e.errorCode) {
                sendResponse(e);
            } else {
                sendResponse(_.extend({}, ErrorCode.UNHANDLED_EXCEPTION, {error: e}));
            }
        };
    }
};
