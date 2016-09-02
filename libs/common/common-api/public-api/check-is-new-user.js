/**
 * Created by Diluka on 2016-07-08.
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
"use strict";
var AV = require("leanengine");
var router = require('express').Router();
var _ = require("underscore");
var SyncUber = require("../../SyncUber");
var ErrorCode = require("../../ErrorCode.json");
var P = require("../../parsec-toolkit-for-leancloud");

router.get("/is-new-user", function (req, res) {
    var phone = req.query.phone;

    if (!phone) {
        return res.send(_.extend({}, ErrorCode.FORM_DATA_INVALID, {message: "手机号不能为空！"}));
    }

    return SyncUber.checkUserStatus(phone)
        .then(status=> {
            if (status in [0, 1]) {
                return status;
            }
            return AV.Promise.error(ErrorCode.COMMUNICATION_FAILED);
        })
        .then(status=>res.send(_.extend({}, ErrorCode.SUCCESS, {isNewUser: status})))
        .fail(P.commonErrorHandler(res));
});


module.exports = router;
