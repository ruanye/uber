var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var UserCouponPkg = AV.Object.extend("UserCouponPkg");
var CarCoupon = AV.Object.extend("CarCoupon");
var PkgUser = AV.Object.extend("PkgUser");
var CouponPkg = AV.Object.extend("CouponPkg");
var CarCoupon2 = AV.Object.extend("CarCoupon2");
var PromoUserObj = AV.Object.extend("PromoUser");
var UserCarCoupon = AV.Object.extend("UserCarCoupon");

AV.Cloud.define("mobile_uber_sync", function (request, response) {
    var phone = request.params.phone;
    var activityId = request.params.activityId;
    var type = request.params.type;
    var realPhone = request.params.realPhone;
    if (type == "onecoupon") {
        var query = new AV.Query(CarCoupon2);
        query.get(activityId, {
            success: function (data) {
                if (!data) {
                    return response.error("查询乘车券失败");
                }
                syncPromoToUber(phone, data.get("url"), phone, function (error) {
                    if (error && error.status === 2) {
                        var qu = new AV.Query(UserCarCoupon);
                        qu.equalTo("carCouponId", activityId);
                        qu.equalTo("phoneNumber", phone);
                        qu.equalTo("isNew", 0);
                        qu.first({
                            success: function (obj) {
                                obj.set("isNew", 1);
                                obj.save();
                            },
                            error: function (error) {
                                //return response.error("查询已领取券包失败");
                            }
                        });
                    }
                    return response.success(error);
                });
            },
            error: function (error) {
                return response.error(error);
            }
        });
    } else if (type == "pkg") {
        var query = new AV.Query(UserCouponPkg);
        query.equalTo("actId", activityId);
        query.equalTo("phoneNumber", phone);
        query.include("couponPkg");
        query.first({
            success: function (userCouponPkg) {
                //已领取券包
                var couponPkg = userCouponPkg.get("couponPkg");
                if (!couponPkg) {
                    //券包被删除
                    return response.error("券包已被删除");
                } else {
                    //同步数据
                    syncPkgToUber(phone, activityId, couponPkg.id, realPhone, function (error) {
                        if (error) {
                            return response.error(error);
                        } else {
                            return response.success("success");
                        }
                    });
                }
            },
            error: function (error) {
                return response.error("查询已领取券包失败");
            }
        });
    } else if (type == "promo") {
        var query = new AV.Query(PromoUserObj);
        query.equalTo("actId", activityId);
        query.equalTo("phoneNumber", phone);
        query.first({
            success: function (promoUser) {
                if (!promoUser) {
                    return response.error("查询已领取券promo失败");
                }
                syncPromoToUber(phone, promoUser.get("couponUrl"), realPhone, function (data) {
                    return response.success(data);
                });
            },
            error: function (error) {
                return response.error("查询已领取券promo失败");
            }
        });
    } else {
        return response.error("不存在该类型券包");
    }
});

//同步promo数据到uber中
function syncPromoToUber(phone, couponUrl, realPhone, cb) {
    var promo_code = couponUrl.substr(couponUrl.lastIndexOf('/') + 1);
    if (promo_code.length == 0) {
        return cb(null);
    }
    if (realPhone != undefined) {
        phone = realPhone;
    }
    var params = {
        mobile_country_iso2: 'CN',
        mobile_country_code: '+86',
        mobile: phone,
        promo_code: promo_code,
        token: "49c8ee49-4f7e-412a-b945-93305c2e824c",
        is_new_client: false
    };
    var url = 'https://get.uber.com.cn/envelope_submit/?lang=zh_CN';
    console.log(JSON.stringify(params));
    AV.Cloud.httpRequest({
        method: 'POST',
        body: params,
        url: url,
        success: function (httpResponse) {
//			console.log("success:"+JSON.stringify(httpResponse));
            if ((httpResponse.data.redirect_to).indexOf("apply_success") != -1) {
                return cb({status: 1, msg: "查看", url: "https://get.uber.com.cn" + httpResponse.data.redirect_to});
            } else {
                return cb({status: 2, msg: "查看", url: "https://get.uber.com.cn" + httpResponse.data.redirect_to});
            }
        },
        error: function (httpResponse) {
            console.log("error:" + JSON.stringify(httpResponse));
            if (httpResponse.status == 400 && JSON.stringify(httpResponse.data).indexOf("此优惠码已存入您的账户") > 0) {
                return cb({status: 3, msg: "查看"});
            } else if (JSON.stringify(httpResponse).indexOf("未找到您的账户") > 0) {
                return cb({status: 2, msg: "下载app", url: "https://get.uber.com.cn/app"});
            } else {
                return cb({status: -1, msg: "下载app", url: "https://get.uber.com.cn/app"});
            }
        }
    });
}

