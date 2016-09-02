var CarCoupon={
	activityId:"",
	couponObj:null,
	//获得活动信息
	getActivity:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				if(result.validate==true){
					//robType 1-带参uuid,0-输入phone
					$(".qiang-btn").attr("onclick","CarCoupon.showPhone()");
//					$(".bainian").html(result.name)
					$(".hello-inner").html(replaceBr(result.couponHint));
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
		$("#page4").show();
	},
	//输入手机号点击获得promo码,如果type!=undefined则是先获得券再输入手机号
	savePhone:function(){
		var phoneNumber = $("#phoneNumber").val();
		var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
		if(phoneNumber.length == 0||phoneNumber.length != 11||(!reg.test(phoneNumber))) {
			$("#errorInfo").html("<font color='red'>请填写有效的手机号码</font>");
			return;
		}
		$("#page4").hide();
		$("#page1").hide();
		$("#page2").show();
		CarCoupon.getStartDetail(phoneNumber);
	},
	//获得promo码之前加载活动信息
	getStartDetail:function(phoneNumber){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				$("#share_ta").val(result.shareContent);
				if(result.validate==true){
					CarCoupon.couponObj=result;
					CarCoupon.getCouponPkgData(phoneNumber);
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
						CarCoupon.syncHasUsedUrlDataToUber(phoneNumber);
						$("#convert_btn").attr("onclick","window.location='"+isarr.usedUrl+"'");
						if(isarr.status==1){
							$(".zhufu").html(CarCoupon.couponObj.successHint);
						}else if(isarr.status==2){
							$(".zhufu").html(CarCoupon.couponObj.hasOneHint);
						}
					}else{
						if(isarr.status==1){
							$(".zhufu").html(CarCoupon.couponObj.successHint);
							$("#convert_btn").html("领取");
							$("#convert_btn").attr("onclick","CarCoupon.syncDataToUber('"+phoneNumber+"')");
							
						}else if(isarr.status==2){
							$(".zhufu").html(CarCoupon.couponObj.hasOneHint);
							$("#convert_btn").html("领取成功!");
						}
					}
					$("#robinfo").html("抢到"+replaceBr(isarr.remark));

					if(isarr.code!=undefined){
						$("#promocode").html(isarr.code);
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
		$("#convert_btn").html("领取中...");
		var params={phone:phone,type:"promo",activityId:CarCoupon.activityId};
		AV.Cloud.run("mobile_uber_sync",params,{
			success:function(data){
				$("#convert_btn").html(data.msg);
				$("#convert_btn").attr("onclick","window.location='"+data.url+"'");
			},
			error:function(error){
				$("#convert_btn").html("同步失败!");
			}
		});
	},
	//即使是商家券也同步一下，避免商家券捆绑有乘车券
	syncHasUsedUrlDataToUber:function(phone){
		var params={phone:phone,type:"promo",activityId:CarCoupon.activityIde};
		AV.Cloud.run("mobile_uber_sync",params,{});
	},
	//活动结束或者没promo进入的结束页面
	getEndDetail:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				$(".info-box").html(result.endContent);
				$("#share_ta").val(result.shareContent);
			},
			error:function(error){
				if(error.message.shareContent!=undefined){
					$(".info-box").html(error.message.msg);
					$("#share_ta").html(error.message.shareContent);
				}else{
					$(".info-box").html(error.message);
				}
			}
		});
	}
}

//跳转错误获得失败的url
function redirectUrl(){
	$("#page1").hide();
	$("#page2").hide();
	$("#page4").hide();
	$("#page3").show();
	CarCoupon.getEndDetail();
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
	$("#page5").hide();
}