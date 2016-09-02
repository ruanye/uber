var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var PromoCodeObj = AV.Object.extend("PromoCode");

/**
 * promo码对象
 */
function PromoCode(objectId,code,actId){
	this.objectId=objectId;
	this.code=code;
	this.actId=actId;
}

module.exports=PromoCode;

//查询新code列表中是否有已保存的code
PromoCode.findCodeByCodes=function(codes,callback){
	try{
		var query=new AV.Query(PromoCodeObj);
		query.containedIn("code",codes);
		query.equalTo("couponUrl","");
		query.find({
			success:function(list){
				callback({status:1,list:list});
			},
			error:function(error){
				callback({status:-1,error:error.message});
			}
		});
	}catch(error){
		callback({status:-1,error:error.message});
	}
}

//查询获得promo码列表
PromoCode.list=function(actId,pageNo,pageSize,callback){
	try{
		var query=new AV.Query(PromoCodeObj);
		query.limit(pageSize);
		query.skip((pageNo-1)*pageSize);
		query.equalTo("actId",actId);
		query.descending("createdAt");
		query.find({
			success:function(list){
				callback({status:1,list:list});
			},
			error:function(error){
				callback({status:-1,error:error.message});
			}
		});
	}catch(error){
		callback({status:-1,error:error.message});
	}
}

//通过活动id删除promo码
PromoCode.deleteObj=function(actId,callback){
	deleteObj(300,actId,function(data){
		callback(data);
	});
}

function deleteObj(limitCount,actId,callback){
	try{
		var query = new AV.Query(PromoCodeObj);
		query.equalTo("actId",actId);
		query.limit(limitCount);
		query.find({
			success:function(list){
				AV.Object.destroyAll(list,{
					success:function(data){
						if(list.length<limitCount){
							return callback({status:1});
						}else{
							deleteObj(limitCount,actId,callback)
						}
					},
					error:function(error){
						return callback({status:-1,error:error.message});
					}
				});
			},
			error:function(error){
				return callback({status:-1,error:error.message});
			}
		});
	}catch(error){
		callback({status:-1,error:error.message});
	}
}

//上传某promo码
PromoCode.upload=function(actId,codes,callback){
	try{
		var array=[];
		var uObj=null;
		codes.forEach(function(obj,i){
			uObj=new PromoCodeObj();
			for(var key in obj){
				uObj.set(key,obj[key]);
			}
			uObj.set("actId",actId);
			array[i]=uObj;
		});
		AV.Object.saveAll(array,{
			success:function(data){
				callback({status:1,count:array.length});
			},
			error:function(error){
				callback({status:-1,error:error.message});
			}
		});
	}catch(error){
		callback({status:-1,error:error.message});
	}
}