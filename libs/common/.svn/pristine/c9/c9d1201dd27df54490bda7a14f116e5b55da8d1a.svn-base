/**
 * Created by Diluka on 2016-07-08.
 *
 *
 * ----------- 神 兽 佑 我 -----------
 *        ┏┓      ┏┓+ +
 *       ┏┛┻━━━━━━┛┻┓ + +
 *       ┃          ┃
 *       ┣     ━    ┃ ++ + + +
 *      ████━████   ┃+
 *       ┃          ┃ +
 *       ┃  ┴       ┃
 *       ┃          ┃ + +
 *       ┗━┓      ┏━┛  Code is far away from bug
 *         ┃      ┃       with the animal protecting
 *         ┃      ┃ + + + +
 *         ┃      ┃
 *         ┃      ┃ +
 *         ┃      ┃      +  +
 *         ┃      ┃    +
 *         ┃      ┗━━━┓ + +
 *         ┃          ┣┓
 *         ┃          ┏┛
 *         ┗┓┓┏━━━━┳┓┏┛ + + + +
 *          ┃┫┫    ┃┫┫
 *          ┗┻┛    ┗┻┛+ + + +
 * ----------- 永 无 BUG ------------
 */
"use strict";
var fs = require('fs');
var path = require("path");
var _ = require("underscore");
var express = require("express");

var publicRoutes = [];

function getAllFiles(root) {
    var res = [], files = fs.readdirSync(root);
    files.forEach(function (file) {
        var pathname = root + '/' + file
            , stat = fs.lstatSync(pathname);

        if (!stat.isDirectory()) {
            res.push(pathname);
        } else {
            res = res.concat(getAllFiles(pathname));
        }
    });
    return res;
}

getAllFiles(path.resolve(__dirname, "public-api")).forEach(function (file) {
    publicRoutes.push(require(file));
});

module.exports = function (options) {
    var opts = _.extend({
        AV: require("leanengine"),
        app: express(),
        publicPrefix: "/common-public-api",
        adminPrefix: "/common-private-api"
    }, options);

    var app = opts.app;
    var publicPrefix = opts.publicPrefix;

    publicRoutes.forEach(function (router) {
        app.use(publicPrefix, router);
    });
};
