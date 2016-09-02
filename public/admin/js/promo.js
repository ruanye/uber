var Promo = {
	pageNo: 1,        
    pageSize: 10,
    activity_objectId:"",

    //上一页/下一页
    goPage: function(type) {
        var page=Promo.pageNo;
        if(type==-1){
            Promo.pageNo=page-1;
        }else if(type==1){
            Promo.pageNo=page+1;
        }
        Promo.loadData();
    },
    //加载活动列表
	loadData: function() {
		AV.Cloud.run("admin_activity_car_list",{pageNo:Promo.pageNo,pageSize:Promo.pageSize,type:"promo"},{
			success:function(list){
				if(Promo.pageSize==list.length){
					$("#btn1").removeAttr("disabled");
				}else{
					$("#btn1").attr("disabled","disabled");
				}
				if(Promo.pageNo == 1){
					$("#btn2").attr("disabled","disabled");
				}else{
					$("#btn2").removeAttr("disabled");
				}
				var tableHtml="";
				for (var i = 0; i < list.length; i++) {
					tableHtml+="<tr>" +
									"<td>"+list[i].name+"</td>"+
//									"<td>"+(list[i].robType==0?"输入手机号":"带参uuid")+"</td>"+
									"<td>"+list[i].cutoffDate+"</td>" +
									"<td>"+(list[i].isEffective=="1"?"有效":"无效")+"</td>";
                   tableHtml+= "<td id='nt_" + list[i].objectId + "'> <span style='font-size: 10px'>计算中</span> </td>";

                    tableHtml += "<td nowrap='true' style='width: 150px'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
                        + "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
                        + "<span class='caret'></span></button>"
                        + "<ul class='dropdown-menu' role='menu'>";
                    tableHtml +=
                        "<li><a href='javascript:void(0)' onclick='Promo.showSaveView(\""+list[i].objectId+"\")'>修改</a></li>"+
                        "<li><a href='javascript:void(0)' onclick='Promo.deleteObj(\""+list[i].objectId+"\")'>删除</a></li>";
                    if(list[i].isEffective=="1"){
                    	tableHtml +="<li><a href='javascript:void(0)' onclick='Promo.showUrl(\""+list[i].objectId+"\")'>链接</a></li>";
                    	tableHtml +="<li><a href='javascript:void(0)' onclick='Promo.setEffective(\""+list[i].objectId+"\",0)'>设置为无效</a></li>";
                    }else{
                    	tableHtml +="<li><a href='javascript:void(0)' onclick='Promo.setEffective(\""+list[i].objectId+"\",1,"+list[i].isAllowDelete+")'>设置为有效</a></li>";
                    }
                    tableHtml +="<li><a href='javascript:void(0)' onclick='PromoCode.loadData(\""+list[i].objectId+"\","+list[i].isAllowDelete+")'>导入promo码</a></li>"+
                    	"<li><a href='../../promocode/exportcode/"+list[i].objectId+"' target='_blank'>导出promo码</a></li>"+
                        "<li><a href='../../promocode/export/"+list[i].objectId+"' target='_blank'>导出已抢用户</a></li>" +
                        "</ul></td></tr>";

                    setTimeout("Promo.countJoind('"+ list[i].objectId +"')",1000);

				}
				$("#dataMsg").html(tableHtml);
			},
			error:function(error){
				console.log(JSON.stringify(error));
			}
		});
    },
    //设置有效
    setEffective:function(objectId,isEffective,isAllowDelete){
    	if(isAllowDelete!=undefined&&isAllowDelete==0){
    		if(confirm("生效后，之后再也不能删除promo码，是否继续？")){
    			Promo.setEffectiveData(objectId,isEffective);
    		}
    	}else{
    		Promo.setEffectiveData(objectId,isEffective);
    	}
    },
    setEffectiveData:function(objectId,isEffective){
    	var actObj=new AV.Object.createWithoutData("ActivityCar",objectId);
		actObj.set("isEffective",isEffective+"");
		actObj.set("isAllowDelete",1);
		actObj.save(null,{
    		success:function(data){
    			$("#hint_MSG").html("<font color='blue'>设置状态成功</font>").show().delay(3000).hide(0);
    			Promo.loadData();
    		},
    		error:function(obj,error){
    			$("#hint_MSG").html("<font color='red'>"+error.message+"</font>").show().delay(3000).hide(0);
    		}
    	});
    },
    showSaveView:function(objectId){
    	 $("#name").val('');
    	 $("#couponContent").parent(".editor").find(".note-editable").html("");
         $("#successContent").val('');
         $("#repeatContent").val('');
         $("#endContent").parent(".editor").find(".note-editable").html("");
         $("#sharecontent").val('');
         $("#cutoffDate").val('');
         $("#appUrl").val('');
//         ($("input[name='robType']")[0]).checked="checked";
        if(objectId!=''){
            var query=new AV.Query(ActivityCar);
            query.get(objectId, {
                success: function(obj) {
                	var gameType=obj.get("gameType");
                	$("#op_"+gameType).attr("selected","selected");
                	$("#name").val(obj.get("name"));
                	 $("#couponContent").parent(".editor").find(".note-editable").html(obj.get("couponContent"));
                    $("#successContent").val(obj.get("successContent"));
                    $("#repeatContent").val(obj.get("repeatContent"));
                    $("#endContent").parent(".editor").find(".note-editable").html(obj.get("endContent"));
                    $("#sharecontent").val(obj.get("sharecontent"));
                    $("#cutoffDate").val(obj.get("cutoffDate"));
                    $("#appUrl").val(obj.get("appUrl"));
//                    ($("input[name='robType']")[obj.get("robType")]).checked="checked";
                },
                error: function(object, error) {
                    $("#hintInfo").html("<font color='red'>"+object+"</font>").show().delay(3000).hide(0);
                }
            });
        }
        Promo.activity_objectId = objectId;
		$("#myModal").modal("show");
    },
    saveData:function(){
        if($("#name").val()==''){
            $("#hintInfo").html("<font color='red'>活动名称为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#cutoffDate").val()==''){
            $("#hintInfo").html("<font color='red'>有效期为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#appUrl").val()==''){
            $("#hintInfo").html("<font color='red'>请输入app链接</font>").show().delay(3000).hide(0);
            return;
        }
        var couponContent=$("#couponContent").parent(".editor").find(".note-editable").html();
        if(couponContent==''){
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
        var endContent=$("#endContent").parent(".editor").find(".note-editable").html();
        if(endContent==''){
            $("#hintInfo").html("<font color='red'>领取完提示文字为空</font>").show().delay(3000).hide(0);
            return;
        }
        if($("#sharecontent").val()==''){
            $("#hintInfo").html("<font color='red'>可复制的分享文字为空</font>").show().delay(3000).hide(0);
            return;
        }
//        var robType=($("input[name='robType']")[1]).checked;
//    	if(robType){
//    		robType=1;
//    	}else{
//    		robType=0;
//    	}
    	
    	var gameType=$("#game_sel").val();
    	
        var obj = new ActivityCar();
        if(Promo.activity_objectId!=''){
        	obj=new AV.Object.createWithoutData("ActivityCar",Promo.activity_objectId);
        }else{
    		var user=AV.User.current();
    		if(user.get("userType")==1){
    			obj.set("userId", user.id);
    			obj.set("userName",user.get("username"));
    			obj.set("user",user);
    		}
            obj.set("type","promo");
        }
        obj.set("gameType",gameType);
        obj.set("name",$("#name").val());
//        obj.set("robType",robType);
        obj.set("appUrl",$("#appUrl").val());
        obj.set("couponContent", couponContent);
        obj.set("successContent", $("#successContent").val());
        obj.set("repeatContent", $("#repeatContent").val());
        obj.set("endContent", endContent);
        obj.set("sharecontent", $("#sharecontent").val());
        obj.set("cutoffDate", $("#cutoffDate").val());
        obj.save(null,{
            success: function(obj) {
                $("#hintinfo").html("<font color='blue'>保存成功</font>").show().delay(3000).hide(0);
                $("#myModal").modal("hide");
                Promo.loadData();
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
                    Promo.loadData();
                },
                error:function(error){
                    console.log(error);
                    $("#hint_MSG").html("<font color='red'>"+error+"</font>").show().delay(3000).hide(0);
                }
            });
        }
    },
    //显示链接
    showUrl:function(objectId){
    	var url=window.location.host+"/promo/mobile/"+objectId;
    	if(url.indexOf("http://")==-1){
    		url="http://"+url;
    	}
    	$("#showUrl").val(url);
        $("#UrlModal").modal("show");
    },
    //统计参与人数
    countJoind:function(objectId){
        AV.Cloud.run("admin_promo_partcount",{activityId:objectId},{
            success:function(count){
                 $("#nt_" + objectId).html(count);
            },
            error:function(error){
            	console.log(JSON.stringify(error));
            }
        });
    }
};