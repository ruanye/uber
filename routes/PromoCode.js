var express=require('express');
var router=express();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

var iconv = require('iconv-lite');
var fs=require('fs');

var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var	PromoCode=require('../models/PromoCode.js');

var PromoUserObj = AV.Object.extend("PromoUser");
var PromoCodeObj = AV.Object.extend("PromoCode");

function checkLogin(req,res,next){
	//if(!req.AV.user){
	//	res.send({status:-2,url:'/admin/login.html'});
	//}else{
		next();
	//}
}

//获得promo码列表
router.post('/list/*',checkLogin);
router.post('/list/:id',function(request,response){
	var actId=request.params["id"];
	var pageNo = request.body.pageNo;
	var pageSize = request.body.pageSize;
	PromoCode.list(actId,pageNo,pageSize,function(data){
		response.send(data);
	});
});

//删除promo码
router.get('/delete/*',checkLogin);
router.get('/delete/*',function(request,response){
	var actId=request.params["0"];
	PromoCode.deleteObj(actId,function(data){
		response.send(data);
	});
});

//上传promo码
router.post('/upload/*',checkLogin);
router.post('/upload/*',function(request,response){
	var actId=request.params["0"];
	var codeStr = request.body.codeList;
	var codeList=JSON.parse(codeStr);
	//var codes=[];

	//codeList.forEach(function(code){
	//	if(code.code.length!=0&&code.couponUrl.length==0){
	//		codes.push(code.code);
	//	}
	//});

	PromoCode.upload(actId,codeList,function(updata){
		if(updata.status==1){
			updata.sameCount=0;
		}
		response.send(updata);
	});


	//PromoCode.findCodeByCodes(codes,function(data){
	//	if(data.status==-1){
	//		return response.send(data);
	//	}
	//	(data.list).forEach(function(obj){
	//		var code=obj.get("code");
	//		for(var i=0;i<codeList.length;i++){
	//			if(codeList[i].code.length!=0&&codeList[i].couponUrl.length==0){
	//				codeList.splice(i,1);
	//				continue;
	//			}
	//		}
	//	});
	//
	//});
});

//导出promo码
router.get("/exportcode/*",function(request,response){
	var objectId=request.params["0"];
    if(!objectId){
        return response.send("没有活动id");
    }
    var fileName="promoCode.csv";
    response.set({
        'Content-Type': 'application/octet-stream;charset=utf-8',
        'Content-Disposition':  "attachment;filename="+encodeURIComponent(fileName) ,
        'Pragma':'no-cache',
        'Expires': 0
    });
	//查询数据并写入文件中
    exportPromoCode(objectId,0,300,"",function(error,content){
    	if(error){
    		return response.send(JSON.stringify(error));
    	}
    	var buffer = new Buffer(content);
        //需要转换字符集
        var str=iconv.encode(buffer,'UTF-8');
        response.send(str);
    });
});

function exportPromoCode(objectId,pageNo,pageSize,content,cb){
	var query=new AV.Query(PromoCodeObj);
	query.equalTo("actId",objectId);
	query.skip(pageNo*pageSize);
	query.limit(pageSize);
	query.find({
		success:function(list){
			list.forEach(function(data){
				content+=data.get("code")+','+data.get("remark")+","+data.get("couponUrl")+','+data.get("usedUrl")+'\n';
			});
			if(list.length<pageSize){
				cb(null,content);
			}else{
				exportPromoCode(objectId,pageNo+1,pageSize,content,cb);
			}
		},
		error:function(error){
			cb(error);
		}
	});
}

//导出已抢到promo码
router.get("/export/*",function(request,response){
	var objectId=request.params["0"];
	var content='';
    if(!objectId){
        return response.send("没有活动id");
    }
    
    var fileName="promoUser.csv";
    response.set({
        'Content-Type': 'application/octet-stream;charset=utf-8',
        'Content-Disposition':  "attachment;filename="+encodeURIComponent(fileName) ,
        'Pragma':'no-cache',
        'Expires': 0
    });
	//查询数据并写入文件中
    exportPromoUser(objectId,0,300,"",function(error,content){
    	if(error){
    		return response.send(JSON.stringify(error));
    	}
    	var buffer = new Buffer(content);
        //需要转换字符集
        var str=iconv.encode(buffer,'UTF-8');
        response.send(str);
    });
});

function exportPromoUser(objectId,pageNo,pageSize,content,cb){
	var query=new AV.Query(PromoUserObj);
	query.equalTo("actId",objectId);
	query.skip(pageNo*pageSize);
	query.limit(pageSize);
	query.find({
		success:function(list){
			list.forEach(function(data){
				content+=data.get("phoneNumber")+','+(data.get("code")==undefined?"未获得":data.get("code"))+'\n';
			});
			if(list.length<pageSize){
				cb(null,content);
			}else{
				exportPromoUser(objectId,pageNo+1,pageSize,content,cb);
			}
		},
		error:function(error){
			cb(error);
		}
	});
}

module.exports=[router];