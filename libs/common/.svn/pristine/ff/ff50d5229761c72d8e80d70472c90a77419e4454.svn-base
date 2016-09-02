var crypto = require('crypto');

var Constants = require("../../config/welfare.json");

//签名工具类
module.exports=SignUtil={
	/**
	 * 创建签名
	 * @param data 需要加密的数据
	 * @param secretKey 签名所用到的key
	 */
	createSign:function(data,secretKey){
		return crypto.createHmac('md5', secretKey).update(data).digest('hex');
	},
	/**
	 * 生成链接
	 * @param linkUrl 商家url
	 * @param objectId 兑换的商家券id
	 */
	getLinkUrl:function(linkUrl,objectId){
	    if(linkUrl){
	        //认为已经存在了参数，只哟通过&拼凑其他参数
	        if(linkUrl.indexOf('?')!=-1){
	            linkUrl+='&';
	        }else{
	            linkUrl+='?';
	        }
	        linkUrl+='uber_sign='+SignUtil.createSign(objectId,Constants.secretkey.usedwelfare);
	    }
	    return linkUrl;
	}
}