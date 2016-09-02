var AV = require('leanengine');
var adminMenuCreator = require("../libs/common/AdminMenuCreator");
AV.Promise._isPromisesAPlusCompliant = false;

var menu = require("./menu.json");
var html = null;

//管理员获得菜单
AV.Cloud.define("admin_menu_list", function (request, response) {
    var user = request.user;
    if (!user) {
        return response.error("请登录");
    }

    //定义管理员菜单
    // if (!html) {
    html = adminMenuCreator(menu, user);
    // }

    response.success(html);


});

module.exports = AV.Cloud;
