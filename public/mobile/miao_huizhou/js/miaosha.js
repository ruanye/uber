$(function(){
  togglePage($("#page3b"));
  //下载
  $(".download").bind("click",function(){
    window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.ubercab";
  });
  return;
  //从地址栏获取id
  var activityId = window.location.href.match(/id=\w+/);
  if(activityId && activityId.length !=0 ){
      activityId = activityId[0].split("=")[1] || "";
  }

  window.DEBUG_TIMEOFFSET = (1000*60*60*7)*0; // 调试时间偏移

  //初始化
  $(".page").hide();
  if( !activityId ){
    alert("地址错误");
    return;
  }
  var phone = localStorage.getItem("phonesz621");
  togglePage( $("#index-page") );

  //index-page 抢券页面
  $.get("/ms_activity/activity/list",{
    id:activityId,
  },function( data ){
    if( data.code!=0){
      alert("服务器错误!");
      return;
    }
    if( data.lst.length == 0 ){
      alert("活动ID错误!");
      return;
    }
    
    render(data);
    window.pageData = data;

    $("#index-page #couponWarp ul").each(function(index){
      if(!this.item.isCruent) {
        return;
      }
      clearInterval(window['Timer'+index]);
      window['Timer'+index] = setInterval((function(elem,index){
        return function(){
          // console.log("index",index);
          var currentTime = new Date(Date.now()+window.DEBUG_TIMEOFFSET);
          var item  = elem.item;
          var offset = (item.day+item.startTime) - currentTime.getTime();
          // console.log( offset );
          if( offset <= 0 ){
            offset = 0;
            clearInterval(window['Timer'+index]);
            render( window.pageData );
          }
          $(elem).find(".timer").html(ms2hms(offset));
        }
      })(this,index),1000);
    });

    $(".share").bind("click",function(){
      togglePage($("#page5"));
      clearInterval(window.Timer);
    });
   
  });

  //page3 手机号
  $("#page3 #savePhone").bind("click",function(){
    var value = $("#page3 [name='phone']").val();
    if( !/^\d{11}$/ig.test(value) ){
      alert("手机号格式错误!\n请重新输入!");
      return;
    }
    phone = value;
    var item = $("#page3").get(0).item;
    var pointIndex = $("#page3").get(0).pointIndex;
    var couponIndex = $("#page3").get(0).couponIndex;
    $.post("/ms_activity/snatchV2",{
      activityId:activityId,
      pointIndex:pointIndex,
      couponIndex:couponIndex,
      phone:phone
    },function( data ){
      if( data.code == 0){
        togglePage($("#page3a1")); //成功
      }else{
        togglePage($("#page3a2")); //失败
      }
    });
  });
$("#page3b .m-btn").eq(0).bind("click",function(){
    window.location.href = "https://get.uber.com.cn/invite/CRAZYHZ10";
});
$("#page3b .m-btn").eq(1).bind("click",function(){
  togglePage($("#page2"));
});



function getTimePoints(data ){
  var flagDay = -1;
  var flageOk = false;
  var timePoints = [];
  var currentTime = new Date(Date.now()+window.DEBUG_TIMEOFFSET);
  data.lst[0].points.forEach(function( item,index ){
    if( flageOk ){
     return;
    }
    // console.log(flagDay);
    if( flagDay != new Date(item.day).getTime() ){
      flagDay =  new Date(item.day).getTime();
      var lessThan = timePoints.filter(function(a){
        return new Date(Date.now()+window.DEBUG_TIMEOFFSET).getTime()<new Date(a.day+a.endTime).getTime();
      });
      if( lessThan.length != 0 ){
        flageOk = true;
      }else{
        if(index < data.lst[0].points.length ){
          flageOk = false;
          timePoints = [];
        }
      }
    }
    var currentDate = new Date(Date.now()+window.DEBUG_TIMEOFFSET);
    var offsetDay = new Date(item.day).getTime() - currentDate.getTime();

    if( offsetDay >= -(1000*60*60*24) ){
      if(currentDate.getTime() >= new Date(item.day+item.startTime).getTime() && currentDate.getTime() <= new Date(item.day+item.endTime).getTime()){
        item.isCruent = true;
      }
      item.pointIndex = index;
      timePoints.push(item);
    }
  });
  return timePoints;
}



function render( data ){
  var timePoints = getTimePoints(data);
  var currentTime = new Date(Date.now()+window.DEBUG_TIMEOFFSET);
  if( timePoints.length==0){
    // alert("没有活动");
    togglePage($("#page3b"));
    return;
  }
  // console.table( timePoints );
  //创建顶部时间区域
  $("#page2 #timePoints").html("");
  $("#page2 #couponWarp").html("");
  // console.table(timePoints);
  //FIXME
  if( timePoints.length == 3){
    timePoints.pop();
  }
  timePoints.forEach(function( item,pointIndex ){
    var hour = new Date( item.day + item.startTime).getHours();
    var offset = new Date( item.day + item.startTime) - new Date(Date.now()+window.DEBUG_TIMEOFFSET).getTime();
    if(hour < 10){
      hour = "0"+hour;
    }
    var isCruent = item.isCruent;
    //初始化顶部时间
    var html = '<li class="flex-1">'+
      '<div>'+
      '<p class="time">TIME</p>'+
      '<p class="time-value">'+hour+':00</p>'+
      '</div>'+
    '</li>';
    var $html = $(html);
    if( isCruent ){
      $html.addClass("cruent").append('<img src="images/miaosha6.0/zhi-car.png" alt="" class="zhi-car">');
    }
    $("#page2 #timePoints").append($html);

    //初始化优惠券列表
    var $coupons = $('<ul class="qiang-lst" calss="coupons">');
    //$coupons.data("itme",item);
    if( !isCruent ){
      $coupons.hide();
    }
    var status;
    if( currentTime.getTime() <= new Date(item.day+item.startTime) ){
      status = '3';
    }else{
      status = '2';
    }
    item.coupons.forEach(function( coupon,couponIndex ){
      var left = coupon.amount-coupon.usedAmount;
      left = left <=0 ?0:left;

      var isDeplete = (coupon.amount-coupon.usedAmount) <= 0;
      var status2 = isDeplete ? '1':status;
      // status = '2';
      // console.log("isDeplete",isDeplete);

      var couponHtml = '<li>'+
        '<div class="flex-1 quan">'+
          '<div class="flex-1 text-left">'+
            '<p><label for="" class="quan-type">5月'+(new Date().getDate())+'号 限时限量</label></p>'+
            '<p class="qiang-title">'+coupon.couponTitle+'</p>'+
            '<p class="quan-info">(数量'+coupon.amount+'支)</p>'+
            // '<p class="quan-info"><span class="dot">■</span>使用时间:5月10日－15日</p>'+
          '</div>'+
          '<div class="quan-img"><img src="images/miaosha6.0/m-'+(pointIndex+1)+'.png" ></div>'+
        '</div>'+
        '<div class="qiang-box">'+
          '<button class="xs-btn status-'+status2+'">领取<br>安慰奖</button>'+
          '<p class="x-info">秒杀倒计时</p>'+
          '<p id="timer" class="timer">'+ms2hms(0)+'</p>'+
        '</div>'+
      '</li>';
      var $coupon = $(couponHtml);
      switch (status2) {
        case '1':
          $coupon.find(".qiang-box .xs-btn").html("已抢完");
          $coupon.find(".qiang-box .xs-btn").bind("click",function(){
            //window.location.href = "https://get.uber.com.cn/invite/CRAZYHZ10";
          });
          $coupon.find(".qiang-box .x-info,.qiang-box .timer").hide();
          break;
        case '2':
          $coupon.find(".qiang-box .xs-btn").html("抢");
          $coupon.find(".qiang-box .xs-btn").bind("click",function(){
            togglePage( $("#page3") );
            $("#page3").get(0).item=$(this).closest("ul").get(0).item;
            $("#page3").get(0).pointIndex=$(this).closest("ul").get(0).item.pointIndex;
            $("#page3").get(0).couponIndex=$(this).closest("li").get(0).couponIndex;
          });
          $coupon.find(".qiang-box .x-info,.qiang-box .timer").hide();
          break;
        case '3':
          $coupon.find(".qiang-box .xs-btn").html("即将开始");
          // $coupon.find(".qiang-box .xs-btn").bind("click",function(){
          //
          // });
          break;
        default:

      }
      $coupons.append($coupon);
      $coupon.get(0).coupon = coupon;
      $coupon.get(0).couponIndex = couponIndex;
    });
    $("#page2 #couponWarp").append($coupons);
    $coupons.get(0).item = item;
  });

  if( timePoints.filter(function(a){return a.isCruent}).length ==0 ){
    var index=0;
    var flagOk = false;
    timePoints.forEach(function( item,i){
      if( !flagOk && new Date(Date.now()+window.DEBUG_TIMEOFFSET).getTime() <= (item.day+item.endTime) ){
        index = i;
        item.isCruent =true;
        flagOk = true;
      }
    });

    $("#page2 #couponWarp ul").eq(index).show();
    $("#page2 #timePoints li").eq(index).addClass("cruent").append('<img src="images/miaosha6.0/zhi-car.png" alt="" class="zhi-car">');
  }

}

});
function togglePage( show ){
  $(".page").hide();
  $(show).show();
}

function ms2hms( ms ){
  var dd = parseInt(ms / 1000 / 60 / 60 / 24, 10);//计算剩余的天数
  var hh = parseInt(ms / 1000 / 60 / 60 % 24, 10);//计算剩余的小时数
  var mm = parseInt(ms / 1000 / 60 % 60, 10);//计算剩余的分钟数
  var ss = parseInt(ms / 1000 % 60, 10);//计算剩余的秒数
  if(hh<10){
    hh = "0" + hh;
  }
  if(mm<10){
    mm = "0" + mm;
  }
  if(ss<10){
    ss = "0" + ss;
  }
  return dd+":"+hh+":"+mm+":"+ss;
}
