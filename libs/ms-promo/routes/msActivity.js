var express = require('express');

var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;
var SyncUber = require("../../common/SyncUber");
var syncPromoToUber = SyncUber.syncPromoToUber;

var MsActivity = AV.Object.extend("MsActivity");
var MsCouponUser = AV.Object.extend("MsCouponUser");
var MsCouponCount = AV.Object.extend("MsCouponCount");

var router = express.Router();

function isOldUberUser(httpResponse) {
    if ((httpResponse.data.redirect_to).indexOf("apply_success") != -1) {
        return 1;
    }
    return 0;
}

function pagedQuery(query, request) {
    // used before .find()
    var pageNo = (parseInt(request.query.pageNo) || 1);
    var pageSize = (parseInt(request.query.pageSize) || 10);
    query.skip((pageNo - 1) * pageSize);
    query.limit(pageSize);
    query.descending("createdAt");
}

function create_coupon_count(couponKey) {
    var query = new AV.Query(MsCouponCount);
    query.equalTo('couponKey', couponKey);
    query.find().then(function (lst) {
        if (lst.length == 0) {
            var msCouponCount = new MsCouponCount();
            msCouponCount.set("couponKey", couponKey);
            msCouponCount.set("amount", 0);
            msCouponCount.save();
        } else if (lst.length > 1) {
            lst.pop();
            AV.Object.destroyAll(lst);
        }
    });
}

router.post("/activity/save", function (request, response) {
    // --> msActivity
    function get_activity() {
        var query = new AV.Query(MsActivity);
        query.equalTo("objectId", request.body.id || "");
        return query.find().then(function (lst) {
            var msActivity = lst.length ? lst[0] : new MsActivity();
            return AV.Promise.as(msActivity);
        });
    }

    // --> msActivity
    function post_activity(msActivity) {
        if (!request.body.title) {
            return AV.Promise.error({code: 1, message: "活动标题不能为空"})
        }
        var points = JSON.parse(request.body.points);
        for (var i in points) {
            for (var j in points[i]['coupons']) {
                points[i]['coupons'][j]['amount'] = parseInt(points[i]['coupons'][j]['amount']);
            }
        }
        msActivity.set("title", request.body.title);
        msActivity.set("url", request.body.url || '');
        msActivity.set("points", points);
        return msActivity.save();
    }

    // --> null
    function post_couponCount(msActivity) {
        var points = msActivity.get("points");
        for (var i = 0; i < points.length; i++) {
            for (var j = 0; j < points[i]['coupons'].length; j++) {
                var couponKey = msActivity.id + '|' + i + '|' + j;
                create_coupon_count(couponKey);
            }
        }
    }

    // main work
    get_activity().then(function (res) {
        return post_activity(res);
    }).then(function (res) {
        post_couponCount(res);
    }).then(function (res) {
        response.send({code: 0});
    }, function (error) {
        response.send(error);
    });
});

router.get("/activity/list", function (request, response) {
    var isAdmin = request.query.isAdminr || "";
    var query = new AV.Query(MsActivity);
    if (request.query.id) {
        query.equalTo("objectId", request.query.id || "");
    }
    pagedQuery(query, request);
    query.find({
        success: function (lst) {
            if (!isAdmin) {
                for (var a in lst) {
                    var p = lst[a].get('points');
                    for (var i in p) {
                        for (var j in p[i]['coupons']) {
                            var tmp = p[i]['coupons'][j];
                            tmp['isActive'] = tmp['usedAmount'] >= tmp['amount'] ? 0 : 1;
                            delete(p[i]['coupons'][j]['couponUrl']);
                            delete(p[i]['coupons'][j]['usedAmount']);
                            delete(p[i]['coupons'][j]['amount']);
                        }
                    }
                }
            }
            response.send({code: 0, lst: lst});
        },
        error: function (error) {
            response.send(error);
        }
    });
});

router.post("/activity/delete", function (request, response) {
    var query = new AV.Query(MsActivity);
    query.equalTo("objectId", request.body.id || "");
    query.find({
        success: function (lst) {
            AV.Object.destroyAll(lst).then(function () {
                response.send({code: 0});
            }, function (error) {
                response.send(error);
            });

        },
        error: function (error) {
            response.send(error);
        }
    });
});

