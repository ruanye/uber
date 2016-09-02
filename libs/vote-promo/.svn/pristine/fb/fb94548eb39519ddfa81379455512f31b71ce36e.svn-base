var express = require('express');

var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;
var SyncUber = require("../../common/SyncUber");
var syncPromoToUber = SyncUber.syncPromoToUber;

var VotePromo = AV.Object.extend("VotePromopro");
var VoteItem = AV.Object.extend("VoteItem");
var VoteUser = AV.Object.extend("VoteUser");

var router = express.Router();

function isOldUberUser(httpResponse) {
    if ((httpResponse.data.redirect_to).indexOf("apply_success") != -1) {
        return 1;
    }
    return 0;
}

function pagedQuery(query, request) {
    var pageNo = (parseInt(request.query.pageNo) || 1);
    var pageSize = (parseInt(request.query.pageSize) || 10);
    query.skip((pageNo - 1) * pageSize);
    query.limit(pageSize);
    query.descending("createdAt");
}

function syncVotePromo(promoId) {
    var query = new AV.Query(VotePromo);
    return query.get(promoId || "").then(function (votePromo) {
        if (!votePromo) {
            return AV.Promise.error({code: 1, message: "投票活动不存在。"});
        }
        var query2 = new AV.Query(VoteItem);
        query2.equalTo("promoId", promoId || "");
        return query2.find().then(function (lst) {
            var res = [];
            for (var i = 0; i < lst.length; i++) {
                var a = lst[i];
                res.push({
                    itemId: a.id, title: a.get("title"),
                    styleClass: a.get("styleClass"), couponUrl: a.get("couponUrl"),
                    logoUrl: a.get("logoUrl"), oldAmount: a.get("oldAmount"),
                    redirectUrl: a.get("redirectUrl"), usedAmount: a.get("usedAmount"),
                    intro: a.get("intro"),
                    amount: a.get("amount")
                });
            }
            votePromo.set("items", res);
            return votePromo.save();
        });
    });
}

router.post("/vote", function (request, response) {
    if (!request.body.phone) {
        response.send({code: 1, message: "电话号码不能为空"});
        return;
    }
    if (!request.body.itemId) {
        response.send({code: 1, message: "投票项ID不能为空"});
        return;
    }
    var phone = request.body.phone;
    var voteResult = {};
    var query = new AV.Query(VoteItem);
    var testUrl = "https://get.uber.com.cn/invite/uberlifetest";
    query.equalTo("objectId", request.body.itemId);
    query.find().then(function (lst) {
        if (lst.length == 0) {
            return AV.Promise.error({code: 1, message: "投票项不存在"});
        }
        var voteItem = lst[0];
        var query2 = new AV.Query(VoteUser);
        var promoId = voteItem.get("promoId");
        query2.equalTo("phone", phone);
        query2.equalTo("promoId", promoId);
        return query2.find().then(function (lst2) {
            if (lst2.length == 0) {
                var voteUser = new VoteUser();
                voteUser.set("phone", phone);
                voteUser.set("promoId", promoId);
                voteUser.set("title", voteItem.get("title"));
                return voteUser.save();
            } else {
                return AV.Promise.error({code: 1, message: "该用户已投票"});
            }
        }).then(function () {
            if (voteItem.get("usedAmount") > voteItem.get("oldAmount") + 10) { //防止uber未设置上限
                voteResult = {code: 0, coupon: "no"};
            } else {
                return syncPromoToUber(phone, voteItem.get("couponUrl") || "");
            }
        }).then(function (res) {
            if (res) {
                if (res.isEmpty == 1) {
                    voteResult = {code: 0, coupon: "no"};
                } else if (res.isOldUser == 1) {
                    voteResult = {code: 0, coupon: "yes"};
                } else {
                    voteResult = {code: 0, coupon: "no", redirect: voteItem.get("redirectUrl")};
                }
            }
        }).then(function () {
            voteItem.increment("amount");
            if (voteResult.coupon && voteResult.coupon == "yes") {
                voteItem.increment("usedAmount");
            }
            return voteItem.save();
        }).then(function () {
            return syncVotePromo(promoId);
        });
    }).then(function () {
        response.send(voteResult);
    }, function (error) {
        response.send(error);
    });
});

router.get("/list", function (request, response) {
    var query = new AV.Query(VotePromo);
    var objectId = (request.query.id || "");
    if (objectId) {
        query.equalTo("objectId", objectId);
    }
    pagedQuery(query, request);
    query.find({
        success: function (lst) {
            response.send({code: 0, lst: lst});
        },
        error: function (error) {
            response.send(error);
        }
    });
});