//同步pkg数据到uber中
function syncPkgToUber(phone, actId, pkgId, cb) {
    getCarCoupon(actId, pkgId, function (error, list) {
        if (error) {
            return cb(error);
        } else {
            var count = list.length, row = 0;
            for (var i = 0; i < list.length; i++) {
                var data = list[i];
                var couponUrl = data.get("couponUrl");
                if (!couponUrl) {
                    continue;
                }
                var promo_code = couponUrl.substr(couponUrl.lastIndexOf('/') + 1);
                if (promo_code.length == 0) {
                    continue;
                }
                var params = {
                    mobile_country_iso2: 'CN',
                    mobile_country_code: '+86',
                    mobile: phone,
                    is_new_client: false,
                    promo_code: promo_code
                };
                console.log(JSON.stringify(params));
                var url = 'https://get.uber.com.cn/envelope_submit/?callback=?';
                AV.Cloud.httpRequest({
                    method: 'POST',
                    body: params,
                    url: url,
                    success: function (httpResponse) {
                        console.log("success:" + httpResponse.text);
                        row++;
                        if (count == row) {
                            return cb(null);
                        }
                    },
                    error: function (httpResponse) {
                        console.log("error:" + JSON.stringify(httpResponse));
                        row++;
                        if (count == row) {
                            return cb(httpResponse);
                        }
                    }
                });
            }
        }
    });
}


