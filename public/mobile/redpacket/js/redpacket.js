var CarCoupon={
	activityId:"",
	couponObj:null,
	//获得活动信息
	getActivity:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				if(result.validate==true){
					//robType 1-带参uuid,0-输入phone
					$(".drawBtn").attr("onclick","CarCoupon.showPhone()");
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
	//显示输入手机号的隐藏域
	showPhone:function(){
		$(".myContainer").show();
	},
	//输入手机号点击获得promo码,如果type!=undefined则是先获得券再输入手机号
	savePhone:function(){
		var phoneNumber = $("#phoneNumber").val();
		var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
		if(phoneNumber.length == 0||phoneNumber.length != 11||(!reg.test(phoneNumber))) {
			$("#errorInfo").html("<font color='red'>请填写有效的手机号码</font>");
			return;
		}
		$(".myContainer").hide();
		window.location="./winPrize.html?activityId="+CarCoupon.activityId+"&uuid="+phoneNumber+"&phone="+phoneNumber;
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
						CarCoupon.syncHasUsedUrlDataToUber(phoneNumber,phoneNumber);
						$("#convert_btn").attr("onclick","window.location='"+isarr.usedUrl+"'");
						if(isarr.status==1){
							$(".first").html(CarCoupon.couponObj.successHint);
						}else if(isarr.status==2){
							$(".first").html(CarCoupon.couponObj.hasOneHint);
						}
					}else{
						if(isarr.status==1){
							$(".first").html(CarCoupon.couponObj.successHint);
							$("#convert_btn").val("领取");
							$("#convert_btn").attr("onclick","CarCoupon.syncDataToUber('"+phoneNumber+"','"+phoneNumber+"')");
							
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
	//同步非商家券
	syncDataToUber:function(phone,realPhone){
		$("#convert_btn").val("领取中...");
		var params={phone:phone,type:"promo",activityId:CarCoupon.activityId,realPhone:realPhone};
		AV.Cloud.run("mobile_uber_sync",params,{
			success:function(data){
				$("#convert_btn").val(data.msg);
				$("#convert_btn").attr("onclick","window.location='"+data.url+"'");
			},
			error:function(error){
				$("#convert_btn").val("同步失败!");
			}
		});
	},
	//即使是商家券也同步一下，避免商家券捆绑有乘车券
	syncHasUsedUrlDataToUber:function(phone,realPhone){
		var params={phone:phone,type:"promo",activityId:CarCoupon.activityId,realPhone:realPhone};
		AV.Cloud.run("mobile_uber_sync",params,{});
	},
	//活动结束或者没promo进入的结束页面
	getEndDetail:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				$("#end_p").html(result.endContent);
				$("#testMsg").val(result.shareContent);
			},
			error:function(error){
				if(error.message.shareContent!=undefined){
					$("#end_p").html(error.message.msg);
					$("#testMsg").html(error.message.shareContent);
				}else{
					$("#end_p").addClass("second");
					$("#end_p").html(error.message);
				}
			}
		});
	}
}

//跳转错误获得失败的url
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