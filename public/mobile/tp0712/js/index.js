

$(function () {




    //return;
    //从地址栏获取id
    var activityId = window.location.href.match(/activityId=\w+/);
    if (activityId && activityId.length != 0) {
        activityId = activityId[0].split("=")[1] || "";
    }
    if(!!activityId){
        Event.sendEvent("toupiao_"+activityId);

    }


    //页面切换方法
    function togglePage(page) {
        $(".page").hide();
        $(page).show();
        Event.sendEvent(page+"_"+activityId);
    }

    //初始化
    if (!activityId) {
        alert("地址错误!");
        return;
    }
    var phone = localStorage.getItem("phonetp0715");

    //点index-page  button
    //判断手机号码
    $("#index-page .com-btn,#index-page").bind("click", function () {
        $("#index-page .piao").addClass("fadeOutDown1");
        setTimeout(function () {
            if(!phone){
                togglePage($("#vote-page"));
            }
            else{
                loadVote($("#index-page .com-btn"),"开始投票吧");
                togglePage($("#lists-page"));
            }
        },1000);


    });
    //vote-page
    $("#vote-page .vote-box img").bind("click", function () {
       var voteid=$(this).data("actid");
        togglePage("#mobile-page");

   //存手机号码
    $("#mobile-page .com-btn").bind("click", function () {
        var myphone =$("#mobile-page .ipt").val();
        if (myphone.length == 0) {
            $(".error").html("说好的手机号呢？");

            return;
        }
        if (myphone.length != 11) {


            $(".error").html("手机号不是11位这像话吗？");

            return;
        }
        var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
        if (!reg.test(myphone)) {
            $(".error").html("手机号格式错误!");

            return;
        }
        $("#mobile-page .com-btn").attr("disabled",true);
        $("#mobile-page .com-btn").html("提交中...")
        $.post("/vote/vote", {
            phone: myphone,
            itemId:voteid
        }, function (data) {
            $("#mobile-page .com-btn").removeAttr("disabled");
            $("#mobile-page .com-btn").html("确定")
            if(data.code==0){
                window.localStorage.setItem("phonetp0715", myphone);
                if(data.coupon=="yes"){
                    switch(voteid)
                    {
                        case '5784b7720a2b5800693cea3d':
                            Event.sendEvent("houjie_"+activityId);
                            $(".piao-box .up-piaobox").html("<img src='images/p42.png''>");
                            $(".piao-box .yh-pic").html("<img src='images/p20.png' class='p20'>");
                            $(".piao-box .dowm-piaobox .info-s").html("*限厚街地区｜最高优惠5元｜7月20日前有效");
                            break;
                        case '5784b772a34131005d89aac1':
                            Event.sendEvent("humen_"+activityId);
                            $(".piao-box .up-piaobox").html("<img src='images/p19.png''>");
                            $(".piao-box .yh-pic").html("<img src='images/p20.png' class='p20'>");
                            $(".piao-box .dowm-piaobox .info-s").html("*限虎门地区｜最高优惠5元｜7月20日前有效");
                            break;
                        case '5784b772a34131005d89aac0':
                            Event.sendEvent("changan_"+activityId);
                            $(".piao-box .up-piaobox").html("<img src='images/p25.png''>");
                            $(".piao-box .yh-pic").html("<img src='images/p22.png' class='p20'>");
                            $(".piao-box .dowm-piaobox .info-s").html("*限长安地区｜最高优惠8元｜7月20日前有效");
                            break;
                        case '5784b7720a2b5800693cea3c':
                            Event.sendEvent("dalang_"+activityId);
                            $(".piao-box .up-piaobox").html("<img src='images/p21.png''>");
                            $(".piao-box .yh-pic").html("<img src='images/p22a.png' class='p20'>");
                            $(".piao-box .dowm-piaobox .info-s").html("*限大朗地区｜最高优惠6元｜7月20日前有效");
                            break;
                        case '5784b7722e958a006426ca3b':
                            Event.sendEvent("songshanhu_"+activityId);
                            $(".piao-box .up-piaobox").html("<img src='images/p23.png''>");
                            $(".piao-box .yh-pic").html("<img src='images/p20.png' class='p20'>");
                            $(".piao-box .dowm-piaobox .info-s").html("*限松山湖地区｜最高优惠8元｜7月20日前有效");
                            break;
                        case '5784b772c4c971005c400c83':
                            Event.sendEvent("shatian_"+activityId);
                            $(".piao-box .up-piaobox").html("<img src='images/p24.png''>");
                            $(".piao-box .yh-pic").html("<img src='images/p26.png' class='p20'>");
                            $(".piao-box .dowm-piaobox .info-s").html("*限沙田地区｜最高优惠12元｜7月20日前有效");
                            break;
                        case '5784b7725bbb500060ff8e8b':
                            Event.sendEvent("liaobu_"+activityId);
                            $(".piao-box .up-piaobox").html("<img src='images/p28.png''>");
                            $(".piao-box .yh-pic").html("<img src='images/p29.png' class='p20'>");
                            $(".piao-box .dowm-piaobox .info-s").html("*限寮步地区｜7月20日前有效");
                            break;
                        case '5784b772128fe100602ce47c':
                            Event.sendEvent("dalingshan_"+activityId);
                            $(".piao-box .up-piaobox").html("<img src='images/p27.png''>");
                            $(".piao-box .yh-pic").html("<img src='images/p26.png' class='p20'>");
                            $(".piao-box .dowm-piaobox .info-s").html("*限大岭山地区｜最高优惠6元｜7月20日前有效");
                            break;
                        default:
                           
                    }
                      togglePage($("#result-page"));

                }
                if(data.coupon=="no"){
                    if(!data.redirect){
                        togglePage($("#end-page"));

                    }
                    else{
                        Event.sendEvent("newuser_"+activityId);
                        window.location.href=data.redirect;
                    }
                }
            }
            else{

                alert( data.message);
            }



        });


    });

    });
//查看投票结果
    $("#result-page .blue-btn").bind("click",function () {

        loadVote($("#result-page .blue-btn"),"查看镇区排行榜");
        togglePage($("#lists-page"));
    })
//不投了
    $("#end-page #bye").bind("click",function () {
        $("#bye-page .blue-btn").hide();
        $("#bye-page .info-m").html("谢谢关注,<br>下次再来参加优步活动哦！");
        togglePage($("#bye-page"));
    })
    //继续投票
    $("#end-page #goon").bind("click",function () {
        $("#bye-page .blue-btn").show();
        $("#bye-page .info-m").html("很抱歉乘车券被领光啦<br>感谢您参与投票");
        togglePage($("#bye-page"));
    })
    //继续投票
    $("#bye-page #view").bind("click",function () {

        loadVote($("#bye-page #view"),"查看镇区排行榜");
        togglePage($("#lists-page"));
    })
    //分享
    $("#lists-page .btn-tou").bind("click",function () {
        $("#share-page").show();
    })
    //关闭分享
    $("#share-page").bind("click",function () {
        $("#share-page").hide();
    })
});

