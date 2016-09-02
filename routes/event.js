var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var appId=process.env.LC_APP_ID;
var appKey=process.env.LC_APP_KEY;
var masterKey=process.env.LC_APP_MASTER_KEY;

AV.Cloud.define("admin_event",function(request,response){
	var user=request.user;
	if(!(user&&user.get("username")=="admin")){
		return response.error("用户错误");
	}
	var event=request.params.event;
	var start=request.params.start;
	var end=request.params.end;
	var url='https://api.leancloud.cn/1.1/stats/appmetrics?metrics=event_count&event='+event;
	if(start&&start.length!=0){
		url+="&start="+start;
	}else{
		url+="&start=20150601";
	}
	if(end&&end.length!=0){
		url+="&end="+end;
	}else{
		url+="&end="+new Date().format('yyyyMMdd');
	}
	AV.Cloud.httpRequest({
		method: 'GET',
		url: url,
		headers: {
			'Content-Type': 'application/json',
			'X-LC-Id': appId,
			'X-LC-Key': masterKey+",master"
		},
		success: function(httpResponse) {
			response.success(httpResponse.data);
		},
		error: function(httpResponse) {
			response.error(httpResponse);
		}
	});
});
//获得常规事件统计信息
AV.Cloud.define("admin_normalevent",function(request,response){
	var user=request.user;
	if(!(user&&user.get("username")=="admin")){
		return response.error("用户错误");
	}
	var event=request.params.event;
	var start=request.params.start;
	var end=request.params.end;
	var url='https://api.leancloud.cn/1.1/stats/appmetrics?metrics='+event;
	if(start&&start.length!=0){
		url+="&start="+start;
	}else{
		url+="&start=20150601";
	}
	if(end&&end.length!=0){
		url+="&end="+end;
	}else{
		url+="&end="+new Date().format('yyyyMMdd');
	}
	
	var androidUrl=url+"&platform=android";
	var iosUrl=url+"&platform=iOS";
	AV.Cloud.httpRequest({
		method: 'GET',
		url: androidUrl,
		headers: {
			'Content-Type': 'application/json',
			'X-LC-Id': appId,
			'X-LC-Key': masterKey+",master"
		},
		success: function(httpResponse) {
			var androidData=httpResponse.data;
			AV.Cloud.httpRequest({
				method: 'GET',
				url: iosUrl,
				headers: {
					'Content-Type': 'application/json',
					'X-LC-Id': appId,
					'X-LC-Key': masterKey+",master"
				},
				success: function(httpResponse) {
					var data={};
					var iosData=httpResponse.data;
					for (var key in androidData.data) {
						data[key]=iosData.data[key]+androidData.data[key];
					} 
					response.success({"data":data});
				},
				error: function(httpResponse) {
					response.error(httpResponse);
				}
			});
		},
		error: function(httpResponse) {
			response.error(httpResponse);
		}
	});
});

AV.Cloud.define("admin_readCount_event",function(request,response){
	var user=request.user;
	if(!(user&&user.get("username")=="admin")){
		return response.error("用户错误");
	}
	var event=request.params.event;
	var start=request.params.start;
	var end=request.params.end;
	var metrics = request.params.metrics;
	var url='https://api.leancloud.cn/1.1/stats/appmetrics?metrics='+metrics+'&event='+event;
	if(start&&start.length!=0){
		url+="&start="+start;
	}else{
		url+="&start=20150601";
	}
	if(end&&end.length!=0){
		url+="&end="+end;
	}else{
		url+="&end="+new Date().format('yyyyMMdd');
	}
	AV.Cloud.httpRequest({
		method: 'GET',
		url: url,
		headers: {
			'Content-Type': 'application/json',
			'X-LC-Id': appId,
			'X-LC-Key': masterKey+",master"
		},
		success: function(httpResponse) {
			response.success(httpResponse.data);
		},
		error: function(httpResponse) {
			response.error(httpResponse);
		}
	});
});

