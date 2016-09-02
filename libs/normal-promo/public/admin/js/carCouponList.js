var CarCoupon2 = AV.Object.extend("CarCoupon2");
var actionFlag;
var localCoupon;
var localCouponConfig;
var couponObjectId = "568e25b460b2ad083a773e80";
var activity_objectId = "";
var UserCarCouponObj=AV.Object.extend("UserCarCoupon");

var coupons = {
	pageNo: 1,        
    pageSize: 10,     
    pageCount: 1,     
    cql_baselist: "",
    cql_list: "",
    //初始化
    init: function(page) {
    	coupons.pageNo = page;
    	coupons.cql_list = coupons.cql_baselist + " limit " + (coupons.pageNo - 1) * coupons.pageSize + "," + coupons.pageSize;
    },
    //上一页/下一页
    goPage: function(type) {
        var page = coupons.pageNo;
        if(type == -1) 
            page = page-1==0?1:page-1;
        else if(type == 1)  
            page = page+1 > coupons.pageCount ? coupons.pageCount : page+1;
        coupons.init(page);
        coupons.loadCouponList();
    },
    //加载乘车券列表
    loadCouponList: function() {
        AV.Query.doCloudQuery(coupons.cql_list, {
            success: function(result){
                var resultArr = result.results;
                var count = result.count;
                coupons.pageCount = count%coupons.pageSize == 0 ? (count/coupons.pageSize == 0 ? 1 : count/coupons.pageSize):parseInt(count/coupons.pageSize)+1;
                if(coupons.pageNo == coupons.pageCount) 
                    $("#btnBefore").attr("disabled", "disabled");
                else 
                    $("#btnBefore").removeAttr("disabled");
                if(coupons.pageNo == 1) 
                    $("#btnNext").attr("disabled","disabled");
                else 
                    $("#btnNext").removeAttr("disabled");
                var tableHtml = "";
                for(var i=0; i<resultArr.length; i++) {
                	var tempCutoffDate;
                	if(resultArr[i].get('cutoffDate')==null || resultArr[i].get('cutoffDate')==undefined)
                		tempCutoffDate = "";
                	else
                		tempCutoffDate = resultArr[i].get('cutoffDate').format('yyyy-MM-dd hh:mm');
                	var tempIsEffective;
                	if(resultArr[i].get('isEffective') == "1")
                		tempIsEffective = "是";
                	else
                		tempIsEffective = "否";
                    tableHtml += "<tr>" 
                    	+ "<td>" + resultArr[i].get('couponName') + "</td>" 
                    	+ "<td>" + resultArr[i].get('amount') + "</td>" 
                    	+ "<td>" + (resultArr[i].get('url')==undefined?"":resultArr[i].get('url')) + "</td>" 
                    	//+ "<td>" + resultArr[i].createdAt.format('yyyy-MM-dd hh:mm') + "</td>"
                    	//+ "<td>" + tempCutoffDate + "</td>"
                    	+ "<td>" + tempIsEffective + "</td>"
                    	+ "<td id='person_"+resultArr[i].id+"'>0</td>"
                    	+ "<td class='col-md-2'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
                    	+ "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
        				+ "<span class='caret'></span></button>"
        				+ "<ul class='dropdown-menu' role='menu'>";
                    if(resultArr[i].get('isEffective') == "1")
                    	tableHtml += "<li><a href='javascript:void(0)' onclick=\"setIsEffective('" + resultArr[i].id + "', '0')\"><font>设为无效</font></a></li>";
            		else
            			tableHtml += "<li><a href='javascript:void(0)' onclick=\"setIsEffective('" + resultArr[i].id + "', '1')\"><font>设为有效</font></a></li>";
                    tableHtml += "<li><a href='javascript:void(0)' onclick=\"coupons.updateCoupon('" + resultArr[i].id + "')\">修改</a></li>"
        				+ "<li><a href='javascript:void(0)' onclick=\"coupons.deleteCoupon('" + resultArr[i].id + "')\">删除</a></li>"
        				+ "</ul></div></td>" ;
                    	+ "</tr>";
                    coupons.queryPersonCount(resultArr[i].id);
                }
                $("#couponList").html(tableHtml);
            },
            error: function(error) {
                console.log(error.message);
            }
        });
    },
    queryPersonCount:function(objectId){
    	var query=new AV.Query(UserCarCouponObj);
        query.equalTo("carCouponId",objectId);
        query.count({
        	success:function(count){
        		$("#person_"+objectId).html(count);
        	},
        	error:function(error){
        		$("#person_"+objectId).html(0);
        	}
        });
    },
    //初始化乘车券设置
    initCouponConfig: function() {
    	var query = new AV.Query(MyHint);
    	query.get(couponObjectId, {
    		success: function(config) {
    			localCouponConfig = config;
    			$("#couponNum").val(localCouponConfig.get("couponNum"));
    			$("#couponContent").val(localCouponConfig.get("couponContent"));
    			$("#successContent").val(localCouponConfig.get("content"));
    			$("#repeatContent").val(localCouponConfig.get("myContent"));
                $("#shareContent").val(localCouponConfig.get("afterContent"));


            },
    		error: function(object, error) {
    			localCouponConfig = null;
    			$("#couponNum").val("");
    			$("#couponContent").val("");
    			$("#successContent").val("");
    			$("#repeatContent").val("");
                $("#shareContent").val("");
    		}
    	});
    },
    //新建乘车券
    newCoupon: function() {
    	$('#myModal').modal('show');
    	actionFlag = true;
    	localCoupon = null;
		$("#couponName").val("");
		$("#amount").val("");
		$("#url").val("");
		$("#cutoffDate").val("");
		//document.getElementById("optionsRadios2").checked = true; //默认为无效
    },
    //修改乘车券
    updateCoupon: function(objectId) {
    	$('#myModal').modal('show');
		actionFlag = false;
		var query = new AV.Query(CarCoupon2);
		query.get(objectId, {
			success: function(tempCoupon) {
				localCoupon = tempCoupon;
				$("#couponName").val(tempCoupon.get("couponName"));
				$("#amount").val(tempCoupon.get("amount"));
				$("#url").val(tempCoupon.get("url"));
			},
		    error: function(object, error) {
		    	alert("该数据已删除");
		    }
		});
    },
    //删除乘车券
    deleteCoupon: function(objectId) {
        if(confirm("是否删除")) {
            var query = new AV.Query(CarCoupon2);
            query.get(objectId, {
                success: function(tempCoupon) {
                	tempCoupon.destroy({
                        success: function(myObject) {
                        	coupons.init(1);
                        	coupons.loadCouponList();
                        },
                        error: function(myObject, error) {
                            console.log(JSON.stringify(error));
                        }
                    });
                },
                error:function(err) {
                    console.log(JSON.stringify(err));
                }
            });
        }
    }
};

