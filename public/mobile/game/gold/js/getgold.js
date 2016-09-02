/**
 * Created by zpj on 15/4/27.
 */

//游戏时间
var surplusSecond = 0;

//过关字符串
//var targetMsg = "Uber祝您新春快乐猴年吉祥";
//var targetMsg = "Uber祝您猴年吉祥";
var targetMsg = "Uber祝";
//临时字符串
var tempMsg = "";
//计数
var num = 0;
var msgindex = 0;

//炸弹对象
var bomb = new Image();
bomb.src = "images/dan.png";
bomb.value = 0;
bomb.speed = 40;
// 金币对像
var logos = new Array();
for(var i = 0; i <= 10; i++){
    logos[i] = new Image();
    var index = "";
    if(i<10){
        index = "0"+i;
    }else{
        index = i;
    }
    logos[i].src = "images/logo"+index+".png";
    logos[i].speed = 30;
    switch(i)
    {
        case 0:
            logos[i].value = "Uber:"+i;
            break;
        case 1:
            logos[i].value = "祝:"+i;
            break;
        case 2:
            logos[i].value = "您:"+i;
            break;
        case 3:
            logos[i].value = "新:"+i;
            break;
        case 4:
            logos[i].value = "春:"+i;
            break;
        case 5:
            logos[i].value = "快:"+i;
            break;
        case 6:
            logos[i].value = "乐:"+i;
            break;
        case 7:
            logos[i].value = "猴:"+i;
            break;
        case 8:
            logos[i].value = "年:"+i;
            break;
        case 9:
            logos[i].value = "吉:"+i;
            break;
        case 10:
            logos[i].value = "祥:"+i;
            break;
        default:
            logos[i].value = "";
    }
}
logos.push(bomb);


var heroImg = new Image();
heroImg.src = "images/man01.png";

var bg = new Image();
bg.src = "images/cj.png";

var heroPicArray = new Array();
heroPicArray[0] = new Image();
heroPicArray[0].src = "images/man01.png";
//heroPicArray[1] = new Image();
//heroPicArray[1].src = "images/man02.png";
//heroPicArray[2] = new Image();
//heroPicArray[2].src = "images/man03.png";
//heroPicArray[3] = new Image();
//heroPicArray[3].src = "images/man04.png";
//heroPicArray[4] = new Image();
//heroPicArray[4].src = "images/man03.png";
//heroPicArray[5] = new Image();
//heroPicArray[5].src = "images/man02.png";






// 金币类;
function Money(x,y,speed,img){
    // 没次循环增加的像素数
    this.speed = speed;
    this.x = x;
    this.y = y;
    this.width = img.width;
    this.height = img.height;
    this.img = img;
    this.value = img.value;
}

Money.prototype = {
    draw:function(ctx){
        ctx.drawImage(this.img,this.x,this.y);
    },
    move:function(){
        this.y += this.speed;
    }
}
// 主角
function Hero(x,y,img){
    this.grade = 0;
    this.life = 1;
    this.x = x;
    this.y = y;
    this.img = img;
    this.width = img.width;
    this.height = img.height;
}

var idx = 0;

