 try{
   $('#phoneNum').val(APP.getAppPhone());             
 }catch(e){

       }
var parm = '';

$(".more").click(function() {
    $("#page3").hide();
     $("#page4").show();
});
$(".share").click(function() {
    $("#page4").hide();
    $("#page5").show();
     parm = 'share'
});

$('#startbtn').on('click', function(event) {
    $('.page').hide();
    $('#page2').show();
    parm = 'phone';
    event.preventDefault();
    /* Act on the event */
});
$('#save-btn').on('click', function(event) {
    Coupon.save();
    event.preventDefault();
    /* Act on the event */
});


var Coupon = {
    actId: null,

    //保存
    save: function() {

        var phoneNumber = $("#phoneNumber").val();
        if (phoneNumber.length == 0) {
            $("#errorInfo").html("<font color='#fff'>请填写手机号码</font>");
            return;
        }
        var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
        if (!reg.test(phoneNumber)) {
            $("#errorInfo").html("<font color='#fff'>请填写有效的手机号码</font>");
            return;
        }
        $('#save-btn').attr('disabled', 'disabled').html('获得中...');
         try{
            if (APP.getAppPhone()!= phoneNumber) {
                 APP.savePhone(phoneNumber); 
            }
            
        }catch(e){

       }
        $.post('http://couponsz.leanapp.cn/onecoupon/save/' + Coupon.actId + "-" + phoneNumber, {}, function(data) {
            $(".page").hide();

            console.log(data.robstatus);
            if (data.status == -1 || data.robstatus == 2) {
                //活动结束页面
                $(".end").show();
            } else {
                parm = 'result';
                //成功页面
                if (data.robstatus == 1) {
                    //新用户抢码成功
                    $('#page6').show();

                }
                if (data.robstatus == 0) {
                    $('#page3').show();
                    // 老用户抢码成功
                }


            }
        });
    }
}

$(document).ready(function() {
    var request = GetRequest();
    Coupon.actId = request['id'];
    if (Coupon.actId) {
        Event.sendEvent("counpon_" + Coupon.actId + parm);
    } else {
        //结束界面
        $("#page1").hide();
        $(".end").show();
    }
});