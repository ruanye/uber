/**
 * Created by yebo on 16/06/14.
 */
var _ = require("lodash");
var express = require("express");

module.exports = function (options) {
    var opts = _.extend({
        AV: require("leanengine"),
        app: express(),
        adminPath: "admin",
        prefix: "/vote",
        context: "libs/"
    }, options);

    var app = opts.app;
    var prefix = opts.prefix;
    var adminPath = opts.adminPath;
    var context = opts.context;

    app.use("/"+adminPath, express.static(context + "vote-promo/public/admin"));

    app.use(prefix, require('./routes/vote'));
};
