$(function(){
  //判断是不是移动端
  if(!navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){
    alert("请在手机上用微信打开");
    return;
  }
  //return;
  //从地址栏获取id
  var activityId = window.location.href.match(/id=\w+/);
  if(activityId && activityId.length !=0 ){
      activityId = activityId[0].split("=")[1] || "";
  }

  window.DEBUG_TIMEOFFSET = (1000*60*60*17+1000*60*15)*0; // 调试时间偏移 单位：ms

  //初始化
  $(".page").hide();
  if( !activityId ){
    alert("地址错误");
    return;
  }
  var phone = localStorage.getItem("phone621");
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
//组合秒杀列表
    $("#index-page #items .item").each(function(index){
      if(!this.item.isCruent) {
        return;
      }
      clearInterval(window['Timer'+index]);

      var currentTime = new Date(Date.now()+window.DEBUG_TIMEOFFSET);
      var item  = this.item;
      var offset = (item.day+item.startTime) - currentTime.getTime();


      if(offset >= 0 ){
        window['Timer'+index] = setInterval((function(elem,index){
          return function(){

            var currentTime = new Date(Date.now()+window.DEBUG_TIMEOFFSET);
            var item  = elem.item;
            var offset = (item.day+item.startTime) - currentTime.getTime();

            if( offset <= 0 ){
              offset = 0;
              clearInterval(window['Timer'+index]);
              render( window.pageData );
            }
            $(elem).find('.opr .info-m').html(ms2hms(offset));
          }
        })(this,index),1000);
      }
    });


  });

  //page3 手机号
  $("#mobile-page .com-btn").bind("click",function(){
    var value = $("#mobile-page .ipt").val();
    if( !/^\d{11}$/ig.test(value) ){
      alert("手机号格式错误!\n请重新输入!");
      return;
    }
    phone = value;
    var item = $("#mobile-page").get(0).item;
    var pointIndex = $("#mobile-page").get(0).pointIndex;
    var couponIndex = $("#mobile-page").get(0).couponIndex;
    $('#mobile-page .com-btn').attr('disabled',true);
    $('#mobile-page .com-btn').css({"width":"auto","padding-left":".5rem","padding-right":".5rem"});
    $('#mobile-page .com-btn').html(" <img src='images/loading.png' class='rate'><span class='info-s'> 正在努力抢！>.< </span>");
    $.post("/ms_activity/snatch",{
      activityId:activityId,
      pointIndex:pointIndex,
      couponIndex:couponIndex,
      phone:phone
    },function( data ){
   console.log(data);
      if( data.code == 0 ){


        if( data.isNew == 1){
          togglePage($("#user-page"));
          $("#user-page .com-btn").bind("click",function(){

           window.location.href="https://get.uber.com.cn/invite/UHZH5";
          });
        }else{
          $("#result-page .info-lgw").html(item.coupons[couponIndex].tag);

          $("#result-page .info-s1").html( item.coupons[couponIndex].content );

          togglePage($("#result-page"));
          $("#result-page .re-btn").bind("click",function(){

            togglePage($("#index-page"));
          });
          $("#result-page .share-btn").bind("click",function(){

            togglePage($("#share-page"));
          });
          render( window.pageData );
        }

      }
      else{
        if(data.isFetched == 1){
          $("#end-page .info-lgl").html("您已获得过该优惠啦");
          $("#end-topic").html("<img src='images/p19.png' style='width:2.828125rem'>");
          $(".re-btn").parent().hide();
          togglePage($("#end-page"));
          return;
        }
        $("#end-page .info-lgl").html("啊噢！手慢了一丢丢<br>莫事，还有机会！");
        $("#end-topic").html("<img src='images/p4.png' style='width:2.828125rem'>");
        $(".re-btn").parent().show();
        togglePage($("#end-page"));


      }
      $('#mobile-page .com-btn').removeAttr("disabled");
      $('#mobile-page .com-btn').css({"width":"auto","padding-left":".5rem","padding-right":".5rem"});
      $('#mobile-page .com-btn').html("领取秒杀优惠");
      $('#mobile-page .fixed-logo').removeAttr('style');
    });
  });

  $("#end-page .re-btn").bind("click",function(){
    togglePage($("#index-page"));
  });
  $("#end-page .share-btn").bind("click",function(){
    togglePage($("#share-page"));
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
    alert("没有活动");
    return;
  }

  //创建顶部时间区域
  // $("#miao-page #step").html("");
  $("#index-page #items").html("");

  //FIXME
  if( timePoints.length == 2){
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
    // var html = '<div class="flex-1">'+
    //   '<div class="'+(isCruent?'step active':'step')+'">'+
    //   '<p >TIME</p>'+
    //   '<p class="time-value">'+hour+':00</p>'+
    //   '</div>'+
    // '</div>';
    // var $html = $(html);
    // $("#miao-page #step").append($html);

    //初始化优惠券列表
    var $coupons = $('<div class="item"></div>');

    if( !isCruent ){
      $coupons.hide();
    }
    var status;
    if( currentTime.getTime() <= new Date(item.day+item.startTime) ){
      status = '3';
    }else{
      status = '2';
    }
    console.table(item);
    item.coupons.forEach(function( coupon,couponIndex ){
      var left = coupon.amount-coupon.usedAmount;
      left = left <=0 ?0:left;

      //抢之前的列表
      // coupon.date = [
      //   ['有效期：至2016年6月12日','有效期：至2016年6月12日','有效期：至2016年6月12日','有效期：至2016年6月12日'],
      //   ['有效期：至2016年6月30日','有效期：至2016年6月30日','有效期：至2016年6月12日','有效期：至2016年6月12日'],
      //   ['有效期：至2016年6月30日','有效期：至2016年6月12日','有效期：至2016年6月30日','有效期：至2016年6月12日'],
      //   ['有效期：至2016年6月30日','有效期：至2016年6月30日','有效期：至2016年6月12日','有效期：至2016年6月12日'],
      // ][pointIndex][couponIndex];


      coupon.tag = ['至尊', '霸气','极品'][couponIndex];
      coupon.Title = ['1折', '10元','3折'][couponIndex];
      coupon.amount = ['5,000','1,000','10,000'][couponIndex];

      var isDeplete = coupon.isActive == 0;
      var status2 = isDeplete ? '1':status;


      var couponHtml = '<div class="flex-box flex-m miao-item" style="margin-top:0.4rem">'+
          '<div class="jiang flex-1">'+
          '<div class="jiang-box">'+
          '<div class="jiang-feng">'+
          '<p>'+coupon.tag+'</p>'+
          '</div><div class="jiang-value">'+
          '<p class="info-lgl">'+coupon.Title+'</p>'+
          '<p class="info-s">限量'+coupon.amount+'份</p>'+
          '</div>'+
          '</div>'+
          '</div>'+
          '<div class="opr">'+
          '<button class="un-qiang"></button>'+
          '<p class="info-s" style="color: #fff">秒杀倒计时</p>'+
          '<p class="info-m">00:00:00</p>'+
      '</div>'+
      '</div>';
      var $coupon = $(couponHtml);


      //抢之后的展示
      coupon.date = [
        ['有效期：至2016年6月12日','有效期：至2016年6月12日','有效期：至2016年6月12日','有效期：至2016年6月12日'],
        ['有效期：至2016年6月30日','有效期：至2016年6月30日','有效期：至2016年6月12日','有效期：至2016年6月12日'],
        ['有效期：至2016年6月30日','有效期：至2016年6月12日','有效期：至2016年6月30日','有效期：至2016年6月12日'],
        ['有效期：至2016年6月30日','有效期：至2016年6月30日','有效期：至2016年6月12日','有效期：至2016年6月12日'],
      ][pointIndex][couponIndex];

      coupon.content = [
        '1次1折券<br>每次最高可减免9元<br>限6.25-6.26使用<br>限惠州地区使用',
        '2次立减10元折券<br>限6.25-6.26使用<br>限惠州地区使用',
        '4次3折券<br>每次最高减免8元<br>限6.25-6.26使用<br>限惠州地区使用'
      ][couponIndex];

      coupon.tag = ['至尊1折', '霸气¥10','极品3折'][couponIndex];
     


      switch (status2) {
        case '1':
          $coupon.find(".opr button").attr('class','').addClass('qiang-end');
          $coupon.find(".opr p").hide();
          break;
        case '2':
          $coupon.find(".opr button").removeClass('un-qiang').addClass('qiang');
          $coupon.find(".opr p").hide();
          $coupon.find(".opr button").bind("click",function(){
            togglePage( $("#mobile-page") );
            $("#mobile-page").get(0).item=$(this).closest(".item").get(0).item;
            $("#mobile-page").get(0).pointIndex=$(this).closest(".item").get(0).item.pointIndex;
            $("#mobile-page").get(0).couponIndex=$(this).closest(".miao-item").get(0).couponIndex;
          });
          $coupon.find(".qiang-box .x-info,.qiang-box .timer").hide();
          break;
        case '3':
          $coupon.find(".opr button").removeClass('qiang').addClass('un-qiang');
          $coupon.find(".opr p").show();
          break;
        default:

      }
      $coupons.append($coupon);
      $coupon.get(0).coupon = coupon;
      $coupon.get(0).couponIndex = couponIndex;
    });

    $("#index-page #items").append($coupons);
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
    $("#index-page #items .item").eq(index).show();
    // $("#miao-page #step .step").eq(index).addClass("active");
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
  if( dd == 0){
    return hh+":"+mm+":"+ss;
  }
  return dd+":"+hh+":"+mm+":"+ss;
}