router.get("/points", function (request, response) {
    // --> msActivity
    function get_activity() {
        if (!request.query.id) {
            return AV.Promise.error({code: 1, message: "活动ID不能为空"});
        }
        var query = AV.Query(MsActivity);
        return query.get(request.query.id);
    }

    // --> []::points
    function get_points(msActivity) {
        var points = msActivity.get("points");
        var res = [];
        var t = new Date().getTime();
        for (var i = 0; i < points.length; i++) {
            var day = points[i]['day'];
            if (Math.ceil((t / 1000 + 8 * 3600) / 86400) == Math.ceil((day / 1000 + 8 * 3600) / 86400)) {
                rs.push(points[i]);
            }
        }
        return AV.Promise.as(res);
    }

    // main work
    get_activity().then(function (msActivity) {
        return get_points(msActivity);
    }).then(function (points) {
        response.send({code: 0, points: points});
    }, function (error) {
        response.send(error);
    });
});

router.post("/snatchV2", function (request, response) {
    if (!request.body.activityId) {
        response.send({code: 1, message: "活动ID不能为空"});
        return;
    }
    if (!request.body.pointIndex) {
        response.send({code: 1, message: "时间段不能为空"});
        return;
    }
    if (!request.body.couponIndex) {
        response.send({code: 1, message: "乘车券不能为空"});
        return;
    }
    if (!request.body.phone) {
        response.send({code: 1, message: "电话号码不能为空"});
        return;
    }
    var activityId = request.body.activityId;
    var pointIndex = parseInt(request.body.pointIndex);
    var couponIndex = parseInt(request.body.couponIndex);
    var phone = request.body.phone;
    var query1 = new AV.Query(MsActivity);
    var msActivity = null;
    var day = null;
    var startTime = null;
    var endTime = null;
    var couponTitle = null;
    var couponUrl = null;
    var amount = null;
    var usedAmount = null;
    var couponKey = '' + activityId + '|' + pointIndex + '|' + couponIndex;
    var promises = [];
    var query1 = new AV.Query(MsActivity);
    query1.equalTo("objectId", activityId);
    promises.push(query1.find());
    var query2 = new AV.Query(MsCouponUser);
    query2.equalTo("couponKey", couponKey);
    query2.equalTo("phone", phone);
    promises.push(query2.find());
    var query3 = new AV.Query(MsCouponCount);
    query3.equalTo("couponKey", couponKey);
    promises.push(query3.find());
    AV.Promise.all(promises).then(function (res) {
        var lst1 = res[0];
        if (lst1.length == 0) {
            return AV.Promise.error({code: 1, message: "活动不存在"});
        }
        msActivity = lst1[0];
        var points = msActivity.get('points');
        if (pointIndex >= points.length) {
            return AV.Promise.error({code: 1, message: "时间段不存在"});
        }
        var curPoint = points[pointIndex];
        var coupons = curPoint['coupons'];
        if (couponIndex >= coupons.length) {
            return AV.Promise.error({code: 1, message: "乘车券不存在"});
        }
        var t = new Date().getTime();
        day = curPoint['day'];
        startTime = curPoint['startTime'];
        endTime = curPoint['endTime'];
        couponTitle = coupons[couponIndex]['couponTitle'];
        couponUrl = coupons[couponIndex]['couponUrl'];
        amount = coupons[couponIndex]['amount'];
        usedAmount = coupons[couponIndex]['usedAmount'] || 0;
        if (t < day + startTime) {
            return AV.Promise.error({code: 1, message: "秒杀未开始"});
        }
        if (t >= day + endTime) {
            return AV.Promise.error({code: 1, message: "秒杀已结束"});
        }
        // check msCouponUser result
        var lst2 = res[1];
        if (lst2.length >= 1) {
            return AV.Promise.error({code: 1, message: "已经抢过乘车券"});
        }
        // check msCouponCount result
        var lst3 = res[2];
        if (lst3.length > 0 && lst3[0].get('amount') >= amount) {
            if (usedAmount < amount) {
                var points = msActivity.get('points');
                points[pointIndex]['coupons'][couponIndex]['usedAmount'] = amount;
                msActivity.set('points', points);
                msActivity.save();
            }
            return AV.Promise.error({code: 1, coupon: 0, message: "该乘车券已被抢完"});
        }
        // start next promises [msCouponUser.save(), msCouponCount.save()]
        var promises2 = [];
        var msCouponUser = new MsCouponUser();
        msCouponUser.set('couponKey', couponKey);
        msCouponUser.set('activityId', activityId);
        msCouponUser.set('day', day);
        msCouponUser.set('startTime', startTime);
        msCouponUser.set('couponTitle', couponTitle);
        msCouponUser.set('phone', phone);
        msCouponUser.set('isSucceed', 0);
        promises2.push(msCouponUser.save());
        var msCouponCount = (lst3.length > 0 ? lst3[0] : new MsCouponCount());
        msCouponCount.fetchWhenSave(true);
        msCouponCount.set("couponKey", couponKey);
        msCouponCount.increment('amount');
        promises2.push(msCouponCount.save());
        return AV.Promise.all(promises2);
    }).then(function (res2) {
        var msCouponCount2 = res2[1];
        usedAmount = msCouponCount2.get('amount');
        if (usedAmount > amount) {
            return AV.Promise.error({code: 1, coupon: 0, message: "该乘车券已被抢完"});
        }
        msCouponUser = res2[0];
        msCouponUser.set('isSucceed', 1);
        var promises3 = [];
        promises3.push(msCouponUser.save());
        var points = msActivity.get('points')
        points[pointIndex]['coupons'][couponIndex]['usedAmount'] = usedAmount;
        msActivity.set('points', points);
        msActivity.increment("fetchCount");
        promises3.push(msActivity.save());
        return AV.Promise.all(promises3);
    }).then(function (res3) {
        response.send({code: 0, message: "恭喜你！成功抢到乘车券！"});
    }, function (error) {
        response.send(error);
    });
});

