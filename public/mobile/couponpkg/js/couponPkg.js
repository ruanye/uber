var endContent="";
var CarCoupon={
	activityId:"",//活动id
	isExistUuid:0,//是否存在uuid
	//获得活动信息
	getActivity:function(){
		var uuid=GetRequest()["uuid"];
		//判断uuid是否存在，如果存在则直接抢红包，否则输入手机号
		if(uuid!=undefined&&uuid.trim().length>0){
			$("#rob_u").attr('onclick',"CarCoupon.getCouponPkgData('"+uuid+"')");
			CarCoupon.isExistUuid=1;
		}else{
			$("#rob_u").attr('onclick',"CarCoupon.showPhone()");
			CarCoupon.isExistUuid=0;
		}
		AV.Cloud.run("mobile_activity_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				endContent =  replaceBr(result.endContent);
				if(result.validate==true){
					$(".init-info-box").hide();
					$(".msg-info").html(replaceBr(result.couponHint));
					$("#successHint").val(replaceBr(result.successHint));
					$("#hasOneHint").val(replaceBr(result.hasOneHint));
	                $("#testMsg").val(result.shareContent);
				}
				else{
	                $(".init-info").html(endContent);
	                $(".init-info-box").show();
				}
			},
			error:function(error){
	            $(".init-info").html(error.message);
	            $(".init-info-box").show();
			}
		});
	},
	//显示输入手机号
	showPhone:function(){
		$("#inputmobile").show();
	},
	//输入手机号获得券包
	getCouponPkg:function(){
		var phoneNumber = $("#phoneNumber").val();
		if(phoneNumber.length == 0) {
			$("#errorInfo").html("<font color='red'>请填写手机号码</font>");
			return;
		}
		if(phoneNumber.length != 11) {
			$("#errorInfo").html("<font color='red'>请填写有效的手机号码</font>");
			return;
		}
		var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
		if(!reg.test(phoneNumber)) {
			$("#errorInfo").html("<font color='red'>请填写有效的手机号码</font>");
			return;
		}
		$("#rob_coupon").attr("disabled","disabled");
    	$("#rob_coupon").html("加载中...");
    	CarCoupon.getCouponPkgData(phoneNumber);
	},
	//获得券包中券值
	getCouponPkgData:function(phoneNumber){
		$("#rob_u").attr("disabled","disabled");
    	$("#rob_u").html("加载中...");
		AV.Cloud.run("mobile_couponpkg_save",{activityId:CarCoupon.activityId,phoneNumber:phoneNumber},{
			success:function(isarr){
				CarCoupon.resetStyle();
				$(".wrap-bg").hide();
				$(".mask1").hide();
				$(".init-info-box").hide();
				$("#systemerr").show();
				var getsuccessHint=$("#successHint").val();
				var gethasOneHint=$("#hasOneHint").val();
				var coupons=isarr.carCoupons;
				var html="";
				coupons.forEach(function(coupon){
					var couponInfo;
					if(coupon.couponInfo==undefined){
						couponInfo="&nbsp;";
					}
					else{
						couponInfo=coupon.couponInfo;
					}
					html+="<div class='coupan-dot'><h4>"+coupon.money+"元</h4><p>"+replaceBr(couponInfo)+"</p></div>";
				});
				$("#carcoupon_div").html(html);
				
				if(isarr.status==undefined){
					$("#successMsg").show();
					$("#err-info").html(getsuccessHint);
					syncDataToUber(phoneNumber,"pkg",CarCoupon.activityId);
				}else if(isarr.status==2){
					$("#successMsg2").show();
					$("#err-info").html(gethasOneHint);
				}
			},
			error:function(error){
				CarCoupon.resetStyle();
				$("#systemerr").show();
				$("#err-info").html(endContent);
			}
		});
	},
	//重设样式
	resetStyle:function(){
		$("#rob_u").removeAttr("disabled");
    	$("#rob_u").html("抢U红包");
		$("#rob_coupon").removeAttr('disabled');
		$("#rob_coupon").html("确定");
	}
}

/**
 * 赋值活动id
 */
$(document).ready(function(){
	CarCoupon.activityId=GetRequest()["activityId"];
	Event.sendEvent("coupon_"+CarCoupon.activityId);
	CarCoupon.getActivity();
});
/**
 * 处理换行
 * @param str 字符串
 * @returns 处理后文本
 */
function replaceBr(str){
    if(!str){
        return "";
    }
    var returnVal = str.replace(/\n/g, "<br>");
    return returnVal;
}
//关闭信息提示层
function closediv(){
	$("#systemerr").hide();
}