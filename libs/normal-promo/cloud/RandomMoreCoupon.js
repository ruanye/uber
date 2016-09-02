var router = require('express').Router();
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var async = require("async");

var SyncUber = require("../../common/SyncUber.js");
var MoreCoupon = require("../models/MoreCoupon.js");

/**
 * 随机多券
 *
 * @param actId-活动id
 * @param phone-手机号
 *
 * @return isrob:1-重复抢券，0-第一次抢券
 * @return moneys:抢到的券对应的金额，客户端通过该金额来判断页面显示情况
 * @retrun status:-1错误，1-成功，2-抢到的券已被抢完，再试一次
 * @return robstatus:0-老用户抢，1-新用户抢
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
                //获得用户领取的券
                usercoupon: function (callback) {
                    MoreCoupon.isRobCoupon(request.params, function (error, data) {
                        return callback(error, data);
                    });
                },
                //获得某活动下所有券
                allcoupon: function (callback) {
                    MoreCoupon.getCarCoupon(request.params, function (error, list) {
                        if (!list || list.length == 0) {
                            error = '不存在可抢券';
                        }
                        return callback(error, list);
                    });
                },
                //获得券包信息
                couponpkg: function (callback) {
                    MoreCoupon.defaultpkg(request.params, function (error, couponpkg) {
                        if (!couponpkg) {
                            return callback('券包丢失');
                        }
                        if (couponpkg.get('max') <= 0 || couponpkg.get('max') < couponpkg.get('min')) {
                            error = '券包最大可抢数小于等于0 或者 最大数小于最小数';
                        }
                        return callback(error, couponpkg);
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
            var robstatus = 0;
            for (var key in usercoupon.coupons) {
                if (usercoupon.coupons[key] == 1) {
                    robstatus = 1;
                    break;
                }
            }
            return response.send({status: 1, isrob: 1, moneys: usercoupon.coupons, robstatus: robstatus});
        } else {
            var couponpkg = data.coupondetail.couponpkg;
            var min = couponpkg.get('min');//最小可抢数
            var max = couponpkg.get('max');//最大可抢数
            var random = Math.round(Math.random() * (max - min) + min);//随机领取几张

            var coupons = data.coupondetail.allcoupon;

            //去除已经被抢完的券----如果需要先随机再去掉已抢完的，则与随机交换位置
            for (var i = 0; i < coupons.length; i++) {
                if (coupons[i].get('robnum') >= coupons[i].get('num')) {
                    coupons.splice(i, 1);
                    i--;
                }
            }
            //如果所有券都被抢完则返回活动已结束
            if (coupons.length == 0) {
                return response.send({status: -1, message: '券已被抢完'});
            }

            //获得需要分配的券
            var array = [];
            if (coupons.length <= random) {
                array = coupons;
            } else {
                //随机获得券
                for (var i = 0; i < random; i++) {
                    var r = Math.round((coupons.length - 1) * Math.random());
                    array[i] = coupons[r];
                    coupons.splice(i, 1);
                }
            }

            //去掉已被抢完的券
//			for(var i=0;i<coupons.length;i++){
//				if(array[i].get('robnum')>=array[i].get('num')){
//					array.splice(i,1);
//					i--;
//				}
//			}
//			//如果随机到的券都已被抢完则再试一次
//			if(coupons.length==0){
//				return response.send({status:-1,message:'随机的多券都被抢完，再试一次吧'});
//			}

            var coupons = {};
            for (var i = 0; i < array.length; i++) {
                coupons[array[i].get('money')] = -1;
            }
            //保存券信息
            async.auto({
                //保存券信息
                savecoupon: function (callback) {
                    MoreCoupon.saveCouponPkg(couponpkg, phone, function (error, data) {
                        return callback(error, data);
                    }, {coupons: coupons});
                },
                //同步uber
                syncuber: function (callback) {
                    var num = 0;
                    var statuses = {};
                    //遍历券信息，同步uber
                    for (var i = 0; i < array.length; i++) {
                        SyncUber.toUber(phone, array[i].get("couponUrl"), function (error, result) {
                            var params = result.backother;
                            //将同步状态写入对应的金额上
                            statuses[array[params.index].get('money')] = result.status;
                            if ((++num) == array.length) {
                                return callback(error, statuses);
                            }
                        }, {index: i, robuser: array[i].get("robuser")});
                    }
                },
                //回写抢到的券的状态
                rewriteusercoupon: ['savecoupon', 'syncuber', function (callback, data) {
                    MoreCoupon.updateUserCoupon(data.savecoupon, {coupons: data.syncuber}, function (error, data) {
                        if (error) {
                            console.log(error);
                        }
                        return callback(null, data);
                    });
                }],
                //回写各个券已被抢的数量
                rewritecoupon: ['savecoupon', 'syncuber', function (callback, data) {
                    var statuss = data.syncuber;//同步后各个金额对应的状态
                    array.forEach(function (data) {
                        var status = statuss[data.get('money')];
                        //如果抢券成功或者券已被抢完则自增已抢数量
                        if (status == 0 || status == 2) {
                            data.increment('robnum');
                        }
                        //如果是新用户抢并可抢用户为新用户
                        if (status == 1 && data.get('robuser') != 0) {
                            data.increment('robnum');
                        }
                    });
                    AV.Object.saveAll(array).then(function () {
                        return callback(null);
                    }).fail(function (error) {
                        return callback(JSON.stringify(error));
                    });
                }]
            }, function (error, data) {
                if (error) {
                    return response.send({status: -1, message: error});
                }
                var robstatus = 0;
                for (var key in data.syncuber) {
                    if (data.syncuber[key] == 1) {
                        robstatus = 1;
                        break;
                    }
                }
                return response.send({status: 1, isrob: 0, moneys: data.syncuber, robstatus: robstatus});
            });
        }
    });
});
module.exports = router;
