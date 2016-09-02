var CouponPkg = {
    activity_objectId:"",
    //加载乘车券列表
    loadCouponPkg: function() {
		var query=new AV.Query(CouponPkgObj);
		query.equalTo("activityId",CouponPkg.activity_objectId);
		query.descending("defaultTime");
        query.find({
            success: function(list){
                var tableHtml = "";
                for(var i=0; i<list.length; i++) {
                    tableHtml += "<tr>" 
                    	+ "<td>" + list[i].get('pkgName') + "</td>" 
                    	+ "<td>" + list[i].get('amount') + "</td>"
                    	+ "<td>" + (list[i].get('money')==undefined?'':list[i].get('money')) + "</td>"
                    	+ "<td>" + list[i].get('min') + "</td>"
                    	+ "<td>" + list[i].get('max') + "</td>"
                    	+ "<td>" + (list[i].get('odds')==undefined?'':list[i].get('odds')) + "</td>" ;
                    if(list[i].get("defaultTime")>0&&i==0){
                    	tableHtml += "<td>默认包</td>";
                    }else{
                    	tableHtml += "<td>常规包</td>";
                    }
                    tableHtml += "<td>" + (list[i].get('isEffective') == "1"?"是":"否") + "</td>"
                    	+ "<td id='person_"+list[i].id+"'>0</td>"
                    	+ "<td class='col-md-2'><div class='btn-group'><button class='btn btn-info'>操作</button>"
                    	+ "<button class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
        				+ "<span class='caret'></span></button>"
        				+ "<ul class='dropdown-menu' role='menu'>";
                    tableHtml += "<li><a href='javascript:void(0)' onclick=\"CouponPkg.initPkg('" + list[i].id + "')\">修改</a></li>";
                    if(list[i].get('isEffective') == "1"){
                    	if(list[i].get("defaultTime")>0&&i==0){
                    		//默认包不能设置为无效
                    	}else{
                    		tableHtml += "<li><a href='javascript:void(0)' onclick=\"CouponPkg.setIsEffective('" + list[i].id + "', '0')\"><font>设为无效</font></a></li>";
                    	}
                	}else{
                		tableHtml += "<li><a href='javascript:void(0)' onclick=\"CouponPkg.setIsEffective('" + list[i].id + "', '1')\"><font>设为有效</font></a></li>";
                    }
                    if(list[i].get("defaultTime")>0&&i==0){
                    	//默认包无需设置默认包操作
                    }else{
                    	tableHtml += "<li><a href='javascript:void(0)' onclick=\"CouponPkg.defaultPkg('" + list[i].id + "',"+list[i].get('isEffective')+")\">设为默认包</a></li>";
                    }
                    tableHtml += "<li><a href='javascript:void(0)' onclick=\"CarCoupon.list('" + list[i].id + "')\">乘车券</a></li>"
        				+ "<li><a href='javascript:void(0)' onclick=\"CouponPkg.deletePkg('" + list[i].id + "')\">删除</a></li>"
        				+ "</ul></div></td>" ;
                    	+ "</tr>";
                    	CouponPkg.queryPersonCount(list[i].id);
                }
                $("#couponList").html(tableHtml);
            },
            error: function(error) {
            	CouponPkg.showMsg($("#listinfo_div"),"red",error.message);
            }
        });
    },
    //编码
    ConvertTo36:function(num, len){
    	var l = num.length;
		if (num.length < len) {
			for (var i = 0; i < len - l; i++) {
				num = "0" + num;
			}
		}
		return num;
    },
    queryPersonCount:function(objectId){
    	var query=new AV.Query(UserCouponPkgObj);
        query.equalTo("pkgId",objectId);
        query.count({
        	success:function(count){
        		$("#person_"+objectId).html(count);
        	},
        	error:function(error){
        		$("#person_"+objectId).html(0);
        	}
        });
    },
    //设为默认包
    defaultPkg:function(objectId,isEffective){
    	if(isEffective=="0"){
    		CouponPkg.showMsg($("#listinfo_div"),"red","该券包无效，不能设置为默认包");
    		return;
    	}
    	var pkgObj=new AV.Object.createWithoutData("CouponPkg",objectId);
    	pkgObj.set("defaultTime",new Date().getTime());
    	pkgObj.save(null,{
    		success:function(data){
    			CouponPkg.showMsg($("#listinfo_div"),"blue","设置默认包成功");
    			CouponPkg.loadCouponPkg();
    		},
    		error:function(obj,error){
    			CouponPkg.showMsg($("#listinfo_div"),"red",error.message);
    		}
    	});
    },
    //修改券包
    initPkg:function(objectId) {
    	$('#myModal').modal('show');
    	$("#objectid").val(objectId);
    	if(objectId=='0'){
    		$("#pkgName").val("");
    		$("#amount").val("");
    		$("#odds").val("");
    		$("#min").val(1);
    		$("#max").val(1);
    		$("#pkgmoney").val("");
    	}else{
			var query = new AV.Query(CouponPkgObj);
			query.get(objectId, {
				success: function(couponPkg) {
					$("#pkgName").val(couponPkg.get("pkgName"));
					$("#amount").val(couponPkg.get("amount"));
		    		$("#odds").val(couponPkg.get("odds"));
					$("#min").val(couponPkg.get("min"));
		    		$("#max").val(couponPkg.get("max"));
		    		$("#pkgmoney").val(couponPkg.get("money"));
				},
			    error: function(object, error) {
			    	CouponPkg.showMsg($("#listinfo_div"),"red",error.message);
			    }
			});
    	}
    },
    //删除券包
    deletePkg: function(objectId) {
        if(confirm("是否删除该券包？")) {
            var query = new AV.Query(CouponPkgObj);
            query.get(objectId, {
                success: function(couponPkg) {
                	couponPkg.destroy({
                        success: function(myObject) {
                        	CouponPkg.loadCouponPkg();
                        },
                        error: function(myObject, error) {
                        	CouponPkg.showMsg($("#listinfo_div"),"red",error.message);
                        }
                    });
                },
                error:function(error) {
                	CouponPkg.showMsg($("#listinfo_div"),"red",error.message);
                }
            });
        }
    },
    //保存券包
    savePkg:function(){
    	var pkgName = $("#pkgName").val();
    	if(pkgName.length == 0||pkgName.replace(/(^\s*)|(\s*$)/g,'') == "") {
    		CouponPkg.showMsg($("#objinfo_div"),"red","请填写乘车券名称");
    		return;
    	}
    	var amount = $("#amount").val();
    	if(amount.trim().length==0||!/^[0-9]+(.[0-9]{0,2})?$/.test(amount)) {
    		CouponPkg.showMsg($("#objinfo_div"),"red","请填写分发总额");
    		return;
    	}
    	var min = $("#min").val();
    	if(min.trim().length==0||!/^[0-9]+(.[0-9]{0,2})?$/.test(min)) {
    		CouponPkg.showMsg($("#objinfo_div"),"red","请填写最小数量");
    		return;
    	}
    	var max = $("#max").val();
    	if(max.trim().length==0||!/^[0-9]+(.[0-9]{0,2})?$/.test(max)) {
    		CouponPkg.showMsg($("#objinfo_div"),"red","请填写最大数量");
    		return;
    	}
    	var odds = $("#odds").val();
    	if(odds.trim().length==0||!/^[0-9]+(.[0-9]{0,2})?$/.test(odds)) {
    		CouponPkg.showMsg($("#objinfo_div"),"red","请填写抢到权重");
    		return;
    	}
    	var pkgmoney = $("#pkgmoney").val();
    	if(pkgmoney.trim().length==0||!/^[0-9]+(.[0-9]{0,2})?$/.test(pkgmoney)) {
    		CouponPkg.showMsg($("#objinfo_div"),"red","请填写券包金额");
    		return;
    	}
    	var objectId=$("#objectid").val();
    	var pkgObj = new CouponPkgObj();
    	if(objectId=="0"){
    		pkgObj.set("isEffective", "1");
    		pkgObj.set("activityId", CouponPkg.activity_objectId);
    		pkgObj.set("activity",new AV.Object.createWithoutData("ActivityCar",CouponPkg.activity_objectId));
    	}else{
    		pkgObj=new AV.Object.createWithoutData("CouponPkg",objectId);
    	}
    	pkgObj.set("pkgName", pkgName);
    	pkgObj.set("amount", parseInt(amount));
    	pkgObj.set("min", Number(min));
    	pkgObj.set("max", Number(max));
    	pkgObj.set("odds", Number(odds));
    	pkgObj.set("money", Number(pkgmoney));
    	pkgObj.save(null, {
    		success: function(pkgObj) {
    	    	$("#myModal").modal("hide");
    			CouponPkg.loadCouponPkg();
    			CouponPkg.showMsg($("#listinfo_div"),"blue","编辑成功");
    		},
    		error: function(pkgObj, error) {
    			CouponPkg.showMsg($("#objinfo_div"),"red",error.message);
    		}
    	});
    },
    //设置乘车券是否有效
    setIsEffective(objectId, type) {
    	var pkgObj=new AV.Object.createWithoutData("CouponPkg",objectId);
    	pkgObj.set("isEffective", type);
		pkgObj.save(null,{
			success:function(data){
				CouponPkg.loadCouponPkg();
			},
			error:function(obj,error){
				CouponPkg.showMsg($("#listinfo_div"),"red",error.message);
			}
		});
    },
	//显示信息提示
	showMsg:function(nodeElement,color,msg){
		nodeElement.html("<font color='"+color+"'>"+msg+"</font>").show(0).delay(5000).hide(0);
		return;
	}
};

$(function(){
	var request=GetRequest();
	CouponPkg.activity_objectId=request["objectId"];
	var query=new AV.Query(ActivityCar);
	query.get(CouponPkg.activity_objectId, {
		success: function(obj) {
			$("#activity_title").html(obj.get("name")+"的券包");
			CouponPkg.loadCouponPkg();
		},
		error: function(error) {
			CouponPkg.showMsg($("#listinfo_div"),"red",error.message);
		}
	});
})