/**
 * Created by Diluka on 2016-07-14.
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

const SyncUber = (function () {

    //下载url链接
    const appurl = 'https://get.uber.com.cn/app';
    const successurl = 'https://get.uber.com.cn/apply_success';
    const url = 'https://get.uber.com.cn/envelope_submit/?lang=zh_CN';
    const UBER_TOKEN = "49c8ee49-4f7e-412a-b945-93305c2e824c";

    //<editor-fold desc="已弃用的同步方法">
    /**
     * 同步promo码(已弃用)
     *
     * status -1同步错误，0-同步成功并且是老用户，1-同步成功是新用户，2-达到兑换限制（不允许再次兑换）
     *
     * @param phone
     * @param couponUrl
     * @param cb
     * @param backother
     * @return {*}
     *
     * @deprecated
     */
    function toUber(phone, couponUrl, cb, backother) {

        var callbackobj = {};
        var is_new_client = false;
        if (backother) {
            callbackobj.backother = backother;
            //如果设置了可抢用户，则设置is_new_client
            if (backother.robuser) {
                if (backother.robuser == 1) {
                    is_new_client = true;
                } else if (backother.robuser == -1) {
                    is_new_client = null;
                }
            }
        }

        var promo_code = couponUrl.substr(couponUrl.lastIndexOf('/') + 1);
        if (promo_code.length == 0) {
            callbackobj.status = 0;
            callbackobj.url = successurl;
            //链接不可用，则直接返回老用户，同步成功
            return cb(null, callbackobj);
        }
        promo_code = decodeURI(promo_code);
        var params = {
            mobile_country_iso2: 'CN',
            mobile_country_code: '+86',
            mobile: phone,
            promo_code: promo_code,
            token: UBER_TOKEN,
            is_new_client: is_new_client
        };
        // console.log(JSON.stringify(params));
        AV.Cloud.httpRequest({
            method: 'POST',
            body: params,
            url: url,
            success: function (httpResponse) {
                callbackobj.data = httpResponse.data;
                // console.log("success:" + JSON.stringify(httpResponse));
                console.log("SyncUber#toUber", _.pick(params, ["mobile", "promo_code", "is_new_client"]), _.pick(httpResponse, ["status", "data"]));
                if ((httpResponse.data.redirect_to).indexOf("apply_success") != -1) {
                    callbackobj.status = 0;
                    callbackobj.url = successurl;
                } else {
                    callbackobj.status = 1;
                    callbackobj.url = appurl;
                }
                return cb(null, callbackobj);
            },
            error: function (httpResponse) {
                console.log("SyncUber#toUber", _.pick(params, ["mobile", "promo_code", "is_new_client"]), _.pick(httpResponse, ["status", "data"]));
                // console.log("error:" + JSON.stringify(httpResponse));

                callbackobj.url = appurl;

                var data = httpResponse.data;
                callbackobj.data = data;
                //不存在data或者data的状态值不为400
                if (!data || !data['400']) {
                    callbackobj.status = -1;
                }
                //存在兑换限制,表示券已兑换完
                else if (data['400'].indexOf('兑换限制') != -1) {
                    callbackobj.status = 2;
                }
                else if (data['400'].indexOf('无法使用') != -1) {
                    callbackobj.status = 2;
                }
                //重复抢券
                else if (data['400'].indexOf('优惠码已存入您的账户') != -1) {
                    callbackobj.status = 0;
                }
                else if (data['400'].indexOf('新用户优惠已经存入您的账户') != -1) {
                    callbackobj.status = 0;
                }

                //新用户抢券
                else if (JSON.stringify(httpResponse).indexOf("未找到您的账户") != -1) {
                    callbackobj.status = 1;
                }
                //新用户抢券
                else if (JSON.stringify(httpResponse).indexOf("优惠码已过期") != -1) {
                    callbackobj.status = 2;
                }
                else if (JSON.stringify(httpResponse).indexOf("优惠码无效") != -1) {
                    callbackobj.status = 2;
                }
                else if (JSON.stringify(httpResponse).indexOf("此优惠码仅针对新注册用户使用") != -1) {
                    callbackobj.status = 0;
                    callbackobj.url = successurl;
                }
                else {
                    callbackobj.status = -1;
                }
                return cb(null, callbackobj);
            }
        });
    }


    /**
     * 同步promo码(已弃用)
     *
     * @param phone
     * @param couponUrl
     * @return {*}
     *
     * @deprecated
     */
    function syncPromoToUber(phone, couponUrl) {
        var promo_code = couponUrl.substr(couponUrl.lastIndexOf('/') + 1);
        if (promo_code.length == 0) {
            return AV.Promise.error({ code: 1, message: "优惠券链接错误" })
        }
        var params = {
            mobile_country_iso2: 'CN',
            mobile_country_code: '+86',
            mobile: phone,
            promo_code: promo_code,
            token: UBER_TOKEN
        };
        console.log(JSON.stringify(params));
        return AV.Cloud.httpRequest({
            method: 'POST',
            body: params,
            url: url,
        }).then(function (httpResponse) {
            if ((httpResponse.data.redirect_to).indexOf("apply_success") != -1) {
                return AV.Promise.as({ isOldUser: 1, isFirstSync: 1 });
            }
            return AV.Promise.as({ isOldUser: 0, direct: "https://get.uber.com.cn" + httpResponse.data.redirect_to });
        }, function (error) {
            if (error['data'] && error['data']['400'] == '此优惠码已存入您的账户。') {
                return AV.Promise.as({ isOldUser: 1, isFirstSync: 0 });
            }
            else if (error['data'] && error['data']['400'] == '未找到您的账户') {
                return AV.Promise.as({ isOldUser: 0, isFirstSync: 1 });
            }
            else if (error['data'] && error['data']['400'].indexOf("兑换限制") != -1) {
                return AV.Promise.as({ isOldUser: 1, isFirstSync: 1, isEmpty: 1 });
            }
            else if (error['data'] && error['data']['400'].indexOf("新用户优惠已经存入") != -1) {
                return AV.Promise.as({ isOldUser: 1, isFirstSync: 1 });
            }
            else if (error['data'] && error['data']['400'].indexOf("电话号码已被注册") != -1) {
                return AV.Promise.as({ isOldUser: 1, isFirstSync: 1 });
            }
            console.log(error);
            return AV.Promise.error({ code: 1, message: "后台网络错误", debug: error['data'] });
        });
    }

    //</editor-fold>

    const DEFAULT_OPTIONS = {
        magic: "a",
        isNewClient: null
    };

    const MESSAGE_STATUS = {
        "无法使用": 2,
        "兑换限制": 2,
        "优惠码已存入您的账户": 0,
        "未找到您的账户": 1,
        "优惠码已过期": 2,
        "优惠码无效": 2,
        "此优惠码仅针对新注册用户使用": 0,
        "新用户优惠已经存入您的账户": 1
    };

    function getMessageStatus(message) {
        if (message) {
            for (let ms in MESSAGE_STATUS) {
                if (message.indexOf(ms) != -1) {
                    return MESSAGE_STATUS[ms];
                }
            }
            return -1;
        } else {
            return -1;
        }
    }

    /**
     * 同步promo码
     *
     * @param options
     * @param options.phone
     * @param options.magic
     * @param options.isNewClient
     *
     * @return AV.Promise
     */
    function toUberNew(options) {
        options = _.extend({}, DEFAULT_OPTIONS, options);

        let promo_code = _.chain(options.magic).split("/").filter(s => !_.isEmpty(s)).last().value();

        let params = {
            mobile_country_iso2: 'CN',
            mobile_country_code: '+86',
            mobile: options.phone,
            promo_code: promo_code,
            token: UBER_TOKEN,
            is_new_client: options.isNewClient
        };

        return AV.Cloud.httpRequest({
            method: 'POST',
            body: params,
            url: url
        }).then(res => {
            console.log("SyncUber#toUberP", _.pick(params, ["mobile", "promo_code", "is_new_client"]), _.pick(res, ["status", "data"]));
            // console.log("toUberP", JSON.stringify(params), JSON.stringify(res.data));
            let result = {};

            result.data = res.data;
            result.isSync = 1;

            if ((res.data.redirect_to).indexOf("apply_success") != -1) {
                result.status = 0;
                result.url = successurl;
            } else {
                result.status = 1;
                result.url = appurl;
            }

            return result;
        }).fail(res => {
            console.log("SyncUber#toUberP", _.pick(params, ["mobile", "promo_code", "is_new_client"]), _.pick(res, ["status", "data"]));
            // console.log("toUberP res", JSON.stringify(params), JSON.stringify(res.data));
            let result = {};

            result.data = res.data;
            result.url = appurl;
            result.isSync = 0;

            let message = JSON.stringify(res);

            result.status = getMessageStatus(message);


            return AV.Promise.as(result);
        });
    }

    function checkUserStatus(phone) {
        return toUberNew({ phone: phone }).then(result => {
            return result.status;
        });
    }

    return {
        syncPromoToUber: syncPromoToUber,
        toUber: toUber,
        toUberP: toUberNew,
        checkUserStatus: checkUserStatus
    }
})();

module.exports = SyncUber;
