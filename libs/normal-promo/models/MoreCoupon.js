var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var PkgUser = AV.Object.extend("PkgUser");
var UserCouponPkg = AV.Object.extend("UserCouponPkg");
var CouponPkg = AV.Object.extend("CouponPkg");
var CarCoupon = AV.Object.extend("CarCoupon");
var ActivityCar = AV.Object.extend("ActivityCar");
var _ = require("lodash");

//券包信息
module.exports = MoreCoupon = {
	//通过获得id得到活动详情
	actById: function (actId, callback) {
		var query = new AV.Query(ActivityCar);
		query.get(actId, {
			success: function (data) {
				return callback(null, data);
			},
			error: function (error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	},
	//是否已领取券
	isRobCoupon: function (params, callback) {
		var query = new AV.Query(UserCouponPkg);
		query.equalTo("actId", params.actId);
		query.equalTo("phoneNumber", params.phone);
		query.include("couponPkg");
		query.first({
			success: function (data) {
				return callback(null, data);
			},
			error: function (error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	},
	//是否分配券
	isAllotCoupon: function (params, callback) {
		query = new AV.Query(PkgUser);
		query.equalTo("phone", params.phone);
		query.equalTo("actId", params.actId);
		query.descending("createdAt");
		query.include("couponPkg", "actCar");
		query.first({
			success: function (data) {
				return callback(null, data);
			},
			error: function (error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	},
	//随机返回某券包
	randomCoupon: function (params, callback) {
		MoreCouponBase.getAllowSavePkg(params, function (error, data) {
			return callback(error, data);
		});
	},
	//返回默认券包，以免会用到
	defaultpkg: function (params, callback) {
		var query = new AV.Query(CouponPkg);
		query.equalTo("activityId", params.actId);
		query.descending("defaultTime");
		query.first({
			success: function (data) {
				return callback(null, data);
			},
			error: function (error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	},
	//得到券包中券信息
	getCarCoupon: function (params, callback) {
		var query = new AV.Query(CarCoupon);
		query.equalTo("actId", params.actId);
		query.equalTo("pkgId", params.pkgId);
		query.find({
			success: function (list) {
				return callback(null, list);
			},
			error: function (error) {
				return callback(error);
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
	},
	//保存券包信息
	saveCouponPkg: function (couponPkg, phone, callback) {
		var actCar = couponPkg.get("activity");
		//用户领取
		var obj = new UserCouponPkg();
		obj.set("phoneNumber", phone);
		obj.set("actId", actCar.id);
		obj.set("activity", actCar);
		obj.set("pkgId", couponPkg.id);
		obj.set("couponPkg", couponPkg);
		obj.set('isNew', -1);
		obj.save(null, {
			success: function (obj) {
				return callback(null, obj);
			},
			error: function (userCouponPkg, error) {
				return callback("领取券包失败");
			}
		});
	},
	//自增抢券包数量
	incrementPkg: function (couponPkg, callback) {
		couponPkg.increment('usedAmount');
		couponPkg.save(null, {
			success: function () {
				return callback(null);
			},
			error: function (actCar, error) {
				return callback("自增券包数量失败");
			}
		});
	}
}

//抢券包基础信息，不开放出去
var MoreCouponBase = {
	/**
	 * 得到某活动下可抢的券包
	 * @params.actId 活动id
	 * @params.money 抢指定某券包
	 */
	getAllowSavePkg: function (params, callback) {
		var query = new AV.Query(CouponPkg);
		query.equalTo("activityId", params.actId);
		query.equalTo("isEffective", "1");
		query.include("activity");
		query.ascending("defaultTime");
		query.find({
			success: function (list) {
				if (list.length == 0) {
					return callback('该活动下不存在券包');
				}
				if (params.money) {
					//得到指定券包
					MoreCouponBase.getMoneyCoupon(list, function (data) {
						return callback(null, data);
					}, params.money);
				} else {
					//得到随机券包
					MoreCouponBase.randomPkg(list, function (data) {
						return callback(null, data);
					});
				}
			},
			error: function (error) {
				return callback(_.result(error, "message", arguments));
			}
		});
	},
	//得到指定的某券包，如果指定券包已被抢完则返回默认券包
	getMoneyCoupon: function (list, cb, money) {
		if (list.length == 1) {
			return cb(list[0]);
		}
		for (var i = 0; i < list.length; i++) {
			var couponpkg = list[i];
			if (couponpkg.get("money") == money) {
				if (couponpkg.get("amount") > couponpkg.get("usedAmount")) {
					return cb(couponpkg);
				} else {
					return cb(list[list.length - 1]);
				}
			}
		}
		return cb(list[list.length - 1]);
	},
	//随机某可用的券包，如果都不可用返回默认券包
	randomPkg: function (list, cb) {
		if (list.length == 1) {
			return cb(list[0]);
		}
		//		//非默认券下标
		//		var random=Math.floor(Math.random()*(list.length-1));
		//		var couponpkg=list[random];
		//		var amount=couponpkg.get("amount");
		//		var usedAmount=couponpkg.get("usedAmount");
		//		//如果当前随机到的券包还有数量，则直接返回
		//		if(amount>usedAmount){
		//			return cb(list[random]);
		//		}else{
		//			//如果该券包已抢完则移除掉，避免再次随机到
		//			list.splice(random,1);
		//			MoreCouponBase.randomPkg(list,cb);
		//		}
		var max = 0;
		var array = [];
		for (var i = 0; i < list.length; i++) {
			max += list[i].get('odds');
			array[i] = max;
		}
		var random = Math.random() * max;
		for (var i = 0; i < array.length; i++) {
			if (i == array.length - 1 || random <= array[i]) {
				return cb(list[i]);
			}
		}

	}
};
