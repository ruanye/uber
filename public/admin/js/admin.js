/**
 * 
 * 2016-01-04
 * 叶波
 * userType 1
 */
var Admin={
	//加载分页数据
	loadData:function(){
		var query=new AV.Query(AV.User);
		query.equalTo("userType",1);
		query.descending("updatedAt");
		query.find({
			success: function(list){
				Admin.showView(list);
			},
			error: function(error){
				Admin.showMsg($("#hintinfo3"),"red",error.message);
			}
		});
	},
	//显示页面数据
	showView:function(list){
		//清空选择数据 
		var tableHtml="";
		for (var i = 0; i < list.length; i++) {
			tableHtml+="<tr>" +
					"<td>"+list[i].get('username')+"</td>"+
					"<td>"+list[i].get('nickName')+"</td>"+
					"<td>"+list[i].get('phone')+"</td>";
			if(list[i].get('loginTime')==null||list[i].get('loginTime')==undefined){
				tableHtml+="<td></td>";
			}else{
				tableHtml+="<td>"+new Date(list[i].get('loginTime')).format('yyyy-MM-dd hh:mm')+"</td>";
			}
			tableHtml+="<td>" +
					'<button onclick="Admin.edit(\''+list[i].id+'\')" class="btn btn-warning">修改</button>&nbsp;&nbsp;' +
					'<button onclick="Admin.resetPwd(\''+list[i].id+'\')" class="btn btn-warning">重置密码</button>&nbsp;&nbsp;' +
					'<button onclick="Admin.deleteData(\''+list[i].id+'\')" class="btn btn-primary">删除</button>&nbsp;&nbsp;' +
					"</td>" +
					"</tr>";
		}
		$("#dataMsg").html(tableHtml);
	},
	//初始化修改或保存
	edit:function(objectId){
		$("#objectId").val(objectId);
		$("#myModal").modal("show");
		$("#hintinfo2").html("");
		if(objectId==0){
			$("#username").val("");
			$("#phone").val("");
			$("#nickName").val("");
			$("#username").removeAttr("readonly");
		}
		else{
			var query=new AV.Query(AV.User);
			query.get(objectId,{
				success:function(result){
					$("#username").val(result.get("username"));
					$("#nickName").val(result.get("nickName"));
					$("#phone").val(result.get("phone"));
					$("#username").attr("readonly","readonly");
				},
				error:function(error){
					Admin.showMsg($("#hintinfo2"),"red",error.message);
				}
			});
		}
	},
	//重置密码
	resetPwd:function(objectId){
		if(confirm("再次确认把该用户密码重置为123456？")){
			$.post("../admin/admin_resetPwd",{objectId:objectId},function(data){
				if(data.error!=null){
					Admin.showMsg($("#hintinfo3"),"red",JSON.stringify(error));
				}else{
					Admin.showMsg($("#hintinfo3"),"blue","重置密码成功!");
				}
			});
		}
	},
	//保存修改或保存
	save:function(){
		var objectId=$("#objectId").val();
		var username=$("#username").val();
		var nickName=$("#nickName").val();
		var phone=$("#phone").val();
		if(username.length==0){
			Admin.showMsg($("#hintinfo2"),"red","请输入用户名");
			return;
		}else if(nickName.length==0){
			Admin.showMsg($("#hintinfo2"),"red","请输入联系人姓名");
			return;
		}else if(phone.length==0){
			Admin.showMsg($("#hintinfo2"),"red","请输入手机号");
			return;
		}
		AV.Cloud.run('admin_updateCarAdmin', 
			{
				username:username,
				nickName:nickName,
				phone:phone,
				objectId:objectId
			}, {
			   success: function(data){
				   $("#myModal").modal("hide");
				   Admin.loadData();
			   },
			   error: function(err){
					Admin.showMsg($("#hintinfo2"),"red",err.message);
			   }
			});
	},
	//删除数据
	deleteData:function(objectId){
		if(confirm("确认删除数据！")){
			AV.Cloud.run('admin_deleteCarAdmin',{objectId:objectId}, {
				success: function(data){
					Admin.loadData();
					Admin.showMsg($("#hintinfo3"),"blue","删除成功");
				},
				error: function(err){
					Admin.showMsg($("#hintinfo3"),"red",err.message);
				}
			});
		}
	},
	//显示信息提示
	showMsg:function(nodeElement,color,msg){
		nodeElement.html("<font color='"+color+"'>"+msg+"</font>").show(0).delay(5000).hide(0);
	}
}