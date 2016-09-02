/**
 * Created by Miku on 16/4/5.
 */
var request =  GetRequest();
var activityId = request["id"];

//初始化提示内容
$(document).ready(function(){
    Event.sendEvent("counpon_"+activityId);
    AV.Cloud.run("mobile_activity_isFetch",{activityId:activityId},{
        success:function(result){
            if(result.validate==true){
                fetchCarCoupon();
            }
            else{
                $("#page1").hide();
                $("#page5").show();
            }
        },
        error:function(error){
            console.log(JSON.stringify(error));
            $("#page1").hide();
            $("#page5").show();
        }
    });
});

//领取乘车券
function fetchCarCoupon(){
    AV.Cloud.run("mobile_activity_getCoupon",{activityId:activityId},{
        success:function(resultArr){
            $("#carCouponId").val(resultArr[0].objectId);
        },
        error:function(err){
            console.log(JSON.stringify(error));
            $("#page1").hide();
            $("#page5").show();
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
    $("#phone_btn").attr("disabled","disabled");
    $("#phone_btn").html("<div>领取中...</div>");
    var getcarCouponid=$("#carCouponId").val();
    AV.Cloud.run("mobile_carcoupon_saveCoupon",{carCouponId:getcarCouponid,phoneNumber:phoneNumber,activityId:activityId},{
        success:function(isarr){
            $("#phone_btn").removeAttr("disabled");
            //$("#phone_btn").html("<div>确定</div>");

            
          //  $("#page2").show();
            syncDataToUber(phoneNumber);
            // if(isarr.state==1){
            //     syncDataToUber(phoneNumber);
            // $("#convert_btn").html("<div>领取</div>");
            // $("#convert_btn").attr("onclick","syncDataToUber('"+phoneNumber+"')");
            // }else if(isarr.state==2){
            // $("#convert_btn").html("<div>已领取</div>");
            // $("#convert_btn").removeAttr("onclick");
            // }
        },
        error:function(){
            $("#phone_btn").removeAttr("disabled");
            $("#phone_btn").html("<div>确定</div>");

            $('#page1').hide();
            $("#page4").show();
        }
    });
}

function syncDataToUber(phone){
    $("#phone_btn").html("<div>领取中...</div>");
    var params={phone:phone,type:"onecoupon",activityId:$("#carCouponId").val()};
    AV.Cloud.run("mobile_uber_sync",params,{
        success:function(data){
            if(data.status==-1){
                $("#convert_btn").html("<div>领取失败</div>");
            }else{
                if(data.status==1){
                    $('#page2').hide();
                	$("#page3").show();
                    //老用户
                    // $("#convert_btn").html("<div>"+data.msg+"</div>");
                    // $("#convert_btn").attr("onclick","window.location='"+data.url+"'");
                }else{
                    //新用户
                    setTimeout(function(){$("#page2").hide();$("#page4").show();},500);
                }
            }
        },
        error:function(error){
            console.log(JSON.stringify(error));
            $("#convert_btn").html("<div>领取失败</div>");
            setTimeout(function(){$("#page2").hide();$("#page5").show();},1000);
        }
    });
}
