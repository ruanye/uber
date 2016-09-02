var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var urlQuery = require("url");

var express=require('express');
var router=express();

var ActivityCar = AV.Object.extend("ActivityCar");
var PromoCodeObj = AV.Object.extend("PromoCode");
var PromoUserObj = AV.Object.extend("PromoUser");

//抢promo码
router.get("/mobile/*",function(request,response){
	var uuid = urlQuery.parse(request.url,true).query.uuid;
	var actId=request.params["0"];
	
	//当玩玩游戏后传入该参数
	var redirect = urlQuery.parse(request.url,true).query.redirect;
	
	if(!actId){
		return response.send("错误活动");
	}
	var query=new AV.Query(ActivityCar);
	query.get(actId,{
		success:function(data){
			if(!data){
				return response.send("错误活动");
			}
			
			var url="../../mobile/promo/promo.html?activityId="+actId;
			var appUrl=data.get("appUrl")+"?activityId="+actId;;
			if(data.get("appUrl")){
				url=appUrl;
			}
			//如果该参数不存在，则认为是第一次进入，否则跳转抢券链接
			if(!redirect){
				var gameType=data.get("gameType");
				//如果游戏类型不等于0，则有游戏，跳转向游戏首页
				if(gameType!="0"){
					url="../../mobile/game/"+gameType+"/index.html?activityId="+actId;
				}
			}
			if(uuid){
				url=url+"&uuid="+uuid;
			}
			return response.redirect(url);
			
//			var url="../../mobile/promo/promo.html?activityId="+actId;
//			var gameType=data.get("gameType");
//			if(gameType!="0"){
//				url="../../mobile/game/"+gameType+"/index.html?activityId="+actId;
//			}
//			if(uuid){
//				url=url+"&uuid="+uuid;
//			}
//			return response.redirect(url);
		},
		error:function(error){
			return response.send("错误活动");
		}
	});
});

//查询参与人数
AV.Cloud.define("admin_promo_partcount",function(request,response){
	var activityId = request.params.activityId;
	var query=new AV.Query(PromoUserObj);
	query.equalTo("actId",activityId);
	query.count({
		success:function(count){
			return response.success(count);
		},
		error:function(error){
			return response.error(error);
		}
	});
});

//判断是否存活动
AV.Cloud.define("mobile_promo_detail", function (request, response) {
    var activityId = request.params.activityId;
    mobile_promoDetail(activityId,function(error,obj){
    	if(error!=null){
    		return response.error(error);
    	}
    	return response.success(obj);
    });
});

function mobile_promoDetail(activityId,cb){
    var query=new AV.Query(ActivityCar);
    query.get(activityId, {
        success: function(obj) {
            if(!obj){
            	return cb("没有这个活动");
            }
            if(new Date(obj.get("cutoffDate")).getTime()<new Date().getTime()||obj.get("isEffective")==0){
            	return cb({msg:"活动已经结束啦",shareContent:obj.get("sharecontent")});
            }
            var query = new AV.Query(PromoCodeObj);
            query.equalTo("actId", activityId);
            query.count({
                success: function(count) {
                    var validate =true;
                    if(count==0){
                      validate =false;
                    }
                    returnObj={codeCount:count,"robType":obj.get("robType"),"validate":validate,
                    		"shareContent":obj.get("sharecontent"),"hasOneHint":obj.get("repeatContent"),
                    		"successHint":obj.get("successContent"),"couponHint":obj.get("couponContent"),
                    		"endContent":obj.get("endContent"),"name":obj.get("name")};
                    return cb(null,returnObj);
                },
                error: function(error) {
                	return cb("查询当前可领取乘车券种类时出错");
                }
            });
        },
        error: function(object, error) {
            return cb("获得活动失败");
        }
    });
}

//获得promo码
AV.Cloud.define("mobile_promo_save",function(request,response){
	var activityId = request.params.activityId;
	var phoneNumber=request.params.phoneNumber;
	//判断活动是否有效
	mobile_promoDetail(activityId,function(error,obj){
    	if(error!=null){
    		return response.error(error);
    	}
    	//判断该用户是否已经获得promo
    	var query=new AV.Query(PromoUserObj);
    	query.equalTo("actId",activityId);
    	query.equalTo("phoneNumber",phoneNumber);
    	query.first({
    		success:function(promoUser){
    			if(!promoUser){
    				//先判断promo码是否已被抢完，已抢用户、promo码数量-比较
    				var query=new AV.Query(PromoUserObj);
    		    	query.equalTo("actId",activityId);
    		    	query.count({
    		    		success:function(count){
    		    			if(count>=obj.codeCount){
    		    				return response.error("promo码已被抢完");
    		    			}
    		    			//未获得promo码，新建用户
    	    				var promoUser=new PromoUserObj();
    	    				promoUser.fetchWhenSave(true);
    	    				promoUser.set("actId",activityId);
    	    				promoUser.set("phoneNumber",phoneNumber);
    	    				promoUser.save(null,{
    	    					success:function(promoUser){
    	    						query=new AV.Query(PromoUserObj);
    	    						query.equalTo("actId",activityId);
    	    						query.lessThanOrEqualTo("row",promoUser.get("row"));
    	    						query.count({
    	    							success:function(count){
    	    								//获得排序，通过排序取得promo码
    	    								query=new AV.Query(PromoCodeObj);
    	    								query.equalTo("actId",activityId);
    	    								query.skip(count-1);
    	    								query.limit(1);
    	    								query.ascending("createdAt");
    	    								query.find({
    	    									success:function(list){
    	    										if(list.length==0){
    	        										//promo码池已被领完
    	    											return response.success({status:0});
    	    										}else{
    	    											//获得码保存到promo用户中
    	    											var promoCode=list[0];
    	    											var code=promoCode.get("code");
    	    											var remark=promoCode.get("remark");
    	    											var couponUrl=promoCode.get("couponUrl");
    	    											var usedUrl=promoCode.get("usedUrl");
    	    											promoUser.set("code",code);
    	    											promoUser.set("remark",remark);
    	    											promoUser.set("couponUrl",couponUrl);
    	    											promoUser.set("usedUrl",usedUrl);
    	    											promoUser.save(null,{
    	    												success:function(promoUser){
    	    													return response.success({status:1,code:code,remark:remark,usedUrl:usedUrl});
    	    												},
    	    												error:function(promoUser,error){
    	    													return response.error(error);
    	    												}
    	    											});
    	    										}
    	    									},
    	    									error:function(error){
    	    										return response.error(error);
    	    									}
    	    								});
    	    							},
    	    							error:function(error){
    	    								return response.error(error);
    	    							}
    	    						});
    	    					},
    	    					error:function(promoUser,error){
    	    						return response.error(error);
    	    					}
    	    				});
    		    		},
    		    		error:function(error){
    		    			return response.error(error);
    		    		}
    		    	});
    			}else{
    				//如果并发获得码，promo码可能为未定义，照boss要求，不做处理
    				//实际情况如果加入新码，那个对应码依然没人领取
    				//若处理可如下，先判断码是否存在，如果存在直接返回，否则获得对应码，保存即可
    				
    				//已获得promo码
    				return response.success({status:2,code:promoUser.get("code"),
    					remark:promoUser.get("remark"),usedUrl:promoUser.get("usedUrl")});
    			}
    		},
    		errro:function(error){
    			return response.error(error);
    		}
    	});
	 });
});

module.exports = [AV.Cloud,router];