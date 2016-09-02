var AV = require('leanengine');
var moment = require('moment');
var async = require("async");

AV.Promise._isPromisesAPlusCompliant = false;

var ActivityCar = AV.Object.extend("ActivityCar");
var CouponPkg = AV.Object.extend("CouponPkg");
var UserCouponPkg = AV.Object.extend("UserCouponPkg");
//活动列表
AV.Cloud.define("admin_activity_car_list", function (request, response) {
    var user = request.user;
    if (!user) {
        return response.error({message: "用户不存在"});
    }
    var pageNo = request.params.pageNo;
    var pageSize = request.params.pageSize;

    var type = request.params.type;

    var query = new AV.Query(ActivityCar);
    if (user.get("userType") == 1) {
        query.equalTo("userId", user.id);
    }
    if (type != undefined) {
        query.equalTo("type", type);
    } else {
        query.doesNotExist("type");
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
AV.Cloud.define("admin_activity_car_del", function (request, response) {
    var objectId = request.params.objectId;
    var query = new AV.Query(ActivityCar);
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

//查询参与人数
AV.Cloud.define("admin_activity_partcount", function (request, response) {
    var activityId = request.params.activityId;
    var query = new AV.Query(UserCouponPkg);
    query.equalTo("actId", activityId);
    query.count({
        success: function (count) {
            return response.success(count);
        },
        error: function (error) {
            return response.error(error);
        }
    });
});

//判断是否存活动
AV.Cloud.define("mobile_activity_detail", function (request, response) {
    var activityId = request.params.activityId;
    var query = new AV.Query(ActivityCar);
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

            var query = new AV.Query(CouponPkg);
            query.equalTo("activityId", activityId);
            query.count({
                success: function (count) {
                    var validate = true;
                    if (obj.get("actMoney") <= 0 || count == 0) {
                        validate = false;
                    }
                    returnObj = {
                        "validate": validate,
                        "shareContent": obj.get("sharecontent"),
                        "hasOneHint": obj.get("repeatContent"),
                        "successHint": obj.get("successContent"),
                        "couponHint": obj.get("couponContent"),
                        "endContent": obj.get("endContent")
                    };
                    return response.success(returnObj);
                },
                error: function (error) {
                    response.error("查询当前可领取乘车券种类时出错");
                }
            });
        },
        error: function (object, error) {
            return response.error(error);
        }
    });
});

module.exports = [AV.Cloud];
