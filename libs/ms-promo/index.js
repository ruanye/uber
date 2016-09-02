/**
 * Created by yebo on 16/06/14.
 */
var _ = require("lodash");
var express = require("express");

module.exports = function (options) {
    var opts = _.extend({
        AV: require("leanengine"),
        app: express(),
        adminPath: "/admin",
        mobilePath:'/mobile',
        context: "libs/"
    }, options);

    var app = opts.app;
    var context = opts.context;

    app.use(opts.mobilePath, express.static(context + "ms-promo/public/mobile"));
    app.use(opts.adminPath, express.static(context + "ms-promo/public/admin"));

    app.use("/ms_activity", require("./routes/msActivity.js"));
};