router.get("/record", function (request, response) {
    var query = new AV.Query(VoteUser);
    query.find().then(function (lst) {
        response.send({code: 0, lst: lst});
    }, function (error) {
        response.send(error);
    });
});

function saveItem(item, promoId) {
    if (!item.title) {
        return AV.Promise.error({code: 1, message: "标题不能为空"});
    }
    if (!item.couponUrl) {
        return AV.Promise.error({code: 1, message: "优惠券链接不能为空"});
    }
    var query = new AV.Query(VoteItem);
    query.equalTo("objectId", item.itemId || "");
    return query.find().then(
        function (lst) {
            var voteItem = (lst.length >= 1 ? lst[0] : (new VoteItem()));
            voteItem.set("promoId", promoId);
            voteItem.set("title", item.title);
            voteItem.set("intro", item.intro || "");
            voteItem.set("couponUrl", item.couponUrl);
            voteItem.set("redirectUrl", item.redirectUrl || "");
            voteItem.set("styleClass", item.styleClass || "");
            voteItem.set("logoUrl", item.logoUrl || "");
            voteItem.set("oldAmount", parseInt(item.oldAmount) || 99999999);
            if (lst.length == 0) {
                voteItem.set("amount", 0);
                voteItem.set("usedAmount", 0);
            }
            return voteItem.save();
        }
    );
}

router.post("/save", function (request, response) {
    if (!request.body.voteName) {
        response.send({code: 1, message: "投票活动标题不能为空"});
        return;
    }
    var styleClass = (request.body.styleClass || "");
    var setting = (request.body.setting || "");
    var query = new AV.Query(VotePromo);
    var promoId = (request.body.promoId || "");
    var items = JSON.parse(request.body.items || "[]");
    query.equalTo("objectId", promoId);
    query.find({
        success: function (lst) {
            var votePromo = (lst.length >= 1 ? lst[0] : (new VotePromo()));
            votePromo.set("voteName", request.body.voteName);
            votePromo.set("styleClass", styleClass);
            votePromo.set("setting", setting);
            votePromo.save().then(function () {
                promoId = promoId ? promoId : votePromo.id;
                var promises = [];
                for (var i = 0; i < items.length; i++) {
                    promises.push(saveItem(items[i], promoId));
                }
                AV.Promise.all(promises).then(function () {
                    return syncVotePromo(promoId);
                }).then(function (res) {
                    response.send({code: 0, promoId: promoId});
                }, function (error) {
                    response.send(error);
                });
            }, function (error) {
                response.send(error);
            });
        },
        error: function (error) {
            response.send(error);
        }
    });
});

router.post("/delete", function (request, response) {
    var promoId = request.body.promoId;
    if (!promoId) {
        response.send({code: 1, message: "投票活动ID不能为空"});
    }
    var query = new AV.Query(VotePromo);
    if (!request.body.itemId) {
        query.equalTo("objectId", promoId);
        query.find().then(function (lst) {
            return AV.Object.destroyAll(lst);
        }).then(function () {
            var query2 = new AV.Query(VoteItem);
            query2.equalTo("promoId", promoId);
            return query2.find().then(function (lst2) {
                return AV.Object.destroyAll(lst2);
            });
        }).then(function () {
            var query3 = new AV.Query(VoteUser);
            query3.equalTo("promoId", promoId);
            return query3.find().then(function (lst3) {
                return AV.Object.destroyAll(lst3);
            });
        }).then(function () {
            response.send({code: 0});
        }, function (error) {
            response.send(error);
        });
    } else {
        var query2 = new AV.Query(VoteItem);
        query2.equalTo("objectId", request.body.itemId);
        query2.find({
            success: function (lst) {
                AV.Object.destroyAll(lst).then(function () {
                    return syncVotePromo(promoId);
                }).then(function () {
                    response.send({code: 0});
                }, function (error) {
                    response.send(error);
                });
            },
            error: function (error) {
                response.send(error);
            }
        });
    }
});

router.get("/test", function (request, response) {
    var testUrl = "https://get.uber.com.cn/invite/拼出冠军";
    var phone = '15801004833';
    syncPromoToUber(phone, testUrl).then(function (res) {
        console.log(res);
    }, function (error) {
        console.log("error:");
        console.log(error);
    });
    response.send({code: 0});
});

module.exports = [AV.Cloud, router];
