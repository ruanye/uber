/**
 * Created by Diluka on 2016-05-23.
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

var _ = require("underscore");

/**
 * 示例
 * @type {*[]}
 */
var example = [
    {
        "name": "网站后台管理",
        "id": "userMeun",
        "children": [{"name": "首页管理", "id": "indexSet", "url": "indexSet.html;"}, {
            "name": "接单率数据",
            "id": "uploaddata",
            "url": "upldata.html;"
        }, {"name": "巅峰溢价提示语编辑", "id": "calculatorEditor", "url": "calculatorEditor.html;"}, {
            "name": "文章管理",
            "id": "articleList",
            "url": "articleList.html?v=1;"
        }, {"name": "司机用户分组", "id": "mobileUserList", "url": "mobileUserList.html;"}, {
            "name": "分组设置",
            "id": "userGroup",
            "url": "userGroup.html;"
        }, {"name": "司机用户tag管理", "id": "userTag", "url": "userTag.html;"}, {
            "name": "抽奖访问统计",
            "id": "tagDrawCount",
            "url": "tagDrawCount.html;"
        }, {"name": "客服管理员", "id": "customerAdminList", "url": "customerAdminList.html;"}, {
            "name": "超级组管理",
            "id": "superGroup",
            "url": "superGroup.html;"
        }, {"name": "头衔管理", "id": "honor_li", "url": "honor.html;"}]
    }, {
        "name": "活动管理",
        "id": "actMenu",
        "children": [{"name": "红包管理", "id": "redPacket", "url": "redPacket.html?v=1;"}, {
            "name": "抽奖规则",
            "id": "drawSet",
            "url": "drawSet.html;"
        }, {"name": "福利劵", "id": "welfareCoupon", "url": "welfareCoupon.html;"}, {
            "name": "大转盘",
            "id": "bigTurntable",
            "url": "bigTurntable.html;"
        }, {"name": "大转盘设置", "id": "bigTurntableSet", "url": "bigTurntableSet.html;"}]
    }, {
        "name": "APP后台管理",
        "id": "articleMenu",
        "children": [{"name": "App菜单管理", "id": "homeSetList", "url": "homeSetList.html;"}, {
            "name": "广告配置",
            "id": "advList_li",
            "url": "advList.html;"
        }, {"name": "区域菜单配置", "id": "appMenuSetList", "url": "appMenuSet.html?v=8;"}, {
            "name": "消息推送",
            "id": "msgPush",
            "url": "msgPush.html?v=7;"
        }, {"name": "消息类型", "id": "msg-type-list", "url": "msg-type-list.html;"}, {
            "name": "首页桌面项管理",
            "id": "activityItemManger",
            "url": "activity_item_list.html;"
        }, {"name": "封面上传", "id": "uploadTitlePage", "url": "uploadTitlePage.html;"}, {
            "name": "福利专区",
            "id": "welfareAreaManger",
            "url": "welfareArea.html;"
        }, {"name": "司机年终回顾", "id": "driverAnnual", "url": "driverAnnualList.html;"}, {
            "name": "服务区域设置",
            "id": "areaPoint",
            "url": "areaPoint.html;"
        }, {"name": "导出用户", "id": "exportUser", "url": "exportUser.html;"}, {
            "name": "跑单达人",
            "id": "runMaster",
            "url": "runMaster.html;"
        }, {"name": "东莞专区", "id": "dongGuan", "url": "dongGuan.html;"}]
    }, {
        "name": "租赁公司管理",
        "id": "rentCompanyMenu",
        "children": [{"name": "租赁公司", "id": "rentCompany_li", "url": "rentCompanys.html;"}, {
            "name": "导入车主",
            "id": "rentDrvierInfo_li",
            "url": "rentDriverInfo.html;"
        }, {"name": "司机接单信息", "id": "rentDriver_li", "url": "rentDriver.html;"}, {
            "name": "奖励达标设置",
            "id": "rentdrawBench_li",
            "url": "rentdrawBench.html;"
        }, {"name": "租赁公司账单", "id": "rentBill_li", "url": "rentBill.html;"}, {
            "name": "通知",
            "id": "rentNotice_li",
            "url": "rentNotice.html;"
        }]
    }, {
        "name": "客服管理",
        "id": "custom",
        "children": [{"name": "客服管理", "id": "customersList", "url": "customersList.html;"}, {
            "name": "问题分类",
            "id": "problemsList",
            "url": "problemsList.html;"
        }, {"name": "所有问题", "id": "problemAll", "url": "problemAll.html;"}, {
            "name": "客服接收问题设置",
            "id": "problemSet",
            "url": "problemSet.html;"
        }, {"name": "客服提问次数设置", "id": "problemTimeSet", "url": "problemTimeSet.html;"}, {
            "name": "客服工作量统计",
            "id": "customersCountList",
            "url": "customersCountList.html;"
        }]
    }, {
        "name": "统计",
        "id": "statistics_ul",
        "children": [{"name": "登录统计", "id": "loginsta_li", "url": "loginsta.html;"}, {
            "name": "注册统计",
            "id": "registersta_li",
            "url": "registersta.html;"
        }, {"name": "活跃度统计", "id": "statistics_li", "url": "statistics.html;"}, {
            "name": "周活跃度统计",
            "id": "statisticsWeek_li",
            "url": "statisticsWeek.html;"
        }]
    }
];