Hero.prototype = {
    draw:function(ctx){
        //ctx.drawImage(this.img,this.x,this.y);
        ctx.drawImage(heroPicArray[0],this.x,this.y);
        //idx++;
    },
    touch:function(other){  //碰撞检测 this.hero.life--;
        var tmpY = 0;
        if(other.value == 0){
            tmpY = other.y + other.height-40;
            this.grade = 0;
        }else{
            tmpY = other.y + other.height;
        }

        if( this.x + this.width > other.x && this.x < other.x + other.width &&
            this.y + this.height/5 > other.y && this.y < tmpY){
            if(other.value == 0){
                App.gameOver();
            }
            var strs = other.value.split(":");
            tempMsg += strs[0];
            if(targetMsg.indexOf(tempMsg)!=0){
                App.gameOver();
            }else{
                var ub = document.getElementById("t"+strs[1]);
                ub.style.color = "red";
                ub.style.fontSize = "3rem";
                msgindex++;
                if(msgindex==3){
                    msgindex =7;
                }
            }

            if(targetMsg==tempMsg){
                this.grade += 100;
                App.gameOver();
            }
            return true;
        }
        return false;
    }
}
var App = {

    // 对象
    elements:[],
    backImg:bg,
    imgs:logos,
    hero:null,
    // 画布
    canvas:null,
    // 绘制工具
    context:null,

    frontCanvas:null,

    frontContext:null,

    // 定时器
    timer:null,
    // 速度（更新间隔speed * 10）
    speed:0,
    pause:false,
    // 绘制对象
    draw:function(){
        // 清屏
        this.context.clearRect(0,0,this.canvas.width,canvas.height);
        // 绘制背景
        this.context.drawImage(this.backImg,0,0, this.canvas.width,canvas.height);

        // 绘制娃娃脸
        this.hero.draw(this.context);
        // 绘制金币
        for(var i=0;i<this.elements.length;i++){
            var o = this.elements[i];
            // 清理屏幕外的对象
            //
            if(o.x > this.canvas.width || o.x < 0 || o.y > this.canvas.height || o.y < 0){
                this.elements.splice(i,1);

            }else if(this.hero.touch(o)){

                if(o.value == 0)
                    this.hero.life--;
                else
                    this.elements.splice(i,1);
            }else{
                o.draw(this.context);
            }
        }

        drawScore(this.context, surplusSecond, this.hero.grade);

        //绘制缓存
        drawBuffer(this.frontContext, this.frontCanvas, this.context, this.canvas);
    },
    // 循环处理
    loop:function(){
        var me = App;
        if(me.pause){
            return;
        }
        for(var i=0;i<me.elements.length;i++){
            me.elements[i].move();
        }
        var chance = Math.random() * 9000;
        // 1/10的对象添加概率

        //物品出现的几率
        if(chance < 400){
            var img = {};
            if(num%4==0){
                if(me.imgs.length-1==num/4){
                    num = 0;
                }
                img = me.imgs[msgindex];

                var x = Math.random()*(me.canvas.width - me.imgs[parseInt(chance%me.imgs.length)].width);
                var y = 0;
                var speed = img.speed;
                var money = new Money(x,y,speed,img);
                me.addElement(money);

            }
            img = me.imgs[parseInt(chance%me.imgs.length)];

            var x = Math.random()*(me.canvas.width - me.imgs[parseInt(chance%me.imgs.length)].width);
            var y = 0;
            var speed = img.speed;
            var money = new Money(x,y,speed,img);
            me.addElement(money);
            num++;
        }

        me.draw();
        if(me.hero.life == 0){
            console.log(me.hero.life);
            me.gameOver();
        }
    },
    // 开始游戏
    gameStart:function(id,speed){

        var me = this;


        //me.canvas = document.getElementById(id);
        //me.context = me.canvas.getContext("2d");

        //前景界面
        me.frontCanvas = document.getElementById(id);
        me.frontContext = me.frontCanvas.getContext("2d");

        //缓存界面
        me.canvas = document.createElement("canvas");
        me.canvas.width = me.frontCanvas.width;
        me.canvas.height = me.frontCanvas.height;
        me.context = me.canvas.getContext("2d");

        me.speed = speed;
        console.log(heroImg.width);
        me.hero = new Hero((me.canvas.width - heroImg.width)/2, me.canvas.height - heroImg.height,heroImg);
        if(this.timer != null)
            me.gameOver();

        //人物移动处理
        function touchmove(e){

            var touchobj = e.changedTouches[0];

            //touchobj = window.event || touchobj;

            var x = touchobj.clientX - me.frontCanvas.offsetLeft - me.hero.width/2;

            if(x > 0 && x < me.frontCanvas.width - me.hero.width){
                me.hero.x = x;
            }

            e.preventDefault();
        }

        me.frontCanvas.addEventListener("touchmove", touchmove);


        me.timer = setInterval(me.loop,me.speed * 10);
    },
    // 暂停游戏
    gamePause:function(){
        this.pause = true;
        this.context.textAlign = "center";
        this.context.fillStyle = "#f00";
        this.context.font = 'bold 40px Arial';
        this.context.fillText("暂停",this.canvas.width/2,this.canvas.height/2);
        this.context.font = 'bold 30px Arial';
        this.context.fillText("点击屏幕继续",this.canvas.width/2,this.canvas.height/2 + 40);
    },
    // 结束游戏
    gameOver:function(){
        clearInterval(this.timer);
        this.elements = [];
        this.pause = false;
        this.timer = null;
        this.context.textAlign = "center";
        this.context.fillStyle = "#f00";
        this.context.font = 'bold 40px Arial';
        if(this.hero.grade==0){
            this.context.fillText("真可惜,接错了...",this.canvas.width/2,this.canvas.height/2);
        }else{
            this.context.fillText("Uber祝你新春快乐,猴年大吉",this.canvas.width/2,this.canvas.height/2);
        }

        var rank = -1;
        if(this.hero.grade < 1000){
            rank = 3;
        }else if(this.hero.grade < 1500){
            rank = 2;
        }else{
            //rank = 1;
            rank = 3;
        }

        //alert("您总共获得了"+ this.hero.grade  +"分");

        setTimeout(function(){
            localStorage.setItem("rank", rank);
            localStorage.setItem("score", App.hero.grade);
            location.href = "index.html";
        }, 2000);

        //document.onclick =  function(){

        //}

    },
    // 添加对象
    addElement:function(o){
        this.elements.push(o);
    }
}



