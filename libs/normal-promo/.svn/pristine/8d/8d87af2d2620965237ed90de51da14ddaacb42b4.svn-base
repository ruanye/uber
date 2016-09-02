var activityCar = {
	pageNo: 1,        
    pageSize: 10,
    activity_objectId:"",

    //上一页/下一页
    goPage: function(type) {
        var page=activityCar.pageNo;
        if(type==-1){
            activityCar.pageNo=page-1;
        }else if(type==1){
            activityCar.pageNo=page+1;
        }
        activityCar.loadData();
    },
    //加载活动列表
	loadData: function() {
		AV.Cloud.run("admin_activity_car_list",{pageNo:activityCar.pageNo,pageSize:activityCar.pageSize},{
			success:function(list){
				if(activityCar.pageSize==list.length){
					$("#btn1").removeAttr("disabled");
				}else{
					$("#btn1").attr("disabled","disabled");
				}
				if(activityCar.pageNo == 1){
					$("#btn2").attr("disabled","disabled");
				}else{
					$("#btn2").removeAttr("disabled");
				}
				var tableHtml="";
				for (var i = 0; i < list.length; i++) {
					tableHtml+="<tr>" +
									"<td>"+list[i].name+"</td>" +
									"<td>"+list[i].actMoney+"</td>" +
									"<td>"+list[i].cutoffDate+"</td>" +
									"<td>"+(list[i].isEffective=="1"?"有效":"无效")+"</td>";
                   tableHtml+= "<td id='nt_" + list[i].objectId + "'> <span style='font-size: 10px'>计算中</span> </td>";

                    tableHtml += "<td nowrap='true' style='width: 150px'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
                        + "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
                        + "<span class='caret'></span></button>"
                        + "<ul class='dropdown-menu' role='menu'>";
                    tableHtml +=
                        "<li><a href='javascript:void(0)' onclick='activityCar.showSaveView(\""+list[i].objectId+"\")'>修改</a></li>"+
                        "<li><a href='javascript:void(0)' onclick='activityCar.deleteObj(\""+list[i].objectId+"\")'>删除</a></li>";
                    if(list[i].isEffective=="1"){
                    	tableHtml +="<li><a href='javascript:void(0)' onclick='activityCar.showUrl(\""+list[i].objectId+"\",\""+(list[i].pageUrl||'demo_more/index.html')+"\")'>链接</a></li>";
                    	tableHtml +="<li><a href='javascript:void(0)' onclick='activityCar.setEffective(\""+list[i].objectId+"\",0)'>设置为无效</a></li>";
                    }else{
                    	tableHtml +="<li><a href='javascript:void(0)' onclick='activityCar.setEffective(\""+list[i].objectId+"\",1)'>设置为有效</a></li>";
                    }
                    tableHtml +="<li><a href='couponPkg.html?objectId="+list[i].objectId+"'>查看券包</a></li>";
                    tableHtml +="<li><a href='javascript:void(0)' onclick='PkgUser.loadData(\""+list[i].objectId+"\")'>导入用户</a></li>"+
                        "<li><a href='javascript:void(0)' onclick='exportCoupon(\""+list[i].objectId+"\")'>导出</a></li>" +
                        "</ul></td></tr>";

                    setTimeout("activityCar.countJoind('"+ list[i].objectId +"')",1000);

				}
				$("#dataMsg").html(tableHtml);
			},
			error:function(error){
				console.log(JSON.stringify(error));
			}
		});
    },
    //设置是否有效
    setEffective:function(objectId,isEffective){
    	if(isEffective==0){
    		activityCar.setEffectiveData(objectId,isEffective);
    	}else{
    		var query=new AV.Query(CouponPkgObj);
    		query.equalTo("activityId",objectId);
    		query.greaterThan("defaultTime",0);
    		query.count({
    			success:function(count){
    				if(count==0){
    					$("#hint_MSG").html("<font color='red'>设置状态失败,请设置默认包！</font>").show().delay(5000).hide(0);
    				}else{
    					activityCar.setEffectiveData(objectId,isEffective);
    				}
    			},
    			error:function(error){
    				$("#hint_MSG").html("<font color='red'>"+error.message+"</font>").show().delay(3000).hide(0);
    			}
    		});
    	}
    },
    //设置有效
    setEffectiveData:function(objectId,isEffective){
    	var actObj=new AV.Object.createWithoutData("ActivityCar",objectId);
		actObj.set("isEffective",isEffective+"");
		actObj.save(null,{
    		success:function(data){
    			$("#hint_MSG").html("<font color='blue'>设置状态成功</font>").show().delay(3000).hide(0);
    			activityCar.loadData();
    		},
    		error:function(obj,error){
    			$("#hint_MSG").html("<font color='red'>"+error.message+"</font>").show().delay(3000).hide(0);
    		}
    	});
    },
    showSaveView:function(objectId){
    	 $("#name").val('');
         $("#couponContent").val('');
         $("#successContent").val('');
         $("#repeatContent").val('');
         $("#endContent").val('');
         $("#sharecontent").val('');
         $("#cutoffDate").val('');
         $("#actMoney").val('');
         $("#pageUrl").val('');
        if(objectId!=''){
            var query=new AV.Query(ActivityCar);
            query.get(objectId, {
                success: function(obj) {
                    $("#name").val(obj.get("name"));
                    $("#actMoney").val(obj.get("actMoney"));
                    $("#couponContent").val(obj.get("couponContent"));
                    $("#successContent").val(obj.get("successContent"));
                    $("#repeatContent").val(obj.get("repeatContent"));
                    $("#endContent").val(obj.get("endContent"));
                    $("#sharecontent").val(obj.get("sharecontent"));
                    $("#cutoffDate").val(obj.get("cutoffDate"));
                    $("#pageUrl").val(obj.get("pageUrl"));
                },
                error: function(object, error) {
                    $("#hintInfo").html("<font color='red'>"+object+"</font>").show().delay(3000).hide(0);
                }
            });
        }
        activityCar.activity_objectId = objectId;
		$("#myModal").modal("show");
    },
    saveData:function(){
        if($("#name").val()==''){
            $("#hintInfo").html("<font color='red'>活动名称为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#actMoney").val()==''){
            $("#hintInfo").html("<font color='red'>活动总金额为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#couponNum").val()==''){
            $("#hintInfo").html("<font color='red'>领取总数为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#couponContent").val()==''){
            $("#hintInfo").html("<font color='red'>领取前提示文字为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#successContent").val()==''){
            $("#hintInfo").html("<font color='red'>领取成功提示文字为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#repeatContent").val()==''){
            $("#hintInfo").html("<font color='red'>重复领取提示文字为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#endContent").val()==''){
            $("#hintInfo").html("<font color='red'>领取完提示文字为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#sharecontent").val()==''){
            $("#hintInfo").html("<font color='red'>可复制的分享文字为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#cutoffDate").val()==''){
            $("#hintInfo").html("<font color='red'>有效期为空</font>").show().delay(3000).hide(0);
            return;
        }
        var obj = new ActivityCar();
        if(activityCar.activity_objectId!=''){
        	obj=new AV.Object.createWithoutData("ActivityCar",activityCar.activity_objectId);
        }else{
    		var user=AV.User.current();
    		if(user.get("userType")==1){
    			obj.set("userId", user.id);
    			obj.set("userName",user.get("username"));
    			obj.set("user",user);
    		}
        }
        obj.set("name", $("#name").val());
        obj.set("actMoney", parseFloat($("#actMoney").val()));
        obj.set("couponContent", $("#couponContent").val());
        obj.set("successContent", $("#successContent").val());
        obj.set("repeatContent", $("#repeatContent").val());
        obj.set("endContent", $("#endContent").val());
        obj.set("sharecontent", $("#sharecontent").val());
        obj.set("cutoffDate", $("#cutoffDate").val());
        obj.set("pageUrl",$("#pageUrl").val());
        obj.save(null,{
            success: function(obj) {
                $("#hintinfo").html("<font color='blue'>保存成功</font>").show().delay(3000).hide(0);
                $("#myModal").modal("hide");
                activityCar.loadData();
            },
            error: function(saveResult, error) {
                $("#hintinfo").html("<font color='red'>"+ error.message +"</font>").show().delay(3000).hide(0);
            }
        });
    },
    //删除活动
    deleteObj:function(objectId){
        if(confirm("是否确认删除!")){
            AV.Cloud.run("admin_activity_car_del",{objectId:objectId},{
                success:function(msg){
                    $("#hint_MSG").html("<font color='blue'>"+msg+"</font>").show().delay(3000).hide(0);
                    activityCar.loadData();
                },
                error:function(error){
                    console.log(error);
                    $("#hint_MSG").html("<font color='red'>"+error+"</font>").show().delay(3000).hide(0);
                }
            });
        }
    },
    //显示链接
    showUrl:function(objectId,url){
    	var url=window.location.host+"/mobile/"+url+"?id="+objectId;
    	if(url.indexOf("http://")==-1){
    		url="http://"+url;
    	}
    	$("#showUrl").val(url);
        $("#UrlModal").modal("show");
    },
    //统计参与人数
    countJoind:function(objectId){
        AV.Cloud.run("admin_activity_partcount",{activityId:objectId},{
            success:function(count){
                 $("#nt_" + objectId).html(count);
            },
            error:function(error){
            	console.log(JSON.stringify(error));
            }
        });
    }
};

function exportCoupon(actId){
    $("#activityId").val(actId);
    $("#exportForm").submit();
}