//Cookie管理
var Cookie={
	//设置cookie-value:字符串
	createCookie:function(cookieName,value,day){
	    var cookieTime = new Date();
	    cookieTime.setTime(cookieTime.getTime() + (24*60*60*1000));
	    document.cookie=cookieName+"="+value+";expires="+cookieTime.toGMTString()+";path=/;";
	},
	//读取cookies
	getCookie:function(name){
	    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	    if(arr=document.cookie.match(reg))
	        return unescape(arr[2]);
	    else
	        return null;
	},
	//删除cookie
	delCookie:function(name){
	    var exp = new Date();
	    exp.setTime(exp.getTime() - 24*60*60*1000);
	    var cval=Cookie.getCookie(name);
	    if(cval!=null)
	        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
	}
}