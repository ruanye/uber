var request =  GetRequest();

var activityId = request["id"];
Event.sendEvent("coupon_"+activityId);
var endContent;
//初始化提示内容
function initCarCouponConfig() {
	AV.Cloud.run("mobile_activity_isFetch",{activityId:activityId},{
		success:function(result){
			if(result.validate==true){
				$(".init-info-box").hide();
				$(".msg-info").html(replaceBr(result.couponHint));
				$("#successHint").val(replaceBr(result.successHint));
				$("#hasOneHint").val(replaceBr(result.hasOneHint));
                $("#testMsg").val(result.shareContent);
			}
			else{
                var endContent =  replaceBr(result.endContent);
                $(".init-info").html(endContent);
                $(".init-info-box").show();
			}
		},
		error:function(error){
            $(".init-info").html(error.message);
            $(".init-info-box").show();
		}
	});
}

function replaceBr(str){
    if(!str){
        return "";
    }
  var  returnVal = str.replace(/\n/g, "<br>");
    return returnVal;
}

//领取乘车券
function fetchCarCoupon(){
	AV.Cloud.run("mobile_activity_getCoupon",{activityId:activityId},{
		success:function(resultArr){
			var	cash=resultArr[0].amount + "元";
			$(".cash").html(cash);
			var vobjectid=resultArr[0].objectId;
			$("#carCouponId").val(vobjectid);
			$(".init-info-box").hide();
			$("#inputmobile").show();
		},
		error:function(err){
			$("#systemerr").show();
			$(".err-info").html(err.message);
		}
	});
}

//填写手机号码
function phoneCoupon(){
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
	var getcarCouponid=$("#carCouponId").val();
	var getsuccessHint=$("#successHint").val();
	var gethasOneHint=$("#hasOneHint").val();
	AV.Cloud.run("mobile_carcoupon_saveCoupon",{carCouponId:getcarCouponid,phoneNumber:phoneNumber,activityId:activityId},{
		success:function(isarr){
			$(".init-info-box").hide();
			$("#systemerr").show();
			if(isarr.state==1){
				$("#successMsg").show();
				$("#err-info").html(getsuccessHint);}
			if(isarr.state==2){
				$("#successMsg2").show();
				$("#err-info").html(gethasOneHint);
			}
		},
		error:function(){
			$("#systemerr").show();
			$("#err-info").html("服务姬生病了，我们正在运送工程师前去处理！");
		}
	});
}

//关闭信息提示层
function closediv(){
	$("#systemerr").hide();
}
