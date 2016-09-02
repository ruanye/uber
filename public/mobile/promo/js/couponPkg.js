var endContent="";
var CarCoupon={
	activityId:"",
	//获得活动信息
	getActivity:function(){
		AV.Cloud.run("mobile_promo_detail",{activityId:CarCoupon.activityId},{
			success:function(result){
				endContent =  replaceBr(result.endContent);
				if(result.validate==true){
					//如果连接存在uuid就使用uuid获得券否则收输入手机号
					var uuid=GetRequest()["uuid"];
					if(uuid==undefined||uuid.trim().length==0){
						$("#rob_promo_btn").attr("onclick","CarCoupon.showPhone()");
					}else{
						$("#rob_promo_btn").attr("onclick","CarCoupon.getCouponPkgData('"+uuid+"')");
					}
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
		CarCoupon.getCouponPkgData(phoneNumber);
	},
	//获得promo码
	getCouponPkgData:function(phoneNumber){
		$("#rob_coupon").attr("disabled","disabled");
    	$("#rob_coupon").html("加载中...");
		$("#rob_promo_btn").attr("disabled","disabled");
    	$("#rob_promo_btn").html("加载中...");
		AV.Cloud.run("mobile_promo_save",{activityId:CarCoupon.activityId,phoneNumber:phoneNumber},{
			success:function(isarr){
				showError();
				var getsuccessHint=$("#successHint").val();
				var gethasOneHint=$("#hasOneHint").val();
				if(isarr.status!=0){
					if(isarr.remark!=undefined){
						var remark=isarr.remark;
						var code="";
						if(isarr.code!=undefined){
							code=isarr.code;
						}
						var html="<div class='coupan-single-dot'><h4>"+isarr.code+"</h4><p>"+replaceBr(remark)+"</p></div>";
						
						$(".carcoupan-single-box").html(html);

						if(isarr.status==1){
							$("#successMsg").show();
							$("#err-info").html(getsuccessHint);
							syncDataToUber(phoneNumber,"promo",CarCoupon.activityId);
						}else if(isarr.status==2){
							$("#successMsg2").show();
							$("#err-info").html(gethasOneHint);
						}
					}else{
						showError();
					}
				}else{
					showError();
				}
			},
			error:function(error){
				showError();
			}
		});
	}
}

function showError(){
	$(".wrap-bg").hide();
	$(".mask1").hide();
	$(".init-info-box").hide();
	$("#rob_coupon").removeAttr('disabled');
	$("#rob_coupon").html("确定");
	$("#rob_promo_btn").removeAttr('disabled');
	$("#rob_promo_btn").html("抢U红包");
	$("#systemerr").show();
	$("#err-info").html(endContent);
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