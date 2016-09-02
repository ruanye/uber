var ActivityCoupon = AV.Object.extend("ActivityCoupon");

var activityCoupon = {
	pageNo: 1,        
    pageSize: 10,
    activity_objectId:"",

    //上一页/下一页
    goPage: function(type) {
        var page=activityCoupon.pageNo;
        if(type==-1){
        	activityCoupon.pageNo=page-1;
        }else if(type==1){
        	activityCoupon.pageNo=page+1;
        }
        activityCoupon.loadData();
    },
    //加载乘车券列表
	loadData: function() {
		AV.Cloud.run("admin_activity_coupon_list",{pageNo:activityCoupon.pageNo,pageSize:activityCoupon.pageSize},{
			success:function(list){
				if(activityCoupon.pageSize==list.length){
					$("#btn1").removeAttr("disabled");
				}else{
					$("#btn1").attr("disabled","disabled");
				}
				if(activityCoupon.pageNo == 1){
					$("#btn2").attr("disabled","disabled");
				}else{
					$("#btn2").removeAttr("disabled");
				}
				var tableHtml="";
                //console.log(list);
				for (var i = 0; i < list.length; i++) {
					tableHtml+="<tr>" +
									"<td>"+(AV.User.current().get("username")=="admin"?((list[i].userName==undefined?"admin":list[i].userName)+":"+list[i].name):list[i].name)+"</td>" +
									"<td>"+list[i].cutoffDate+"</td>" +
									"<td>"+(list[i].isEffective=="1"?"有效":"无效")+"</td>";
                   tableHtml+= "<td id='nt_" + list[i].objectId + "'> <span style='font-size: 10px'>计算中</span> </td>";

                    tableHtml += "<td nowrap='true' style='width: 150px'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
                        + "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
                        + "<span class='caret'></span></button>"
                        + "<ul class='dropdown-menu' role='menu'>";
                    tableHtml +=
                        "<li><a href='javascript:void(0)' onclick='activityCoupon.showSaveView(\""+list[i].objectId+"\")'>修改</a></li>"+
                        "<li><a href='javascript:void(0)' onclick='activityCoupon.activityCarDel(\""+list[i].objectId+"\")'>删除</a></li>"+
                        "<li><a href='javascript:void(0)' onclick='JavaScript:window.location.href=\"couponCount.html?objectId="+list[i].objectId+"\"'>统计</a></li>"+
                        "<li><a href='carCouponList.html?objectId="+list[i].objectId+"'>优惠券</a></li>"+
                        "<li><a href='javascript:void(0)' onclick='activityCoupon.showUrl(\""+list[i].objectId+"\",\""+list[i].pageUrl+"\")'>链接</a></li>"+
                        "<li><a href='javascript:void(0)' onclick='exportCoupon(\""+list[i].objectId+"\")'>导出</a></li>" +
                        "</ul></td></tr>";

                    setTimeout("countJoind('"+ list[i].objectId +"')",1000);

				}
				$("#dataMsg").html(tableHtml);
			},
			error:function(error){
				console.log(JSON.stringify(error));
			}
		});
    },
    showSaveView:function(objectId){
        if(objectId!=''){
            var query=new AV.Query(ActivityCoupon);
            query.get(objectId, {
                success: function(obj) {
                    $("#name").val(obj.get("name"));
                    $("#couponNum").val(obj.get("couponNum"));
                    $("#couponContent").val(obj.get("couponContent"));
                    $("#successContent").val(obj.get("successContent"));
                    $("#repeatContent").val(obj.get("repeatContent"));
                    $("#endContent").val(obj.get("endContent"));
                    $("#sharecontent").val(obj.get("sharecontent"));
                    $("#cutoffDate").val(obj.get("cutoffDate"));
                    $("#pageUrl").val(obj.get("pageUrl"));
                    if(obj.get("isEffective") == "1")
                        document.getElementById("optionsRadios1").checked = true;
                    else
                        document.getElementById("optionsRadios2").checked = true;
                },
                error: function(object, error) {
                    $("#hintInfo").html("<font color='red'>"+object+"</font>").show().delay(3000).hide(0);
                }
            });
        }
        activityCoupon.activity_objectId = objectId;
		$("#myModal").modal("show");
    },
    saveData:function(){
        if($("#name").val()==''){
            $("#hintInfo").html("<font color='red'>活动名称为空</font>").show().delay(3000).hide(0);
            return;
        }if($("#couponNum").val()==''){
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
        if($("#cutoffDate").val()==''){
            $("#hintInfo").html("<font color='red'>有效期为空</font>").show().delay(3000).hide(0);
            return;
        }
        var obj = new ActivityCoupon();
        if(activityCoupon.activity_objectId!=''){
        	obj=new AV.Object.createWithoutData("ActivityCoupon",activityCoupon.activity_objectId);
        }else{
            var user=AV.User.current();
    		if(user.get("userType")==1){
    			obj.set("userId", user.id);
    			obj.set("userName",user.get("username"));
    			obj.set("user",user);
    		}
        }
        obj.set("name", $("#name").val());
        obj.set("couponNum", $("#couponNum").val());
        obj.set("couponContent", $("#couponContent").val());
        obj.set("successContent", $("#successContent").val());
        obj.set("repeatContent", $("#repeatContent").val());
        obj.set("endContent", $("#endContent").val());
        obj.set("sharecontent", $("#sharecontent").val());
        obj.set("cutoffDate", $("#cutoffDate").val());
        obj.set("pageUrl",$("#pageUrl").val());
        var isEffective = $('input[name="groupRadios"]:checked').val();
        obj.set("isEffective", isEffective);
        obj.save(null,{
            success: function(obj) {
                $("#hintinfo").html("<font color='blue'>保存成功</font>");
                $("#myModal").modal("hide");
                activityCoupon.loadData();
            },
            error: function(saveResult, error) {
                $("#hintinfo").html("<font color='red'>"+ error.message +"</font>").show().delay(3000).hide(0);
            }
        });
    },
    activityCarDel:function(objectId){
        if(confirm("是否确认删除!")){
            AV.Cloud.run("admin_activity_coupon_del",{objectId:objectId},{
                success:function(msg){
                    $("#hint_MSG").html("<font color='blue'>"+msg+"</font>");
                    activityCoupon.loadData();
                },
                error:function(error){
                    console.log(error);
                    $("#hint_MSG").html("<font color='red'>"+error+"</font>");
                }
            });
        }
    },
    showUrl:function(objectId,pageUrl){
    	if(pageUrl.length==0){
    		pageUrl="carcoupon/carCoupon.html";
    	}
    	var url=window.location.host+"/mobile/"+pageUrl+"?id="+objectId;
    	if(url.indexOf("http://")==-1){
    		url="http://"+url;
    	}
        $("#showUrl").val(url);
        $("#UrlModal").modal("show");
    }
};

function exportCoupon(actId){
    $("#activityId").val(actId);
    $("#exportForm").submit();
}

function countJoind(objectId){
    AV.Cloud.run("mobile_parts_count",{activityId:objectId},{
        success:function(obj){
             $("#nt_" + objectId).html(obj.number);
        },
        error:function(error){
        	console.log(JSON.stringify(error));
        }
    });
}