/**
 *
 * @param menu
 * @param user
 * @param options
 */
module.exports = function (menu, user, options) {
    options = _.extend({
        changePassword: true
    }, options);
    var username = user.get("username");
    var html = "";

    html += "";
    _.each(menu, function (m1) {
        if (_.isArray(m1["users"]) && _.indexOf(m1["users"], username) === -1) {
            return;
        }

        html += "<div class=\"menu-first\" ><a href=\"#" + m1.id + "\" data-toggle=\"collapse\" style=\"color: #428BCA;font-size: 16px;text-shadow:none;\">" + m1.name + "</a></div>";

        html += "<ul id=\"" + m1.id + "\" class=\"nav nav-list collapse menu-second\">";
        _.each(m1.children, function (m2) {
            if (_.isArray(m2["users"]) && _.indexOf(m2["users"], username) === -1) {
                return;
            }

            html += "<li role=\"presentation\" id=\"" + m2.id + "\"><a href=\"#\" aria-controls=\"profile\" role=\"tab\" data-toggle=\"tab\" onclick=\"javascript:location.href='" + m2.url + "';\">" + m2.name + "</a></li>";
        });
        html += "</ul>";

    });

    if (options.changePassword) {
        html += "<li role=\"presentation\"><a href=\"#\" aria-controls=\"profile\" role=\"tab\" data-toggle=\"tab\" onclick=\"javascript:location.href='cgepwd.html';\" style=\"color: #428BCA;font-size: 16px;text-shadow:none;\">修改密码</a></li>";
    }

    html += "<li role=\"presentation\"><a href=\"#\" aria-controls=\"profile\" role=\"tab\" data-toggle=\"tab\" onclick=\"javascript:logout();\" style=\"color: #428BCA;font-size: 16px;text-shadow:none;\">退出</a></li>";


    return html;
};

/**
 * 将以下代码复制到浏览器可以获取当前页面菜单的JSON结构
 * @private
 */
function _extractMenu() {
    var menu = [];
    $(".sidebar-menu").find(".menu-first a").each(function () {
        var m1 = {
            name: $.trim($(this).text()),
            id: $(this).attr("href").substring(1),
            children: []
        };
        $("#" + m1.id).find("li").each(function () {
            $(this).attr("id");
            $.trim($(this).text());
            var m2 = {
                name: $.trim($(this).text()),
                id: $(this).attr("id"),
                url: $(this).find("a").attr("onclick").replace("javascript:location.href='", "").replace("';", "")
            };

            m1.children.push(m2);
        });
        menu.push(m1);
    });


    return JSON.stringify(menu);
}
