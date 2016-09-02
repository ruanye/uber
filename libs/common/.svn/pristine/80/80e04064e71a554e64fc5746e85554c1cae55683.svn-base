/**
 * Created by Diluka on 2016-05-31.
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
const _ = require("underscore");
const moment = require("moment");

module.exports = function (headers, list, filename, res) {

    let header = _.map(headers, function (o) {
        return '"' + o.title + '"';
    }).join(",");

    let csv = "\uFEFF" + header + "\n";
    list.forEach(function (o) {
        let line = [];
        _.each(headers, function (item) {
            let value = o[item.name];
            switch (item.type) {
                case "phone":
                case "string":
                    line.push('"\t' + value + '"');
                    break;
                case "date":
                    line.push('"' + moment(value).format("YYYY-MM-DD") + '"');
                    break;
                case "datetime":
                    line.push('"' + moment(value).format("YYYY-MM-DD HH:mm:ss") + '"');
                    break;
                default:
                    line.push(value + "");
            }
        });
        csv += line.join(",") + "\n";
    });

    // 设置 header 使浏览器下载文件
    res.setHeader('Content-Description', 'File Transfer');
    res.setHeader('Content-Type', 'application/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename) + '.csv');
    res.setHeader('Expires', '0');
    res.setHeader('Cache-Control', 'must-revalidate');

    res.send(csv);
};
