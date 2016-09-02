/**
 * Created by Diluka on 2016-06-20.
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
var _ = require("underscore");
var validator = require("validator");
var moment = require("moment");

var DEFAULT_FORMAT = "YYYY-MM-DD";
var DEFAULT_LIST_SIZE = 20;

//<editor-fold desc="formatDate">
function formatDate(input) {
    if (typeof input === "string") {
        return function (object) {
            return formatAny(object, input);
        };
    }
    else {
        return formatAny(input, DEFAULT_FORMAT);
    }
}
function formatAny(input, format) {
    if (input instanceof Array) {
        input.forEach(function (element) {
            formatOne(element, format);
        });
    }
    else {
        formatOne(input, format);
    }
    return input;
}
function formatOne(object, format) {
    var o = (object && object.attributes) || object || {};
    for (var p in o) {
        if (o.hasOwnProperty(p) && o[p] instanceof Date) {
            o[p] = moment(o[p]).format(format);
        }
    }
}
//</editor-fold>

module.exports = {
    convertKeysToDate: function (keys, data) {
        keys.forEach(function (k) {
            if (_.isString(data[k]) && validator.isDate(data[k])) {
                data[k] = new Date(data[k]);
            }
            else {
                delete data[k];
            }
        });
        return data;
    },
    convertKeysToInt: function (keys, data) {
        keys.forEach(function (k) {
            if (data[k]) {
                data[k] = parseInt(data[k]);
            }
            else {
                delete data[k];
            }
        });
        return data;
    },
    formatDate: formatDate,
    debugPromiseChain: function debugPromiseChain(func) {
        if (typeof func === "function") {
            return function () {
                func.call(this, arguments);
                return arguments;
            };
        }
        else {
            console.dir(arguments);
            return arguments;
        }
    },
    setOrUnsetAttributesOfObject: function setOrUnsetAttributesOfObject(keys, data, object) {
        keys.forEach(function (f) {
            if (data[f] === null) {
                object.unset(f);
            }
            else if (data[f] !== undefined) {
                object.set(f, data[f]);
            }
        });
    },
    addPaginationToQuery: function addPaginationToQuery(paginationInfo, query) {
        paginationInfo.size = paginationInfo.size || DEFAULT_LIST_SIZE;
        if (paginationInfo.start) {
            query.skip(paginationInfo.start);
        }
        else if (paginationInfo.pageIndex) {
            query.skip((paginationInfo.pageIndex - 1) * paginationInfo.size);
        }
        query.limit(paginationInfo.size);
        return query;
    },
    addSortToQuery: function addSortToQuery(sort, query) {
        sort.forEach(function (s) {
            if (s.indexOf('+') === 0) {
                query.addAscending(s.slice(1));
            }
            else if (s.indexOf('-') === 0) {
                query.addDescending(s.slice(1));
            }
            else {
                query.addAscending(s);
            }
        });
        return query;
    },
    fieldRequiredCheck: function (keys, data, keyNames) {
        if (keyNames === void 0) {
            keyNames = {};
        }
        var result = [];
        keys.forEach(function (k) {
            if (!data[k]) {
                result.push({
                    field: k,
                    name: keyNames[k],
                    message: "\u5B57\u6BB5\uFF1A'" + (keyNames[k] || k) + "'\u4E0D\u80FD\u4E3A\u7A7A\uFF01"
                });
            }
        });
        return result.length ? result : false;
    }
};
