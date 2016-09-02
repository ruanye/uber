/**
 * Created by Diluka on 2016-07-29.
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
const AV = require("leanengine");
const _ = require("lodash");
const moment = require("moment");
const RedisHelper = require("./RedisHelper");

exports.checkIfARedPacketActivitySoon = function (minutes = 5) {
    let rc = RedisHelper.create();

    return RedisHelper.execMulti(rc.multi().zrevrange("redpacket", 0, 1)).then(results=>results[0]).then(result => {
        // console.log(`value of key [redpacket]`, result);
        let rpid = _.head(result);
        if (rpid) {
            return RedisHelper.execMulti(rc.multi().get("redpacket_obj_" + rpid)).then(results=>results[0]).then(result => {
                try {
                    // console.log(`value of key [${"redpacket_obj_" + rpid}]`, result);
                    if (result) {
                        let rpobj = JSON.parse(result);

                        let start = moment(rpobj.beginTime).add(minutes, "m");
                        let end = moment(rpobj.endTime);
                        let now = moment();

                        return !!(start.isBefore(now) && end.isAfter(now));

                    } else {
                        return false;
                    }
                } catch (e) {
                    return AV.Promise.error(e);
                }
            });
        } else {
            return false;
        }
    }).fail(e => {
        console.log(`checkIfARedPacketActivitySoon`, e);
        return AV.Promise.as(false);
    });
};
