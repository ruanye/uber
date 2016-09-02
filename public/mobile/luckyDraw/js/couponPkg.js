var CarCoupon={
	activityId:"",
	couponObj:null,
	//获得活动信息
	getActivity:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				if(result.validate==true){
					//robType 1-带参uuid,0-输入phone
					var uuid=GetRequest()["uuid"];
					if(uuid==undefined||(uuid.trim()).length==0){
						$(".drawBtn").attr("onclick","CarCoupon.showPhone()");
					}else{
						$(".drawBtn").attr("onclick","CarCoupon.getCouponPkg('"+uuid+"')");
					}
					$(".title").html(result.name)
					$(".first").html(replaceBr(result.couponHint));
				}
				else{
					redirectUrl();
				}
			},
			error:function(error){
				redirectUrl();
			}
		});
	},
	//获得uuid跳转获得券包
	getCouponPkg:function(uuid){
		window.location="./winPrize.html?activityId="+CarCoupon.activityId+"&uuid="+uuid;
	},
	//显示输入手机号的隐藏域
	showPhone:function(){
		$(".myContainer").show();
	},
	//输入手机号点击获得promo码
	savePhone:function(){
		var phoneNumber = $("#phoneNumber").val();
		var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
		if(phoneNumber.length == 0||phoneNumber.length != 11||(!reg.test(phoneNumber))) {
			$("#errorInfo").html("<font color='red'>请填写有效的手机号码</font>");
			return;
		}
		window.location="./winPrize.html?activityId="+CarCoupon.activityId+"&uuid="+phoneNumber;
	},
	//获得promo码之前加载活动信息
	getStartDetail:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				$("#testMsg").html(result.shareContent);
				if(result.validate==true){
					CarCoupon.couponObj=result;
					var uuid=GetRequest()["uuid"];
					if(uuid==undefined||uuid.length==0){
						redirectUrl("notuuid");
						return;
					}
					CarCoupon.getCouponPkgData(uuid);
				}
				else{
					redirectUrl();
				}
			},
			error:function(error){
				redirectUrl();
			}
		});
	},
	//活动结束或者没promo进入的结束页面
	getEndDetail:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				var uuid=GetRequest()["uuid"];
				if(uuid==undefined){
					$(".second").html(result.endContent);
				}else{
					$(".second").html("uuid不存在");
				}
				$("#testMsg").val(result.shareContent);
			},
			error:function(error){
				if(error.message.shareContent!=undefined){
					var uuid=GetRequest()["uuid"];
					if(uuid==undefined){
						$(".second").html(error.message.msg);
					}else{
						$(".second").html("uuid不存在");
					}
					$("#testMsg").html(error.message.shareContent);
				}else{
					$(".second").html(error.message);
				}
			}
		});
	},
	//获得promo码
	getCouponPkgData:function(phoneNumber){
		AV.Cloud.run("mobile_promo_save",{activityId:CarCoupon.activityId,phoneNumber:phoneNumber},{
			success:function(isarr){
				if(isarr.status!=0){
					if(isarr.usedUrl){
						$(".viewsBtn").attr("onclick","window.location='"+isarr.usedUrl+"'");
					}else{
						$(".viewsBtn").html("24小时内生效，请届时查看Uber App中的“优惠”");
						$(".viewsBtn").css("color","#fff");
						$(".viewsBtn").css("font-size","20px");
					}
					$(".second").html("抢到"+replaceBr(isarr.remark));
					if(isarr.status==1){
						$(".first").html(CarCoupon.couponObj.successHint);
						syncDataToUber(phoneNumber,"promo",CarCoupon.activityId);
					}else if(isarr.status==2){
						$(".first").html(CarCoupon.couponObj.hasOneHint);
					}

					if(isarr.code!=undefined){
						$(".third").html(isarr.code);
					}
				}else{
					redirectUrl();
				}
			},
			error:function(error){
				redirectUrl();
			}
		});
	}
}

function redirectUrl(uuid){
	var url="./nothing.html?activityId="+CarCoupon.activityId;
	if(uuid!=undefined){
		url+="&uuid=x";
	}
	window.location=url;
}

/**
 * 处理换行
 * @param str 字符串
 * @returns 处理后文本
 */
function replaceBr(str){
    if(!str){
        return "";
    }
    str=str.trim();
    var returnVal = str.replace(/\n/g, "<br>");
    return returnVal;
}
//关闭信息提示层
function closediv(){
	$("#divShow2").hide();
}