var interval = 0;

window.onload = function (){

    setTimeout("initGame()", 100);


}

function initGame(){
    var can =   document.createElement("canvas");

    //document.getElementById("canvas");

    can.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    can.height = window.innerHeight-80 || document.documentElement.clientHeight-80 || document.body.clientHeight-80;
    can.id = "canvas";
    document.body.appendChild(can);

    var div = document.createElement("div");
    var html = "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;font-size: 2.5rem;' id='t0'>Uber</font>";
    html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;font-size: 2.5rem;' id='t1'>祝</font>";
    html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;font-size: 2.5rem;' id='t2'>您</font>";
    //html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;' id='t3'>新</font>";
    //html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;' id='t4'>春</font>";
    //html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;' id='t5'>快</font>";
    //html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;' id='t6'>乐</font>";
    html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;font-size: 2.5rem;' id='t7'>猴</font>";
    html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;font-size: 2.5rem;' id='t8'>年</font>";
    html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;font-size: 2.5rem;' id='t9'>吉</font>";
    html += "<font style='letter-spacing: 1px;margin-right: 1.5rem;margin-left: 1.5rem;font-size: 2.5rem;' id='t10'>祥</font>";
    div.innerHTML = html;
    div.className = "newDiv";
    document.body.appendChild(div);

    var ctx =  can.getContext("2d");
    ctx.drawImage(bg,0,0, can.width, can.height);
    ctx.drawImage(heroImg,(can.width - heroImg.width)/2,can.height - heroImg.height);

    if("start" != localStorage.getItem("startGame")){
        drawScore(ctx, 1, 0);
        document.getElementById("initHint").style.display = "none";
        return ;
    }

    localStorage.setItem("startGame", "end");
    //ctx.textAlign = "center";
    //ctx.fillStyle = "#f00";
    //ctx.font = 'bold 40px Arial';
    //ctx.fillText("游戏开始",can.width/2,can.height/2);

    //游戏时间
    surplusSecond = 200;

    localStorage.setItem("rank", -1);

    App.gameStart("canvas",6);

    window.clearInterval(interval);

    interval = setInterval(function (){
        surplusSecond --;
        if(surplusSecond <= 0){
            App.hero.life = 0;
        }
    }, 1000);

    drawScore(ctx, 1, 0);

    document.getElementById("initHint").style.display = "none";
}

//清屏并绘制缓存
function drawBuffer(fontCtx, fontCvs,  backCtx, backCvs){
    fontCtx.clearRect(0, 0, fontCvs.width, fontCvs.height);
    fontCtx.drawImage(backCvs, 0, 0);
}

function drawScore(ctx, life, grade){
    //绘制生命值及得分
    ctx.fillStyle = "#f7605f";
    ctx.fillRect(0, 0, this.canvas.width, 50);

    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.moveTo(this.canvas.width/2-1, 10);
    ctx.lineTo(this.canvas.width/2-1, 40);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = 'normal 30px Arial';
    ctx.fillStyle = "#fff";
    ctx.fillText("余时: " + surplusSecond + " 秒", this.canvas.width/8, 35);
    //ctx.fillText("得分: " + grade + " 分", this.canvas.width/15*11, 35);

    //画底部条
    ctx.fillStyle="#7c3201";
    ctx.fillRect(0, this.canvas.height - 10, canvas.width, canvas.height);
}



//function $(id){
//    return document.getElementById(id);
//}