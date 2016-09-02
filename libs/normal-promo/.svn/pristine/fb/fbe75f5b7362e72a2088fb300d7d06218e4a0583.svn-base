/**
 * Created by yebo on 16/06/14.
 */
var _ = require("underscore");
var express = require("express");

module.exports = function (options) {
    var opts = _.extend({
        AV: require("leanengine"),
        app: express(),
        adminPath: "/admin",
        context: "libs/"
    }, options);

    var app = opts.app;
    var context = opts.context;

    app.use(opts.adminPath, express.static(context + "normal-promo/public/admin"));

    app.use('/activityCar', require('./routes/activityCar'));
    app.use("/couponPkg", require('./routes/CouponPkg'));
    app.use("/userCouponPkg", require('./routes/UserCouponPkg'));
    app.use(require('./routes/carCoupon'));
    app.use(require('./routes/activityCoupon'));

    app.use('/onecoupon', require('./cloud/OneCoupon.js'));
    app.use('/morecoupon', require('./cloud/MoreCoupon.js'));
    app.use('/randommore', require('./cloud/RandomMoreCoupon.js'));
};
