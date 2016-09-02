var express=require('express');
var bodyParser = require('body-parser');

var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var router=express();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//更新租赁公司
AV.Cloud.define("admin_updateCarAdmin", function (request, response) {
	var objectId = request.params.objectId;
    var username = request.params.username;
    var phone = request.params.phone;
    var nickName = request.params.nickName;
    
    var user=new AV.User();
    if(objectId==0){
		user.set("password", "123456");
		user.set("userType", 1);
    }else{
    	user=new AV.Object.createWithoutData("_User",objectId);
    }
    user.set("username", username);
    user.set("phone", phone);
    user.set("nickName", nickName);
    user.save(null, {
        success: function (user) {
        	response.success("success");
        },
        error: function (user,err) {
            response.error(err.message);
        }
    });
});

//租赁公司登录
AV.Cloud.define("admin_login", function (request, response) {
	var user=request.user;
	if(!user){
		return response.success("error");
	}

    return response.success("./activityCar.html");


    //if (user.get("username") != "admin") {
    //	user.set("loginTime", new Date());
    //	user.save(null,{
    //		success:function(user){
    //		},
    //		error:function(user,error){
    //			response.error(error);
    //		}
    //	});
    //}else {
    //    response.success("error");
    //}
});

//删除租赁公司
AV.Cloud.define("admin_deleteCarAdmin", function (request, response) {
    var objectId = request.params.objectId;
    var query = new AV.Query(AV.User);
    query.get(objectId, {
        success: function (user) {
            user.destroy({
                success: function (myObject) {
                	response.success("success");
                },
                error: function (myObject, error) {
                    response.error("删除失败");
                }
            });
        }
    });
});

//重置用户的密码
router.post("/admin_resetPwd",function(request,response){
	var objectId=request.body.objectId;
	var user=new AV.Object.createWithoutData("_User",objectId);
	user.set("password", "123456");
	user.save(null,{
		success:function(){
			response.send({error:null});
		},
		error:function(user,error){
			response.send({error:error});
		}
	});
});

module.exports = [AV.Cloud,router];