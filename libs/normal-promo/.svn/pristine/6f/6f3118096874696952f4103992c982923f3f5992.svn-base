var AV = require('leanengine');
var moment = require('moment');
var express = require('express');
var iconv = require('iconv-lite');

var router = express.Router();


AV.Promise._isPromisesAPlusCompliant = false;

var CarCoupon2 = AV.Object.extend("CarCoupon2");
var UserCarCoupon = AV.Object.extend("UserCarCoupon");

var ActivityCoupon = AV.Object.extend("ActivityCoupon");

//输入手机号获得该乘车券并返回获得的乘车券或者已经领取的乘车券
AV.Cloud.define("mobile_carcoupon_saveCoupon", function (request, response) {

    var carCouponId = request.params.carCouponId;
    var phoneNumber = request.params.phoneNumber;
    var activityId = request.params.activityId;

    var query = new AV.Query(ActivityCoupon);
    query.get(activityId, {
        success: function (obj) {
            if (!obj) {
                return response.error("没有这个活动");
            }
            if (new Date(obj.get("cutoffDate")).getTime() < new Date().getTime()) {
                return response.error("活动已经结束啦");
            }
            if (obj.get("isEffective") == 0) {
                return response.error("活动已经结束啦");
            }
            var cql = "select count(*),* from UserCarCoupon where phoneNumber=? and activityId=? and isNew = 0";

            AV.Query.doCloudQuery(cql, [phoneNumber, activityId], {
                success: function (result) {
                    if (result.count > 0) {
                        return response.success({"state": 2, "msg": "您已经领取过该乘车券!"});
                    } else {
                        var query = new AV.Query(CarCoupon2);
                        query.get(carCouponId, {
                            success: function (data) {
                                if (!data) {
                                    return response.error("查询乘车券失败");
                                }
                                var userCarCoupon = new UserCarCoupon();
                                userCarCoupon.set("phoneNumber", phoneNumber);
                                userCarCoupon.set("carCouponId", data.id);
                                userCarCoupon.set("fetchDate", new Date());
                                userCarCoupon.set("cutoffDate", data.get("cutoffDate"));
                                userCarCoupon.set("fetchAmount", data.get("amount"));
                                userCarCoupon.set("activityId", activityId);
                                userCarCoupon.save(null, {
                                    success: function (rs) {
                                        response.success({"state": 1, "msg": "领取成功!"});
                                    },
                                    error: function (error) {
                                        response.error("保存领取的乘车券时出错");
                                    }
                                });
                            },
                            error: function (error) {
                                return response.error(error);
                            }
                        });
                    }
                },
                error: function (error) {
                    return response.error(error);
                }
            });
        },
        error: function (err) {
            return response.error(err);
        }
    });
});

//导出乘车券用户
router.post('/exportCouponUsers', function (request, response) {
    var carCouponId = request.body.activityId;
    var fileName = "couponUserList.csv";
    response.set({
        'Content-Type': 'application/octet-stream;charset=utf-8',
        'Content-Disposition': "attachment;filename=" + encodeURIComponent(fileName),
        'Pragma': 'no-cache',
        'Expires': 0
    });
    var content = "";
    var coupons = {};
    var cquery = new AV.Query(CarCoupon2);
    cquery.equalTo("activityId", carCouponId);
    cquery.find({
        success: function (results) {
            if (results.length < 1) {
                return response.send("没有乘车券");
            }
            results.forEach(function (item) {
                coupons[item.id] = item.get("amount");
            });
            cycleGetCarCouponUsers(0, carCouponId, content, coupons, function (str, error) {
                if (error) {
                    return response.send(JSON.stringify(error));
                }
                if (str == "") {
                    return response.send("没有查到数据");
                }
                var buffer = new Buffer(str);
                //需要转换字符集
                response.send(iconv.encode(buffer, 'UTF-8'));
            });
        },
        error: function (error) {
            return response.send("没有查到数据");

        }
    });
});

function cycleGetCarCouponUsers(n, carCouponId, content, coupons, cbFun) {
    var query = new AV.Query(UserCarCoupon);
    query.equalTo("activityId", carCouponId);
    query.skip(n * 500);
    query.limit(500);
    query.select("phoneNumber", "createdAt", "carCouponId");
    query.find({
        success: function (results) {
            if (results.length < 1) {
                return cbFun(content);
            } else {
                var tempStr = "";
                for (var i = 0; i < results.length; i++) {
                    tempStr += coupons[results[i].get("carCouponId")] + "," + results[i].get("phoneNumber") + "," + results[i].createdAt.format('yyyy-MM-dd hh:mm') + "\n";
                }
                content += tempStr;
                cycleGetCarCouponUsers(n + 1, carCouponId, content, coupons, cbFun);
            }
        },
        error: function (error) {
            return cbFun(content, error);
        }
    });
}

//时间格式化函数
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

module.exports = [AV.Cloud, router];
