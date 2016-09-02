var iconv = require('iconv-lite');
require("../util/date");
var router = require('express').Router();

var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var UserCouponPkg = AV.Object.extend("UserCouponPkg");
var CouponPkg = AV.Object.extend("CouponPkg");

//导出乘车券用户
router.post('/export', function (request, response) {
    var activityId = request.body.activityId;
    var fileName = "couponPkgUser.csv";
    response.set({
        'Content-Type': 'application/octet-stream;charset=utf-8',
        'Content-Disposition': "attachment;filename=" + encodeURIComponent(fileName),
        'Pragma': 'no-cache',
        'Expires': 0
    });
    var content = "手机号,金额,领取时间\n";
    console.log("开始导出");
    cycleGetCouponPkgUserCount(activityId, content, function (str, error) {
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
});

function cycleGetCouponPkgUserCount(activityId, result, cb) {
    var query = new AV.Query(UserCouponPkg);
    query.equalTo("actId", activityId);
    query.count({
        success: function (count) {
            if (count == 0) {
                return cb([], null);
            }
            var totalNum = 0;
            var pageSize = 900;
            var totalPage = Math.round(count / pageSize == 0 ? 1 : (count % pageSize == 0 ? count / pageSize : count / pageSize + 1));
//			console.log("导出长度："+count+",导出次数："+totalPage);
            for (var i = 0; i < count;) {
                cycleGetCouponPkgUsers(query, i, pageSize, function (content, error) {
                    result += content;
                    if ((++totalNum) == totalPage) {
                        return cb(result, null);
                    }
//        			console.log("导出成功"+totalNum+"次");
                });

                i = i + pageSize;
            }
        },
        error: function (error) {
            return cb(list, error);
        }
    });
}

function cycleGetCouponPkgUsers(query, i, pageSize, cbFun) {
    var content = "";
    query.skip(i);
    query.limit(pageSize);
    query.include("couponPkg");
    query.descending("createdAt");
    query.find({
        success: function (results) {
            var tempStr = "";
            for (var i = 0; i < results.length; i++) {
                tempStr += results[i].get("phoneNumber") + "," +
                    (results[i].get("couponPkg")).get("amount") + "," +
                    (results[i].createdAt).format('yyyy-MM-dd hh:mm') + "\n";
            }
            content += tempStr;
            return cbFun(content);
        },
        error: function (error) {
            return cbFun(content, error);
        }
    });
}

module.exports = router;
