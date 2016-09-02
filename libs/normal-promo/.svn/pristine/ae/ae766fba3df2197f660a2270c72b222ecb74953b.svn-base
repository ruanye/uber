var router = require('express').Router();

var moment = require('moment');
var async = require("async");

var SyncUber = require("../../common/SyncUber.js");
var OneCoupon = require("../models/OneCoupon.js");
/**
 * 抢单乘车券
 * @param actId-活动id
 * @param phone-手机号
 *
 * @return status: -1 错误，1 正确
 * @return robstatus:-1错误，0-老用户抢码成功，1-新用户抢码成功，2-兑换达到上限
 * @return isrob:1-重复抢券，0-第一次抢券
 *
 */
router.post('/save/:actId-:phone', function (request, response) {
    var actId = request.params.actId;
    var phone = request.params.phone;
    var regular = /^0?1[34578][0-9]\d{8}$/;
    if (!regular.test(phone)) {
        return response.send({status: -1, messsage: '请输入一个正确的手机号码'});
    }
    async.auto({
        //券信息---------是否已抢券，券基本信息
        coupondetail: function (cb) {
            //保存抢券信息
            async.auto({
                act: function (callback) {
                    OneCoupon.actById(actId, function (error, data) {
                        if (error) {
                            return callback(error);
                        }
                        //活动被移除或者失效或者活动过期
                        if (!data || data.get('isEffective') != '1' ||
                            new Date(data.get("cutoffDate")).getTime() < new Date().getTime()) {
                            return callback("活动已失效");
                        }
                        return callback(null);
                    });
                },
                //得到活动对应的券信息
                coupon: function (callback) {
                    OneCoupon.detailByActId(actId, function (error, data) {
                        if (error) {
                            return callback(error);
                        }
                        if (!data) {
                            return callback("没有可抢的券");
                        }
                        return callback(null, data);
                    });
                },
                //得到某用户抢得的券信息
                usercoupon: function (callback) {
                    OneCoupon.getUserCoupon(actId, phone, function (error, data) {
                        return callback(error, data);
                    });
                }
            }, function (error, results) {
                return cb(error, results);
            });
        }
    }, function (error, data) {
        if (error) {
            return response.send({status: -1, message: error});
        }
        //如果用户抢券存在，则直接返回信息
        var usercoupon = data.coupondetail.usercoupon;
        var coupon = data.coupondetail.coupon;
        if (usercoupon) {
            //之前的同步出错，则再次同步；同步后将同步状态写入数据库中
            if (usercoupon.get("isNew") == -1) {
                async.auto({
                    //同步uber账户
                    syncuber: function (callback) {
                        SyncUber.toUber(phone, coupon.get("url"), function (error, result) {
                            return callback(error, result);
                        });
                    },
                    //如果抢成功并且已同步，将同步状态写入数据库中
                    rewrite: ['syncuber', function (callback, data) {
                        OneCoupon.updateUserCoupon(usercoupon, {'isNew': data.syncuber.status}, function (error, data) {
                            if (error) {
                                console.log(error);
                            }
                            return callback(null, data);
                        })
                    }]
                }, function (error, data) {
                    if (error) {
                        return response.send({status: -1, message: error});
                    }
                    return response.send({robstatus: data.syncuber.status, isrob: 1, status: 1});
                });
            } else {
                return response.send({robstatus: usercoupon.get("isNew"), isrob: 1, status: 1});
            }
        } else {
            //还没参加活动
            async.auto({
                //保存用户抢券信息
                save: function (callback) {
                    OneCoupon.saveUserCoupon(actId, coupon, phone, function (error, data) {
                        return callback(error, data);
                    });
                },
                //同步uber账户
                syncuber: function (callback) {
                    SyncUber.toUber(phone, coupon.get("url"), function (error, result) {
                        return callback(error, result);
                    });
                },
                //如果抢成功并且已同步，将同步状态写入数据库中
                rewrite: ['save', 'syncuber', function (callback, data) {
                    var usercoupon = data.save;
                    OneCoupon.updateUserCoupon(data.save, {'isNew': data.syncuber.status}, function (error, data) {
                        if (error) {
                            console.log(error);
                        }
                        return callback(null, data);
                    })
                }]
            }, function (error, data) {
                if (error) {
                    return response.send({status: -1, message: error});
                }
                return response.send({robstatus: data.syncuber.status, isrob: 0, status: 1});
            });
        }
    });
});

module.exports = router;