function loadVote($page,btntxt) {
    $page.attr("disabled",true);
    $page.html("加载中...")
    $.ajax({
        url: "/vote/list",
        type: 'get',
        success: function(result) {
            $page.removeAttr("disabled");
            $page.html(btntxt);
           if(result.code==0){
               var str="";
               console.log(result);
               var a =result.lst[0].items.sort(function(x,y) {return -(x.amount-y.amount);})
               console.log("a",a);
               for(var i=0;i<a.length;i++){
                   var count=i+1;
                   str+="<li class='flex-box flex-m'><div class='num-box'>"+count+"</div>";
                   str+="<div class='city'>"+a[i].title+"</div><div class='flex-1'><span class='support-num'>"+a[i].amount+"</span><span class='dw'>支持</span></div></li>";
               }
           }
            $("#lists-page ul").html(str);

        }
    });
}

    $('.animated').each(function(index, el) {
        var delay = $(this).attr('data-delay')
        $(this).css({
            animationDelay: delay,
            webkitAnimationDelay: delay
        });
    });


function GetRTime(){
    var EndTime= new Date('2016/07/06 08:00:00'); //截止时间
    var NowTime = new Date();
    var t =EndTime.getTime() - NowTime.getTime();
    var d=Math.floor(t/1000/60/60/24);
    var h=Math.floor(t/1000/60/60%24);
    var m=Math.floor(t/1000/60%60);
    var s=Math.floor(t/1000%60);
    var str="";

    if(t<0){
       $("#mask-page").hide();
        clearInterval(intervaid);

    }
    else{
        str="离投票开始还有<br>"+ d + "天"+ h + "时"+m + "分"+s + "秒";
        $("#timer").html(str);
    }
}
var intervaid=setInterval(GetRTime,1000);