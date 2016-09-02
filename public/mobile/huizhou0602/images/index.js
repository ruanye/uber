var Coupon={
    actId:null,
    //保存
    save:function(){
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
        $('#save_btn').attr('disabled','disabled').html('获得中...');
        $.post('/onecoupon/save/'+Coupon.actId+"-"+phoneNumber,{},function(data){
            $(".page2").hide();
            if(data.status==-1||data.robstatus ==2){
                //活动结束页面
                $(".end").show();
            }else{
                //成功页面
                $(".page1").hide();
                $(".page2").show();
            }
        });
    }
}

$(document).ready(function(){
    var request=GetRequest();
    Coupon.actId=request['id'];
    if(Coupon.actId){
        Event.sendEvent("counpon_"+Coupon.actId);
    }else{
        //结束界面
        $("#page1").hide();
        $(".end").show(); 
    }
});
var value = Cookie.getCookie('act_' +  Coupon.actId) || parseInt((Math.random() * 1000 + 5000));
  setInterval(function() {
                    value = parseInt(Math.random() * 10) + 1 + Number(value);
                    Cookie.createCookie("act_" +  Coupon.actId, value);
                    $("#number").html(value);
                }, 1000);