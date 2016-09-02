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
	//输入手机号点击获得promo码,如果type!=undefined则是先获得券再输入手机号
	savePhone:function(type){
		var phoneNumber = $("#phoneNumber").val();
		var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
		if(phoneNumber.length == 0||phoneNumber.length != 11||(!reg.test(phoneNumber))) {
			$("#errorInfo").html("<font color='red'>请填写有效的手机号码</font>");
			return;
		}
		$(".myContainer").hide();
		if(type!=undefined){
			CarCoupon.syncDataToUber(GetRequest()["uuid"],phoneNumber);
		}else{
			window.location="./winPrize.html?activityId="+CarCoupon.activityId+"&uuid="+phoneNumber+"&phone="+phoneNumber;
		}
	},
	//获得promo码之前加载活动信息
	getStartDetail:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				$("#testMsg").html(result.shareContent);
				if(result.validate==true){
					CarCoupon.couponObj=result;
					var uuid=GetRequest()["uuid"];
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
	//获得promo码
	getCouponPkgData:function(phoneNumber){
		AV.Cloud.run("mobile_promo_save",{activityId:CarCoupon.activityId,phoneNumber:phoneNumber},{
			success:function(isarr){
				if(isarr.status!=0){
					if(isarr.usedUrl.length>0){
						$("#convert_btn").attr("onclick","window.location='"+isarr.usedUrl+"'");
						if(isarr.status==1){
							$(".first").html(CarCoupon.couponObj.successHint);
						}else if(isarr.status==2){
							$(".first").html(CarCoupon.couponObj.hasOneHint);
						}
					}else{
						if(isarr.status==1){
							$(".first").html(CarCoupon.couponObj.successHint);
							var phone=GetRequest()["phone"];
							//如果手机号号为空，则输入手机号，否则直接点击同步
							if(phone==undefined){
								$("#convert_btn").val("点击同步");
								$("#convert_btn").attr("onclick","CarCoupon.showPhone()");
							}else{
								CarCoupon.syncDataToUber(phoneNumber,phone);
							}
						}else if(isarr.status==2){
							$(".first").html(CarCoupon.couponObj.hasOneHint);
							$("#convert_btn").val("领取成功!");
						}
					}
					$(".second").html("抢到"+replaceBr(isarr.remark));

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
	},
	//同步券
	syncDataToUber:function(phone,realPhone){
		$("#convert_btn").val("同步中...");
		var params={phone:phone,type:"promo",activityId:CarCoupon.activityId,realPhone:realPhone};
		AV.Cloud.run("mobile_uber_sync",params,{
			success:function(){
				$("#convert_btn").val("领取成功!");
			},
			error:function(error){
				$("#convert_btn").val("同步失败!");
			}
		});
	},
	//活动结束或者没promo进入的结束页面
	getEndDetail:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				$(".second").html(result.endContent);
				$("#testMsg").val(result.shareContent);
			},
			error:function(error){
				if(error.message.shareContent!=undefined){
					$(".second").html(error.message.msg);
					$("#testMsg").html(error.message.shareContent);
				}else{
					$(".second").html(error.message);
				}
			}
		});
	}
}

function redirectUrl(){
	var url="./nothing.html?activityId="+CarCoupon.activityId;
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