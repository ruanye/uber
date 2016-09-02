var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var CarCoupon2Obj = AV.Object.extend("CarCoupon2");
var UserCarCouponObj = AV.Object.extend("UserCarCoupon");
var ActObj = AV.Object.extend("ActivityCoupon");
var _ = require("lodash");

//单乘车券信息
module.exports = OneCoupon = {
	//通过获得id得到活动详情
	actById: function (actId, callback) {
		var query = new AV.Query(ActObj);
		query.get(actId, {
			success: function (data) {
				return callback(null, data);
			},
			error: function (error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	},
	//通过活动id得到单乘车券信息
	detailByActId: function (actId, callback) {
		var query = new AV.Query(CarCoupon2Obj);
		query.equalTo("activityId", actId);
		query.descending("createdAt");
		query.first({
			success: function (data) {
				return callback(null, data);
			},
			error: function (error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	},
	//得到某用户是否已经抢了某券信息
	getUserCoupon: function (actId, phone, callback) {
		var query = new AV.Query(UserCarCouponObj);
		query.equalTo("activityId", actId);
		query.equalTo("phoneNumber", phone);
		query.first({
			success: function (data) {
				return callback(null, data);
			},
			error: function (error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	},
	//保存用户抢券
	saveUserCoupon: function (actId, coupon, phone, callback) {
		var obj = new UserCarCouponObj();
		obj.set("carCouponId", coupon.id);
		obj.set("activityId", actId);
		obj.set("phoneNumber", phone);
		obj.set("isNew", -1);
		obj.save(null, {
			success: function (data) {
				return callback(null, data);
			},
			error: function (obj, error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	},
	//更新用户抢券状态
	updateUserCoupon: function (usercoupon, params, callback) {
		for (var key in params) {
			usercoupon.set(key, params[key]);
		}
		usercoupon.save(null, {
			success: function (data) {
				return callback(null, data);
			},
			error: function (obj, error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	}
}