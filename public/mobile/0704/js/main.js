function rotate(myclass, me) {
    $('#zhizhen').on('click', function(event) {
        $('#circle').addClass(myclass);
        setTimeout(function() {
            $('.page').hide();
            $(me).show();

        }, 4000);
        event.preventDefault();
    });


}

var Coupon = {
    actId: null,
    //保存
    save: function(toflag, money) {

        var phoneNumber = $("#phoneNumber").val();
        if (phoneNumber.length == 0) {
            $("#errorInfo").html("<font color='#fff'>请填写手机号码</font>");
            return;
        }
        if (phoneNumber.length != 11) {
            $("#errorInfo").html("<font color='#fff'>请填写有效的手机号码</font>");
            return;
        }
        var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
        if (!reg.test(phoneNumber)) {
            $("#errorInfo").html("<font color='#fff'>请填写有效的手机号码</font>");
            return;
        }
         $("#myphone").attr('placeholder', ''+phoneNumber+'');
        $('#save_btn').attr('disabled', 'disabled').html('获得中...');
        $.post('http://couponsz.leanapp.cn/morecoupon/save/' + Coupon.actId + "-" + phoneNumber, {
            israndom: 1
        }, function(data) {
            if (data.status == -1 || data.robstatus == 2||data.robstatus==-1) {
                
                //活动结束页面
                $('.page').hide();
                $(".end").show();
            } else {
                //成功页面
                if (data.robstatus == 1) {
                     if (data.money == 1000) {
                        rotate('an', '.page5');
                        try {
                            if (localStorage) {
                                localStorage['ghong'+ Coupon.actId] = '15';
                            }

                        } catch (e) {
                            throw new Error(10, "不支持缓存")
                        }

                    }
                    if (data.money == 2) {
                        rotate('angel', '.page6');
                        try {
                            if (localStorage) {
                                localStorage['ghong'+ Coupon.actId] = '16';
                            }

                        } catch (e) {
                            throw new Error(10, "不支持缓存")
                        }

                    }
                     if (data.money!=1000&&data.money!=2) {
                        window.location.href = 'https://get.uber.com.cn';
                     }
                    //新用户抢码成功
                    
                }
                if (data.robstatus == 0) {
                    $('.page').hide();
                    $('.page4').show();
                    if (data.money==2) {
                        rotate('angel', '.page6');
                        try {
                            if (localStorage) {
                                localStorage['ghong'+ Coupon.actId] = '16';
                            }

                        } catch (e) {
                            throw new Error(10, "不支持缓存")
                        }


                    }
                    if (data.money == 8) {
                        rotate('fourzhe', '.page7');
                        try {
                            if (localStorage) {
                                localStorage['ghong'+ Coupon.actId] = '17';
                            }

                        } catch (e) {
                            throw new Error(10, "不支持缓存")
                        }

                    }
                    if (data.money == 1000) {
                        rotate('an', '.page5');
                        try {
                            if (localStorage) {
                                localStorage['ghong'+ Coupon.actId] = '15';
                            }

                        } catch (e) {
                            throw new Error(10, "不支持缓存")
                        }
                    }
                }
            }
        });
    }
}

$(document).ready(function() {
    var request = GetRequest();
    Coupon.actId = request['id'];
   // localStorage.clear();
    if (Coupon.actId) {
        Event.sendEvent("counpon_" + Coupon.actId);
    } else {
        //结束界面
        $("#page1").hide();
        $(".end").show();
    }
    
    try {
        if (localStorage && localStorage['ghong'+ Coupon.actId]) {
            switch (localStorage['ghong'+ Coupon.actId]) {
                case '15':
                    $('.page').hide();
                    $('.page5').show();
                    break;
                case '16':
                    $('.page').hide();
                    $('.page6').show();
                    break;
                case '17':
                    $('.page').hide();
                    $('.page7').show();
                    break;
            }
        }

    } catch (e) {
        throw new Error(10, "不支持缓存")
    }

    $('.btnto').on('click', function (event) {
        $('.page1').hide();
        $('.page2').show();
        event.preventDefault();
    });
    $('.old').on('click', function (event) {
        $('.page2').hide();
        $('.page3').show();
        event.preventDefault();

    });
    $('.new').on('click', function (event) {
        window.location.href = 'https://get.uber.com.cn';
        event.preventDefault();

    });
    $('.phonebtn').on('click', function (event) {
        Coupon.save();
        event.preventDefault();

    });
});

var musicurl = 'js/music.mp3';
var musicobj = {
    init: function() {
        $(document.body).append('<audio id="theaudio" loop="loop" autoplay="autoplay" src="' + musicurl + '"></audio>');
        $('.muscis').addClass('rotate');
    },
    musicplay: function() {
        if (audio.paused) {
            audio.play();
            $('.muscis').addClass('rotate');


        } else {
            audio.pause();
            $('.muscis').removeClass('rotate');
        }
    }
}
musicobj.init();
var audio = document.getElementById('theaudio');
$('.muscis').on('click', function() {

    musicobj.musicplay();
});
$('.animated').each(function(index, el) {
    var delay = $(this).attr('data-delay');
    $(this).css({
        animationDelay: delay,
        webkitAnimationDelay: delay
    });
});
var value = Cookie.getCookie("counpon_" + Coupon.actId) || parseInt((Math.random() * 1000 + 5000));
setInterval(function() {
                    value = parseInt(Math.random() * 10) + 1 + Number(value);
                    Cookie.createCookie("counpon_" + Coupon.actId, value);
                    $("#number").html(value);
                }, 1000);