AV.Cloud.define("admin_allevent",function(request,response){
	var user=request.user;
	if(!(user&&user.get("username")=="admin")){
		return response.error("用户错误");
	}
	var event=request.params.event;
	var body={};
	body.client={
		"id":event,
		"app_version":"1.8.6",
	    "app_channel":"weixin"
	}
	body.events=
		[
	             {
	            	 "event": "_page",
	            	 "duration": 2000,
	            	 "tag": event
	             },
	             {"event":event},
	             {
	                 "event": "_session.close",
	                 "duration": 10000
	             }
	     ];
	AV.Cloud.httpRequest({
		method: 'POST',
		url: 'https://api.leancloud.cn/1.1/stats/open/collect',
		headers: {
			'Content-Type': 'application/json',
			'X-LC-Id': appId,
			'X-LC-Key': appKey
		},
		body: body,
		success: function(httpResponse) {
			response.success(httpResponse);
		},
		error: function(httpResponse) {
			response.error(httpResponse);
		}
	});
});

AV.Cloud.define("admin_event_usertype_count",function(request,response){
	var user=request.user;
	if(!(user&&user.get("username")=="admin")){
		return response.error("用户错误");
	}
	var times=request.params.times;
	var timeslist = times.split(",");
	var list = [];
	doQuery(0,list,timeslist,response);
})


function doQuery(i,dataList,timeslist,response){
	var time = timeslist[i].split(":");
	var query=new AV.Query(AV.User);
	query.greaterThan("createdAt",new Date(time[0]));
	query.lessThan("createdAt",new Date(time[1]));
	query.equalTo("userType",1);
	query.count({
		success:function(count){
			dataList.push(count);
			if(i==(timeslist.length-1)){
				response.success(dataList);
			}else{
				doQuery(++i,dataList,timeslist,response);
			}
		} ,
		error:function(error){

		}
	});
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


//统计用户数
AV.Cloud.define("select_user_count",function(request,response) {
	var user=request.user;
	if(user==null||user==undefined||user.get("username")!="admin"){
		return response.error("登录用户错误");
	}

	var sql = "select count(*) from _User where userType=1";

	AV.Query.doCloudQuery(sql, {
		success: function (result) {
			var count = result.count;
			response.success("当前注册人数：" + count);
		},
		error: function (err) {
			response.error(err.message);
		}
	});


});


//统计用户数
AV.Cloud.define("statUser",function(request,response) {
  var user=request.user;
  if(user==null||user==undefined||user.get("username")!="admin"){
      return response.error("登录用户错误");
  }

  var sql = "select count(*) from _User where userType=1";

  AV.Query.doCloudQuery(sql, {
      success: function (result) {
          var count = result.count;
          response.success("当前注册人数：" + count);
      },
      error: function (err) {
          response.error(err.message);
      }
  });


});

//统计自定义事件查看用户数，查看次数
AV.Cloud.define("admin_usercount_event",function(request,response){
	var user=request.user;
	if(!(user&&user.get("username")=="admin")){
		return response.error("用户错误");
	}
	var event=request.params.event;
	var start=request.params.start;
	var end=request.params.end;
	var metrics = request.params.metrics;
	var eventlabel=request.params.eventlabel;
	var url='https://api.leancloud.cn/1.1/stats/appmetrics?metrics='+metrics+'&event='+event;
	if(eventlabel!=undefined){
		url+="&event_label="+eventlabel;
	}
	if(start&&start.length!=0){
		url+="&start="+start;
	}else{
		url+="&start=20150601";
	}
	if(end&&end.length!=0){
		url+="&end="+end;
	}else{
		url+="&end="+new Date().format('yyyyMMdd');
	}
	AV.Cloud.httpRequest({
		method: 'GET',
		url: url,
		headers: {
			'Content-Type': 'application/json',
			'X-LC-Id': appId,
			'X-LC-Key': masterKey+",master"
		},
		success: function(httpResponse) {
			response.success(httpResponse.data);
		},
		error: function(httpResponse) {
			response.error(httpResponse);
		}
	});
});

module.exports = [AV.Cloud];