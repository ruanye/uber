var express=require('express');
var router=express();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

var	PkgUser=require('../models/PkgUser.js');

function checkLogin(req,res,next){
	if(!req.AV.user){
		res.send({status:-2,url:'/admin/login.html'});
	}else{
		next();
	}
}

//获得券包用户列表
router.post('/list/*',checkLogin);
router.post('/list/*',function(request,response){
	var actId=request.params["0"];
	var pageNo = request.body.pageNo;
	var pageSize = request.body.pageSize;
	PkgUser.list(actId,pageNo,pageSize,function(data){
		response.send(data);
	});
});

//删除券包用户
router.get('/delete/*',checkLogin);
router.get('/delete/*',function(request,response){
	var actId=request.params["0"];
	PkgUser.deleteObj(actId,function(data){
		response.send(data);
	});
});

//上传券包用户
router.post('/upload/*',checkLogin);
router.post('/upload/*',function(request,response){
	var actId=request.params["0"];
	var userList = request.body.userList;
	var userArray=JSON.parse(userList);
	PkgUser.upload(actId,userArray,function(data){
		response.send(data);
	});
});

module.exports=[router];