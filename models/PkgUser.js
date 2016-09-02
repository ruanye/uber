var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var PkgUserObj = AV.Object.extend("PkgUser");

/**
 * 券包对象
 */
function PkgUser(objectId,phone,pkgId,actId){
	this.objectId=objectId;
	this.phone=phone;
	this.pkgId=pkgId;
	this.actId=actId;
}

module.exports=PkgUser;

//通过手机号得到某券包用户
PkgUser.getUserByPhone=function(phone,callback){
	try{
		var query=new AV.Query(PkgUserObj);
		query.equalTo("phone",phone);
		query.descending("createdAt");
		query.first({
			success:function(data){
				if(data==null){
					callback("不存在您的券包信息",null);
				}else{
					callback(null,data);
				}
			},
			error:function(error){
				callback(error,null);
			}
		});
	}catch(error){
		callback(error,null);
	}
}

//查询获得券包用户列表
PkgUser.list=function(actId,pageNo,pageSize,callback){
	try{
		var query=new AV.Query(PkgUserObj);
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

//删除某券包用户
PkgUser.deleteObj=function(actId,callback){
	deleteObj(300,actId,function(data){
		callback(data);
	});
}

function deleteObj(limitCount,actId,callback){
	try{
		var query = new AV.Query(PkgUserObj);
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

//上传某券包用户
PkgUser.upload=function(actId,userArray,callback){
	try{
		var array=[];
		var uObj=null;
		userArray.forEach(function(obj,i){
			uObj=new PkgUserObj();
			for(var key in obj){
				uObj.set(key,obj[key]);
			}
			uObj.set("couponPkg",AV.Object.createWithoutData("CouponPkg",uObj.get("pkgId")));
			uObj.set("actId",actId);
			uObj.set("actCar", AV.Object.createWithoutData("ActivityCar",actId));
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