router.post("/snatch", function (request, response) {
    if (!request.body.activityId) {
        response.send({code: 1, message: "活动ID不能为空"});
        return;
    }
    if (!request.body.pointIndex) {
        response.send({code: 1, message: "时间段不能为空"});
        return;
    }
    if (!request.body.couponIndex) {
        response.send({code: 1, message: "乘车券不能为空"});
        return;
    }
    if (!request.body.phone) {
        response.send({code: 1, message: "电话号码不能为空"});
        return;
    }
    var activityId = request.body.activityId;
    var pointIndex = parseInt(request.body.pointIndex) || 0;
    var couponIndex = parseInt(request.body.couponIndex) || 0;
    var phone = request.body.phone;
    var query1 = new AV.Query(MsActivity);
    var msActivity = null;
    var day = null;
    var startTime = null;
    var endTime = null;
    var couponTitle = null;
    var couponUrl = null;
    var amount = null;
    var usedAmount = null;
    var couponKey = '' + activityId + '|' + pointIndex + '|' + couponIndex;
    var promises = [];
    var query1 = new AV.Query(MsActivity);
    query1.equalTo("objectId", activityId);
    promises.push(query1.find());
    var query2 = new AV.Query(MsCouponUser);
    query2.equalTo("couponKey", couponKey);
    query2.equalTo("phone", phone);
    promises.push(query2.find());
    var query3 = new AV.Query(MsCouponCount);
    query3.equalTo("couponKey", couponKey);
    promises.push(query3.find());
    AV.Promise.all(promises).then(function (res) {
        var lst1 = res[0];
        if (lst1.length == 0) {
            return AV.Promise.error({code: 1, message: "活动不存在"});
        }
        msActivity = lst1[0];
        var points = msActivity.get('points');
        if (pointIndex >= points.length || !points[pointIndex]) {
            return AV.Promise.error({code: 1, message: "时间段不存在"});
        }
        var curPoint = points[pointIndex];
        var coupons = curPoint['coupons'];
        if (couponIndex >= coupons.length || !coupons[couponIndex]) {
            return AV.Promise.error({code: 1, message: "乘车券不存在"});
        }
        var t = new Date().getTime();
        day = curPoint['day'];
        startTime = curPoint['startTime'];
        endTime = curPoint['endTime'];
        couponTitle = coupons[couponIndex]['couponTitle'];
        couponUrl = coupons[couponIndex]['couponUrl'];
        amount = coupons[couponIndex]['amount'];
        usedAmount = coupons[couponIndex]['usedAmount'] || 0;
        if (t < day + startTime) {
            return AV.Promise.error({code: 1, message: "秒杀未开始"});
        }
        if (t >= day + endTime) {
            return AV.Promise.error({code: 1, message: "秒杀已结束"});
        }
        // check msCouponUser result
        var lst2 = res[1];
        if (lst2.length >= 1) {
            return AV.Promise.error({code: 1, isFetched: 1, message: "已经抢过乘车券"});
        }
        // check msCouponCount result
        var lst3 = res[2];
        if (lst3.length > 0 && lst3[0].get('amount') >= amount) {
            if (usedAmount <= amount) {
                var points = msActivity.get('points');
                points[pointIndex]['coupons'][couponIndex]['usedAmount'] = amount + 1;
                msActivity.set('points', points);
                msActivity.save();
            }
            return AV.Promise.error({code: 1, coupon: 0, message: "该乘车券已被抢完"});
        }
        // start next promises [msCouponUser.save(), msCouponCount.save()]
        var promises2 = [];
        var msCouponUser = new MsCouponUser();
        msCouponUser.set('couponKey', couponKey);
        msCouponUser.set('activityId', activityId);
        msCouponUser.set('day', day);
        msCouponUser.set('startTime', startTime);
        msCouponUser.set('couponTitle', couponTitle);
        msCouponUser.set('phone', phone);
        msCouponUser.set('isSucceed', 0);
        promises2.push(msCouponUser.save());
        var msCouponCount = (lst3.length > 0 ? lst3[0] : new MsCouponCount());
        msCouponCount.fetchWhenSave(true);
        msCouponCount.set("couponKey", couponKey);
        msCouponCount.increment('amount');
        promises2.push(msCouponCount.save());
        return AV.Promise.all(promises2);
    }).then(function (res2) {
        var msCouponCount2 = res2[1];
        usedAmount = msCouponCount2.get('amount');
        if (usedAmount > amount) {
            return AV.Promise.error({code: 1, coupon: 0, message: "该乘车券已被抢完"});
        }
        msCouponUser = res2[0];
        msCouponUser.set('isSucceed', 1);
        var points = msActivity.get('points')
        points[pointIndex]['coupons'][couponIndex]['usedAmount'] = usedAmount;
        msActivity.set('points', points);
        msActivity.increment("fetchCount");
        var promises3 = [];
        promises3.push(msActivity.save());
        promises3.push(syncPromoToUber(phone, couponUrl));
        promises3.push(msCouponUser.save());
        return AV.Promise.all(promises3);
    }).then(function (res3) {
        if (res3[1].isOldUser != 1) {
            response.send({code: 0, isNew: 1, message: "用户未注册"});
        } else {
            response.send({code: 0, message: "恭喜你！成功抢到乘车券！"});
        }
    }, function (error) {
        if (error.status) {
            console.log(error);
            response.send({code: 1, message: "没有抢到此乘车券"});
        } else {
            response.send(error);
        }
    });
});

