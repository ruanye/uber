/**
 * 通用性操作都放在这里面 
 */

//测试环境
//var leancloudappid="ejqjbeywrxq8kt8em4b3dz9nzx9aazkgkhir3sdncv1dib4y";
//var leancloudappkey="7169kby370xvl7lzjtem06pn5wp9k2p9znltb7l9zlj4h3v8";

//////成都正式环境11
var leancloudappid="G6L62eL71dj9VxsXv81EN4L3-gzGzoHsz";
var leancloudappkey="DLWNGSe2Rkz5MXaecPVSPgG0";

AV.initialize(leancloudappid, leancloudappkey);

//本地测试，使用本地云函数
// debugMode();

function debugMode() {
    AV.setProduction(false);
    AV.User.become().then(function (user) {
        return function callCloudFunction(name, data, options) {
            options = options || {};
            return new AV.Promise(function (resolve, reject) {
                $.ajax({
                    method: "POST",
                    dataType: "json",
                    url: "/1.1/functions/" + name,
                    headers: {
                        "Content-Type": "application/json",
                        "X-LC-Id": leancloudappid,
                        "X-LC-Key": leancloudappkey,
                        "X-LC-Session": user._sessionToken
                    },
                    data: data ? JSON.stringify(data) : undefined,
                    success: function (res) {
                        resolve(res.result);
                    },
                    error: reject
                });
            }).then(function (res) {
                if (typeof options.success === "function") {
                    options.success.call(null, res);
                }
                return res;
            }).fail(function (e) {
                if (typeof options.error === "function") {
                    options.error.call(null, e);
                }
                return AV.Promise.error(e);
            });
        }
    }).then(function (func) {
        AV.Cloud.run = func;
    });
}


//乘车券
var CarCouponObj = AV.Object.extend("CarCoupon");
//获得券包用户
var UserCouponPkgObj=AV.Object.extend("UserCouponPkg");
//券包
var CouponPkgObj=AV.Object.extend("CouponPkg");
//活动名
var ActivityCar = AV.Object.extend("ActivityCar");

//html转码
function replaceSpecialCharactor(value){
    var entities = {
        '&': '&amp;',
        '>': '&gt;',
        '<': '&lt;',
        '"': '&quot;'
    }, keys = [], p, regex;

    for (p in entities) {
        keys.push(p);
    }

    regex = new RegExp('(' + keys.join('|') + ')', 'g');

   return (!value) ? value : String(value).replace(regex, function(match, capture) {
        return entities[capture];
    });
}

//html转码
function htmlDecode(value) {
    var xx = value;
    if(xx!=null) {
        xx = xx.replace("&amp;", "&").replace("&gt;", ">").replace("&lt;", "<").replace("&quot;", '"');
    }else{
        xx = "";
    }
    return xx;

}

//url请求参数
function GetRequest() {
	var url = location.search;
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(1);
		strs = str.split("&");
		for(var i = 0; i < strs.length; i ++) {
			theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
		}
	}
	return theRequest;
}

//时间格式化函数
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    } ;
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,(this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))format = format.replace(RegExp.$1,RegExp.$1.length == 1 ? o[k] :("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

//去除数组重复元素
function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}

function setSummernoteInfo(nodeElement,height){
	if(height==undefined){
		height=100;
	}
	nodeElement.summernote({
		lang: 'zh-CN',
		height: height,
		toolbar: [
            ['color',['color']],
			['style', ['style','fontname', 'fontsize', 'bold','italic','underline','strikethrough','clear']],

			['Layout', ['ul','ol','paragraph','height']],
			['Misc', ['fullscreen','codeview','undo','redo','help']],
		          ],
		onImageUpload : function(files, editor, $editable) {
			var name = (new Date().getTime())+".jpg";

			var avFile = new AV.File(name, files[0]);
			avFile.save().then(function() {
				var url=avFile.url();
				nodeElement.summernote('editor.insertImage', url);
			}, function(error) {
				console.log(JSON.stringify(error));
			});
		}
	});
}