//保存乘车券
function saveCoupon() {
	//验证
	var couponName = $("#couponName").val();
	if(couponName.length == 0) {
		$("#errorInfo").html("<font color='red'>请填写乘车券名称</font>");
		return;
	}
	if(couponName.replace(/(^\s*)|(\s*$)/g,'') == "") {
		$("#errorInfo").html("<font color='red'>请填写有效的乘车券名称</font>");
		return;
	}
	var amount = $("#amount").val();
	if(amount == "") {
		$("#errorInfo").html("<font color='red'>请填写金额</font>");
		return;
	}
	if(!/^[0-9]+(.[0-9]{0,2})?$/.test(amount)) {
		$("#errorInfo").html("<font color='red'>请填写正确的金额</font>");
		return;
	}
	var url = $("#url").val();
	if(url.replace(/(^\s*)|(\s*$)/g,'') == "") {
		$("#errorInfo").html("<font color='red'>请填写有效的链接地址</font>");
		return;
	}
	localCoupon = new CarCoupon2();
	localCoupon.set("couponName", couponName);
	localCoupon.set("url", url);
	localCoupon.set("amount", parseInt(amount));
	localCoupon.set("isEffective", "1");
	localCoupon.set("activityId", activity_objectId);
	localCoupon.save(null, {
		success: function(tempCoupon) {
			coupons.init(1);
        	coupons.loadCouponList();
			alert("保存成功");
		},
		error: function(tempCoupon, error) {
			alert(error.message);
		}
	});
	$("#myModal").modal("hide");
}

//保存乘车券设置
function saveCouponConfig() {
	var couponNum = $("#couponNum").val();
	if(couponNum == "") {
		$("#hintInfo").html("<font color='red'>请填写乘车券数量</font>");
		return;
	}
	if (!/^[0-9]*[1-9][0-9]*$/.test(couponNum)) {
		$("#hintInfo").html("<font color='red'>请填写正确的乘客一次获取乘车券张数</font>");
		return;
	}
	var couponContent = $("#couponContent").val();
	localCouponConfig.set("couponNum", parseInt(couponNum));
	localCouponConfig.set("couponContent", couponContent);
	localCouponConfig.set("content", $("#successContent").val());
	localCouponConfig.set("myContent", $("#repeatContent").val());   //重复领取
	localCouponConfig.set("afterContent", $("#shareContent").val());   //重复领取
	localCouponConfig.save(null, {
		success: function(tempCouponConfig) {
			alert("保存成功");
		},
		error: function(tempCoupon, error) {
			console.log(JSON.stringify(error));
		}
	});
}

//设置乘车券是否有效
function setIsEffective(objectId, type) {
	var query = new AV.Query(CarCoupon2);
	query.get(objectId, {
		success: function(tempCoupon) {
			tempCoupon.set("isEffective", type);
			tempCoupon.save();
			coupons.loadCouponList();
		},
	    error: function(object, error) {
	    	console.log(JSON.stringify(error));
	    }
	});
}

$(function(){
	var request=GetRequest();
	activity_objectId=request["objectId"];
	var ActivityCoupon = AV.Object.extend("ActivityCoupon");
	var query=new AV.Query(ActivityCoupon);
	query.get(activity_objectId, {
		success: function(obj) {
			$("#activity_title").html("活动:"+obj.get("name")+"的乘车券管理");
			coupons.cql_baselist= "select count(*),* from CarCoupon2 where activityId = '"+activity_objectId+"' order by createdAt desc",
			coupons.init(1);
			coupons.loadCouponList();
		},
		error: function(object, error) {
			$("#hintInfo").html("<font color='red'>"+object+"</font>").show().delay(3000).hide(0);
		}
	});
})