router.get("/snatch/list", function (request, response) {
    var activityId = request.query.activityId;
    var pointIndex = request.query.pointIndex;
    var couponIndex = request.query.couponIndex;
    var couponKey = activityId + '|' + pointIndex + '|' + couponIndex;
    var query = new AV.Query(MsCouponUser);
    query.equalTo('couponKey', couponKey);
    pagedQuery(query, request);
    query.find({
        success: function (lst) {
            var query2 = new AV.Query(MsCouponCount);
            query2.equalTo('couponKey', couponKey);
            query2.find({
                success: function (lst2) {
                    response.send({code: 0, userLst: lst, countLst: lst2});
                },
                error: function (error) {
                    response.send(error);
                }
            });
        },
        error: function (error) {
            response.send(error);
        }
    });
});

router.post('/create', function (request, response) {
    var title = request.body.title || '';
    var start_time = request.body.startTime || '';
    var end_time = request.body.endTime || '';
    var coupons_json = request.body.coupons || '';
    var is_add_count = request.body.isAddCount || '';
    var start_time_t = new Date(start_time).getTime() - 8 * 3600000;
    var end_time_t = new Date(end_time).getTime() - 8 * 3600000;
    var coupons = JSON.parse(coupons_json);
    var points = [];
    for (var t = start_time_t; t < end_time_t; t += 24 * 3600000) {
        for (var j = 0; j < coupons.length; j++) {
            var start = t + coupons[j]['hour'];
            var end = start + 3600000;
            points.push({day: t, startTime: start, endTime: end, coupons: coupons[j]});
        }
    }
    var msActivity = new MsActivity();
    msActivity.set("title", title);
    msActivity.set("points", points);
    msActivity.save().then(function (res) {
        if (is_add_count == 'Y' || is_add_count == 'y') { // add_count switch
            for (var i = 0; i < points.length; i++) {
                for (var j = 0; j < coupons[0].length; j++) {
                    var msCouponCount = new MsCouponCount();
                    var couponKey = res.id + "|" + i + "|" + j;
                    msCouponCount.set("couponKey", couponKey);
                    msCouponCount.set("amount", 0);
                    msCouponCount.save();
                }
            }
        }
        response.send(title);
    }, function (error) {
        response.send(error);
    });
});

module.exports = router;
