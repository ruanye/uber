/**
 * Created by zpj on 15/4/30.
 */

//前景屏幕
var fontScreen = document.getElementById("frontScreen");
var fontCtx = fontScreen.getContext("2d");

//后台缓冲
var backScreen = document.createElement("canvas");
backScreen.width = fontScreen.width;
backScreen.height = fontScreen.height;
var backCtx = backScreen.getContext("2d");

//RGBA css样式
function rgbaStr(red, green, blue, alpha){
    return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
}

function randomArc(){

    var red = (Math.random()*255).toFixed(0);
    var green = (Math.random()*255).toFixed(0);
    var blue = (Math.random()*255).toFixed(0);
    var alpha = (Math.random()).toFixed(2);
    backCtx.beginPath();
    backCtx.fillStyle = rgbaStr(red, green, blue, alpha);
    backCtx.strokeStyle = rgbaStr(red, green, blue, alpha);

    var x = (Math.random()*700).toFixed(0);
    var y = (Math.random()*700).toFixed(0);
    var r = (Math.random()*100).toFixed(0);

    backCtx.arc(x, y, r, 0, 2*Math.PI);
    backCtx.stroke();
    backCtx.fill();
    backCtx.closePath();

}



//将后台缓冲绘制到前景屏幕上
function drawBuffer(){

    randomArc();
    fontCtx.drawImage(backScreen, 0, 0);
    setTimeout("drawBuffer()", 10);

}