//获得券包
AV.Cloud.define("mobile_couponpkg_save", function (request, response) {
    var phoneNumber = request.params.phoneNumber;
    var activityId = request.params.activityId;
    //查询是否已领取券包
    var query = new AV.Query(UserCouponPkg);
    query.equalTo("actId", activityId);
    query.equalTo("phoneNumber", phoneNumber);
    query.include("couponPkg");
    query.first({
        success: function (userCouponPkg) {
            if (userCouponPkg == null) {
                //未领取券包
                //判断活动是否可抢......本打算判断活动是否过期，由于上级领导指示，暂时不判断
                //判断手机用户是否存在已分配券包
                query = new AV.Query(PkgUser);
                query.equalTo("phone", phoneNumber);
                query.equalTo("actId", activityId);
                query.descending("createdAt");
                query.include("couponPkg", "actCar");
                query.first({
                    success: function (pkgUser) {
                        if (!pkgUser) {
                            //未分配券包，获得默认券包
                            saveDefaultPkg(activityId, phoneNumber, function (status, data) {
                                if (status == -1) {
                                    //领取失败
                                    return response.error(data);
                                } else {
                                    //领取成功
                                    return response.success(data);
                                }
                            });
                        } else {
                            //已分配券包，查询对应券包
                            var actCar = pkgUser.get("actCar");
                            if (!actCar) {
                                return response.error("活动已被删除");
                            }
                            var couponPkg = pkgUser.get("couponPkg");
                            if (!couponPkg) {
                                //该分配券包已被删除,获得默认包
                                saveDefaultPkg(activityId, phoneNumber, function (status, data) {
                                    if (status == -1) {
                                        //领取失败
                                        return response.error(data);
                                    } else {
                                        //领取成功
                                        return response.success(data);
                                    }
                                });
                            } else {
                                //如果分发券包失效则领取默认券包
                                if (couponPkg.get("isEffective") != "1") {
                                    //领取设置包失败，领取默认包
                                    saveDefaultPkg(activityId, phoneNumber, function (status, data) {
                                        if (status == -1) {
                                            //领取失败
                                            return response.error(data);
                                        } else {
                                            //领取成功
                                            return response.success(data);
                                        }
                                    });
                                } else {
                                    couponPkg.set("activity", pkgUser.get("actCar"));
                                    //比较金额是否满足,并领取券包
                                    saveCouponPkg(couponPkg, phoneNumber, function (status, msg) {
                                        if (status == 1) {
                                            //领取成功,获得券包中乘车券
                                            getCarCoupon(activityId, couponPkg.id, function (error, list) {
                                                if (error != null) {
                                                    return response.error("查询乘车券失败");
                                                }
                                                //返回carCoupons:券包中乘车券
                                                return response.success({carCoupons: list});
                                            });
                                        } else if (status == -1) {
                                            //领取失败
                                            return response.error(msg);
                                        } else if (status == -2) {
                                            //领取设置包失败，领取默认包
                                            saveDefaultPkg(activityId, phoneNumber, function (status, data) {
                                                if (status == -1) {
                                                    //领取失败
                                                    return response.error(data);
                                                } else {
                                                    //领取成功
                                                    return response.success(data);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    },
                    error: function (error) {
                        return response.error("查询是否分配券包失败");
                    }
                });
            } else {
                //已领取券包
                var couponPkg = userCouponPkg.get("couponPkg");
                if (!couponPkg) {
                    //券包被删除
                    return response.error("券包已被删除");
                }
                //获得券包中乘车券
                getCarCoupon(activityId, couponPkg.id, function (error, list) {
                    if (error != null) {
                        return response.error("查询乘车券失败");
                    }
                    //返回carCoupons:券包中乘车券
                    return response.success({carCoupons: list, msg: "重复领取", status: 2});
                });
            }
        },
        error: function (error) {
            return response.error("查询是否已领取券包失败");
        }
    });
});

module.exports = AV.Cloud;

//领取默认包
function saveDefaultPkg(activityId, phoneNumber, cb) {
    getDefaultPkg(activityId, function (error, couponPkg) {
        if (!error) {
            if (!couponPkg) {
                return cb(-1, "默认包不存在");
            }
            //券包有效，比较金额是否满足,并领取券包
            saveCouponPkg(couponPkg, phoneNumber, function (status, msg) {
                //领取成功,获得券包中乘车券
                if (status == 1) {
                    getCarCoupon(activityId, couponPkg.id, function (error, list) {
                        if (error != null) {
                            return cb(-1, "查询乘车券失败");
                        }
                        //返回carCoupons:券包中乘车券
                        return cb(1, {carCoupons: list});
                    });
                } else {
                    //领取失败
                    return cb(-1, msg);
                }
            });
        } else {
            return cb(-1, "查询默认包失败");
        }
    });
}

//比较是否可领取券包并领取
function saveCouponPkg(couponPkg, phone, cb) {
    if (couponPkg.get("isEffective") != "1") {
        return cb(-2, "券包失效");
    }
    var actCar = couponPkg.get("activity");
    var money = actCar.get("actMoney");//活动所有金额
    var isUsedMoney = actCar.get("isUsedMoney");//活动已消费金额
    var amount = couponPkg.get("amount");//券包所需金额

    if ((money - isUsedMoney) >= amount) {
        //金额满足，可领取
        //扣除金额
//		actCar.set("isUsedMoney",isUsedMoney+amount);
        actCar.increment('isUsedMoney', amount);
        actCar.save(null, {
            success: function () {
                //用户领取
                var userCouponPkg = new UserCouponPkg();
                userCouponPkg.set("phoneNumber", phone);
                userCouponPkg.set("actId", actCar.id);
                userCouponPkg.set("activity", actCar);
                userCouponPkg.set("pkgId", couponPkg.id);
                userCouponPkg.set("couponPkg", couponPkg);
                userCouponPkg.save(null, {
                    success: function () {
                        //发送post请求
                        return cb(1);
                    },
                    error: function (userCouponPkg, error) {
                        return cb(-1, "领取券包失败");
                    }
                });
            },
            error: function (actCar, error) {
                return cb(-1, "扣除金额失败");
            }
        });
    } else {
        //金额不满足，领取失败
        return cb(-2, "金额不足领取失败");
    }
}

//获得默认券包
function getDefaultPkg(activityId, cb) {
    var query = new AV.Query(CouponPkg);
    query.equalTo("activityId", activityId);
    query.descending("defaultTime");
    query.include("activity");
    query.first({
        success: function (data) {
            cb(null, data);
        },
        error: function (error) {
            cb(error);
        }
    });
}

//获得券包中乘车券
function getCarCoupon(actId, pkgId, cb) {
    var query = new AV.Query(CarCoupon);
    query.equalTo("actId", actId);
    query.equalTo("pkgId", pkgId);
    query.find({
        success: function (list) {
            cb(null, list);
        },
        error: function (error) {
            cb(error);
        }
    });
}
