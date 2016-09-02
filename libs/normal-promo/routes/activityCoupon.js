var AV = require('leanengine');
var moment = require('moment');
var async = require("async");

AV.Promise._isPromisesAPlusCompliant = false;

var ActivityCoupon = AV.Object.extend("ActivityCoupon");
var CarCoupon2 = AV.Object.extend("CarCoupon2");
var UserCarCoupon = AV.Object.extend("UserCarCoupon");
//活动列表
AV.Cloud.define("admin_activity_coupon_list", function (request, response) {
    var user = request.user;
    if (!user) {
        return response.error({message: "用户不存在"});
    }
    var pageNo = request.params.pageNo;
    var pageSize = request.params.pageSize;
    var query = new AV.Query(ActivityCoupon);
    if (user.get("userType") == 1) {
        query.equalTo("userId", user.id);
    }
    query.skip((pageNo - 1) * pageSize);
    query.limit(pageSize);
    query.descending("createdAt");
    query.find({
        success: function (list) {
            response.success(list);
        },
        error: function (error) {
            response.error(error);
        }
    })
});

//删除活动
AV.Cloud.define("admin_activity_coupon_del", function (request, response) {
    var objectId = request.params.objectId;
    var query = new AV.Query(ActivityCoupon);
    query.get(objectId, {
        success: function (obj) {
            obj.destroy({
                success: function () {
                    response.success("删除成功");
                },
                error: function (error) {
                    response.error(error);
                }
            });
        },
        error: function (error) {
            response.error(error);
        }
    });
});

//计算活动参与者
AV.Cloud.define("mobile_parts_count", function (request, response) {
    var activityId = request.params.activityId;
    async.waterfall([
        function (cb) {
            var query = new AV.Query(CarCoupon2);
            query.equalTo("activityId", activityId);
            query.find({
                success: function (results) {
                    if (results.length > 0) {
                        return cb(null, results);
                    }
                    cb({code: -1, message: "没有数据"});
                },
                error: function (error) {
                    cb(error);
                }
            });
        }
    ], function (error, results) {
        if (error) {
            return response.success({number: 0});
        }
        var coupon = [];
        results.forEach(function (obj) {
            coupon.push(obj.id);

        });
        var query = new AV.Query(UserCarCoupon);
        query.equalTo("activityId", activityId);
        query.containedIn("carCouponId", coupon);
        query.count({
            success: function (count) {
                return response.success({number: count});
            },
            error: function (error) {
                return response.error(error);
            }
        });
    });

});

module.exports = [AV.Cloud];
