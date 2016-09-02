var router = require('express').Router();

var async = require("async");

var AV = require("leanengine");
var SyncUber = require("../../common/SyncUber");
var MoreCoupon = require("../models/MoreCoupon.js");

/**
 * 随机抢一张券或或者抢指定券或者抢已分配券
 *
 * @param actId-活动id
 * @param phone-手机号
 *
 * @param body.israndom 是否随机 0-否标志得到分配券，1-是 默认0
 * @param body.money 暂时不用
 *
 * @return robstatus:-1错误，0-老用户抢码成功，1-新用户抢码成功，2-兑换达到上限
 * @return isrob:1-重复抢券，0-第一次抢券
 * @return money:券包对应的金额，客户端通过该金额来判断页面显示情况
 *
 */
router.post('/save/:actId-:phone', function (request, response) {
    var israndom = request.body.israndom || 0;
    var actId = request.params.actId;
    var phone = request.params.phone;
    var regular = /^0?1[34578][0-9]\d{8}$/;
    if (!regular.test(phone)) {
        return response.send({status: -1, messsage: '请输入一个正确的手机号码'});
    }
    var money = request.body.money;
    async.auto({
        //券信息---------是否已抢券，随机到某张券，得到已分配券信息
        coupondetail: function (cb) {
            async.auto({
                //活动详情
                act: function (callback) {
                    MoreCoupon.actById(actId, function (error, data) {
                        if (error) {
                            return callback(error);
                        }
                        if (!data || data.get('isEffective') != '1' ||
                            new Date(data.get("cutoffDate")).getTime() < new Date().getTime()) {
                            return callback("活动已失效");
                        }
                        return callback(null);
                    });
                },
                //随机到某张券
                randomcoupon: function (callback) {
                    var params = request.params;
                    if (money) {
                        params.money = money;
                    }
                    MoreCoupon.randomCoupon(params, function (error, data) {
                        return callback(error, data);
                    });
                },
                //得到某用户抢得的券信息
                usercoupon: function (callback) {
                    MoreCoupon.isRobCoupon(request.params, function (error, data) {
                        return callback(error, data);
                    });
                },
                //得到分配的券
                allotcoupon: function (callback) {
                    if (israndom == 0) {
                        MoreCoupon.isAllotCoupon(request.params, function (error, data) {
                            return callback(error, data);
                        });
                    } else {
                        return callback(null, null);
                    }
                },
                //得到默认券包
                defaultcoupon: function (callback) {
                    MoreCoupon.defaultpkg(request.params, function (error, data) {
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
        if (usercoupon) {
            var couponPkg = usercoupon.get("couponPkg");
            if (!couponPkg) {
                return response.send({status: -1, message: "券包已被删除"});
            }
            //得到券包中乘车券
            MoreCoupon.getCarCoupon({actId: actId, pkgId: couponPkg.id}, function (error, list) {
                //存在错误，或者券包下不存在券，直接返回错误
                if (error || !list || list.length == 0) {
                    return response.send({status: -1, message: "查询乘车券失败"});
                }
                var coupon = list[0];
                //之前的同步出错，则再次同步；同步后将同步状态写入数据库中
                if (usercoupon.get("isNew") == -1) {
                    async.auto({
                        //同步uber账户
                        syncuber: function (callback) {
                            SyncUber.toUber(phone, coupon.get("couponUrl"), function (error, result) {
                                return callback(error, result);
                            });
                        },
                        //如果抢成功并且已同步，将同步状态写入数据库中
                        rewrite: ['syncuber', function (callback, data) {
                            if (data.syncuber.status != -1) {
                                //表示同步操作状态已发生改变
                                MoreCoupon.updateUserCoupon(usercoupon, {'isNew': data.syncuber.status}, function (error, data) {
                                    if (error) {
                                        console.log(error);
                                    }
                                    return callback(null, data);
                                });
                            } else {
                                return callback(null);
                            }
                        }]
                    }, function (error, data) {
                        if (error) {
                            return response.send({status: -1, message: error});
                        }
                        return response.send({
                            robstatus: data.syncuber.status,
                            isrob: 1,
                            status: 1,
                            money: coupon.get('money')
                        });
                    });
                } else {
                    return response.send({
                        robstatus: usercoupon.get("isNew"),
                        isrob: 1,
                        status: 1,
                        money: coupon.get('money')
                    });
                }
            });
        } else {
            var pkgUser = data.coupondetail.allotcoupon;
            var defaultcoupon = data.coupondetail.defaultcoupon;
            //是否分配了券包
            if (pkgUser) {
                var actCar = pkgUser.get("actCar");
                if (!actCar) {
                    return response.send({status: -1, message: '活动已被删除'});
                }
                var couponPkg = pkgUser.get("couponPkg");
                //该分配券包已被删除或者失效则获得默认包
                if (!couponPkg || couponPkg.get("isEffective") != "1") {
                    saveCoupon(defaultcoupon, phone, actId, function (data) {
                        return response.send(data);
                    });
                } else {
                    //分配的券包没有被删除且有效
                    if (couponPkg.get("amount") > couponPkg.get("usedAmount")) {
                        //未抢完,保存券
                        saveCoupon(couponPkg, phone, actId, function (data) {
                            return response.send(data);
                        });
                    } else {
                        //已抢完,则获得默认券包
                        saveCoupon(defaultcoupon, phone, actId, function (data) {
                            return response.send(data);
                        });
                    }
                }
            } else if (israndom == 0) {
                //如果是分配券，但是没有查询到分配的券包，则使用默认券包
                saveCoupon(defaultcoupon, phone, actId, function (data) {
                    return response.send(data);
                });
            } else {
                //否则随机抢券开始
                saveCoupon(data.coupondetail.randomcoupon, phone, actId, function (data) {
                    return response.send(data);
                });
            }
        }
    });
});

router.post('/save-other/:actId-:phone', function (request, response) {
    "use strict";
    var actId = request.params.actId;
    var phone = request.params.phone;
    var remark = request.body.remark;

    new AV.Query("UserCouponPkg").equalTo("actId", actId).equalTo("phoneNumber", phone).first().then(function (ucp) {
        if (ucp) {
            ucp.set("remark", remark);
            return ucp.save();
        } else {
            return ucp;
        }
    }).then(function (ucp) {
        if (ucp) {
            response.send({success: true});
        } else {
            response.send({success: false, error: "记录不存在"});
        }
    }).fail(function (e) {
        response.send({success: false, error: e.message});
    });
});
module.exports = router;

//保存券包
function saveCoupon(couponPkg, phone, actId, cb) {
    if (!couponPkg || couponPkg.get("isEffective") != "1") {
        return cb({status: -1, message: '券包失效'});
    }
    if (couponPkg.get("amount") > couponPkg.get("usedAmount")) {
        //未抢完,保存券
        async.auto({
            //保存用户获得券包，并自增券已抢数量
            save: function (callback) {
                MoreCoupon.saveCouponPkg(couponPkg, phone, function (error, data) {
                    return callback(error, data);
                });
            },
            //获得券包下券信息
            coupon: function (callback) {
                MoreCoupon.getCarCoupon({actId: actId, pkgId: couponPkg.id}, function (error, list) {
                    if (!list || list.length == 0) {
                        return callback('券包下没有券数据')
                    }
                    return callback(error, list[0]);
                });
            },
            syncuber: ['coupon', function (callback, data) {
                var coupon = data.coupon;
                SyncUber.toUber(phone, coupon.get("couponUrl"), function (error, result) {
                    return callback(error, result);
                });
            }],
            //如果抢成功并且已同步，将同步状态写入数据库中
            rewrite: ['save', 'syncuber', function (callback, data) {
                MoreCoupon.updateUserCoupon(data.save, {'isNew': data.syncuber.status}, function (error, data) {
                    if (error) {
                        console.log(error);
                    }
                    return callback(null, data);
                });
            }],
            //如果抢成功并且已同步，将同步状态写入数据库中
            increment: ['coupon', 'syncuber', function (callback, data) {
                var coupon = data.coupon;
                if (coupon.get("couponUrl") == 'http://' || data.syncuber.status != 1) {
                    MoreCoupon.incrementPkg(couponPkg, function (error) {
                        if (error) {
                            console.log(error);
                        }
                        return callback(null);
                    });
                } else {
                    return callback(null);
                }
            }]
        }, function (error, data) {
            if (error) {
                return cb({status: -1, message: error});
            }
            return cb({robstatus: data.syncuber.status, isrob: 0, status: 1, money: (data.coupon).get('money')});
        });
    } else {
        //已抢完
        return cb({status: -1, message: '券包已被抢完'});
    }
}
