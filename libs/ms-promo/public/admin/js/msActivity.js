var msActivity = {
	pageNo: 1,
    pageSize: 10,
    activity_objectId:"",

    //上一页/下一页
    goPage: function(type) {
        var page=msActivity.pageNo;
        if(type==-1){
            msActivity.pageNo=page-1;
        }else if(type==1){
            msActivity.pageNo=page+1;
        }
        msActivity.loadData();
    },
    //加载活动列表
	loadData: function() {
		$.get("../ms_activity/activity/list?isAdminr=1",{
			pageNo:msActivity.pageNo,
			pageSize:msActivity.pageSize,
		},function( data ){
			console.table( data.lst );
			var list = data.lst || [] ;
			if(msActivity.pageSize==list.length){
				$("#btn1").removeAttr("disabled");
			}else{
				$("#btn1").attr("disabled","disabled");
			}
			if(msActivity.pageNo == 1){
				$("#btn2").attr("disabled","disabled");
			}else{
				$("#btn2").removeAttr("disabled");
			}
			var tableHtml="";
			msActivity.pageData  = list;
			for (var i = 0; i < list.length; i++) {
				tableHtml +="<tr>"
					+"<td>"+list[i].title+"</td>"
					+"<td>"+"计算中..."+"</td>"
					+"<td>"+(new Date(list[i].createdAt).format("yyyy-MM-dd hh:mm:ss"))+"</td>"
				tableHtml += "<td nowrap='true' style='width: 150px'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
					+ "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
					+ "<span class='caret'></span></button>"
					+ "<ul class='dropdown-menu' role='menu'>";
				tableHtml +=
					"<li><a href='javascript:void(0)' onclick='msActivity.showSaveView(\""+list[i].objectId+"\")'>修改</a></li>"+
					"<li><a href='javascript:void(0)' onclick='window.location.href=\""+list[i].url+"?id="+list[i].objectId+"\"'>链接</a></li>"+
					"<li><a href='javascript:void(0)' onclick='JavaScript:window.location.href=\"couponCount.html?objectId="+list[i].objectId+"\"'>统计</a></li>"+
					"<li><a href='javascript:void(0)' onclick='msActivity.deleteObj(\""+list[i].objectId+"\")'>删除</a></li>";
				tableHtml += "</ul>"
				tableHtml += "</td></tr>";

			}
			$("#dataMsg").html(tableHtml);
		})
    },
    showSaveView:function(objectId){
		$("#title").val("");
    	$("#magic_url").val("");
		msActivity.activity_objectId = objectId;
		msActivityTimePoint.pageData = [];
		msActivity.pageData.forEach(function( item ){
			if( item.objectId === objectId){
				$("#title").val(item.title);
				$("#url").val(item.url);
	    	$("#magic_url").val(item.magic_url);
				msActivityTimePoint.pageData = item.points;
			}
		});
        $("#myModal").modal("show");
		msActivityTimePoint.init();
    },
    saveData:function(){
		var objectId = msActivity.activity_objectId;
  	var title = $("#title").val();
		if( !title ){
			alert("请输入活动名称");
			return;
		}
		var url = $("#url").val();
		if( !url ){
			alert("请输入活动地址");
			return;
		}
		var points = msActivityTimePoint.pageData;

		$.post("../ms_activity/activity/save",{
			id:objectId,
			title:title,
			url:url,
			points:JSON.stringify(points),
		},function( data ){
			if( data.code != 0){
				alert( data.msg );
				return;
			}
			window.location.reload();
		});
    },
    //删除活动
    deleteObj:function(objectId){
        if(confirm("是否确认删除!")){
			$.post("../ms_activity/activity/delete",{
				id:objectId,
			},function( data ){
				window.location.reload();
			});
        }
    },
};













var msActivityTimePoint = {
	pageData:[],
	//刷新视图
	init:function(){
		var $table = $("#timePoints");
		$table.find("tbody").html("");
		msActivityTimePoint.pageData.forEach(function( item,index ){
			item.objectId = index;
			item.coupons = item.coupons || [];
			msActivityTimePoint.add( item );
		});
	},
	save:function(){
		var $modal = $("#msActivityTimePointModal");
		var objectId  = $modal.data("id");
		var day = $modal.find("#day").val();
		if( !day){
			alert("开始日期不能为空");
			return;
		}
		day =  new Date(day+" 00:00").getTime();

		var startTime = $modal.find("#startTime").val();
		if( !startTime){
			alert("开始时间不能为空");
			return;
		}
		startTime = m2ms(startTime);

		var endTime = $modal.find("#endTime").val();
		if( !endTime){
			alert("结束时间不能为空");
			return;
		}
		endTime = m2ms(endTime);

		if( endTime < startTime){
			alert("结束时间不能早于开始时间");
			return;""
		}

		//查找是否存在
		var arr = msActivityTimePoint.pageData.filter(function( item ){
			if( item.objectId == parseInt(objectId) ){
				return true;
			}else{
				return false;
			}
		});
		if( arr.length != 1 ){
			//新增
			msActivityTimePoint.pageData.push({
				day:day,
				startTime:startTime,
				endTime:endTime,
				coupons:[],
			})
		}else{
			//修改
			arr[0].day = day;
			arr[0].startTime = startTime;
			arr[0].endTime = endTime;
		}
		$("#msActivityTimePointModal").modal("hide");
		msActivityTimePoint.init();
	},
	show:function( id ){
		var obj = {objectId:''};
		msActivityTimePoint.pageData.forEach(function( item,index ){
			if(item.objectId == parseInt(id)){
				obj = item;
			}
		});
		$("#msActivityTimePointModal").data("id",obj.objectId);
		$("#msActivityTimePointModal").find("#day").val( obj.day?new Date(obj.day).format("yyyy-MM-dd"):"");
		$("#msActivityTimePointModal").find("#endTime").val( ms2m(obj.endTime||0) );
		$("#msActivityTimePointModal").find("#startTime").val( ms2m(obj.startTime||0) );
		$("#msActivityTimePointModal").modal("show");
	},
	add:function( obj ){
		obj = obj || {};
		var $table = $("#timePoints");
		var tableHtml = "<tr>";
		tableHtml += "<td>"+new Date(obj.day).format("yyyy-MM-dd")+"</td>";
		tableHtml += "<td>"+ms2m(obj.startTime)+"</td>"
		tableHtml += "<td>"+ms2m(obj.endTime)+"</td>"
		tableHtml += "<td nowrap='true' style='width: 150px'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
			+ "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
			+ "<span class='caret'></span></button>"
			+ "<ul class='dropdown-menu' role='menu'>";
		tableHtml +=
			"<li><a href='javascript:void(0)' onclick='msActivityTimePoint.show(\""+obj.objectId+"\")'>修改</a></li>"+
			"<li><a href='javascript:void(0)' onclick='msActivityCoupons.setData(\""+obj.objectId+"\",true)'>管理优惠券</a></li>"+
			"<li><a href='javascript:void(0)' onclick='msActivityTimePoint.remove(\""+obj.objectId+"\")'>删除</a></li>";
		tableHtml += "</ul>"
		tableHtml += "</td></tr>";
		$table.find("tbody").append( tableHtml);
	},
	remove:function( id ){
		if( confirm("是否确认删除!") ){
			var index = 0;
			msActivityTimePoint.pageData.filter(function( item,index ){
				if( item.objectId == parseInt(id) ){
					index = index;
				}
			});
			msActivityTimePoint.pageData.splice(index,1);
			msActivityTimePoint.init();
		}
	}
}








var msActivityCoupons = {
	pageData:[],
	setData:function( id,isShow ){
		msActivityCoupons.pageData= [];
		msActivityTimePoint.pageData.forEach(function( item,index ){
			if(item.objectId == parseInt(id)){
				msActivityCoupons.pageData = item.coupons;
			}
		});
		if( isShow){
			msActivityCoupons.init();
			$("#msActivityCouponsListModal").modal("show");
		}
	},
	//刷新视图
	init:function(){
		var $table = $("#coupons");
		$table.find("tbody").html("");
		msActivityCoupons.pageData.forEach(function( item,index ){
			item.objectId = index;
			msActivityCoupons.add( item );
		});
	},
	save:function(){
		var $modal = $("#msActivityCouponsModal");
		var objectId  = $modal.data("id");
		// var couponId = $modal.find("#couponId").val();
		// if( !couponId ){
		// 	alert("未选择优惠券");
		// 	return;
		// }
		var couponTitle = $modal.find("#couponTitle").val();
		if( !couponTitle ){
			alert("未选输入优惠券名称");
			return;
		}
		var couponUrl = $modal.find("#couponUrl").val();
		if( !couponUrl ){
			alert("未选输入优惠券地址");
			return;
		}
		var amount = $modal.find("#amount").val();
		if( !amount ){
			alert("未输入优惠券数量");
			return;
		}
		if( !/^\d+$/.test(amount) ){
			alert("优惠券数量错误");
			return;
		}

		//查找是否存在
		var arr = msActivityCoupons.pageData.filter(function( item ){
			if( item.objectId == parseInt(objectId) ){
				return true;
			}else{
				return false;
			}
		});
		if( arr.length != 1 ){
			//新增
			msActivityCoupons.pageData.push({
				couponUrl:couponUrl,
				couponTitle:couponTitle,
				amount:amount
			})
		}else{
			//修改
			arr[0].couponUrl = couponUrl;
			arr[0].couponTitle = couponTitle;
			arr[0].amount = amount;
		}
		$("#msActivityCouponsModal").modal("hide");
		msActivityCoupons.init();
	},
	show:function( id ){
		var obj = {objectId:''};
		msActivityCoupons.pageData.forEach(function( item,index ){
			if(item.objectId == parseInt(id)){
				obj = item;
			}
		});
		$("#msActivityCouponsModal").data("id",obj.objectId);
		$("#msActivityCouponsModal").find("#couponUrl").val( obj.couponUrl );
		$("#msActivityCouponsModal").find("#couponTitle").val( obj.couponTitle );
		$("#msActivityCouponsModal").find("#amount").val( obj.amount );
		$("#msActivityCouponsModal").modal("show");
	},
	add:function( obj ){
		obj = obj || {};
		var $table = $("#coupons");
		var tableHtml = "<tr>";
		tableHtml += "<td>"+obj.couponTitle+"</td>";
		tableHtml += "<td>"+obj.amount+"</td>"
		tableHtml += "<td nowrap='true' style='width: 150px'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
			+ "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
			+ "<span class='caret'></span></button>"
			+ "<ul class='dropdown-menu' role='menu'>";
		tableHtml +=
			"<li><a href='javascript:void(0)' onclick='msActivityCoupons.show(\""+obj.objectId+"\")'>修改</a></li>"+
			"<li><a href='javascript:void(0)' onclick='msActivityCoupons.remove(\""+obj.objectId+"\")'>删除</a></li>";
		tableHtml += "</ul>"
		tableHtml += "</td></tr>";
		$table.find("tbody").append( tableHtml);
	},
	remove:function( id ){
		if( confirm("是否确认删除!") ){
			var index = 0;
			msActivityCoupons.pageData.filter(function( item,index ){
				if( item.objectId == parseInt(id) ){
					index = index;
				}
			});
			msActivityCoupons.pageData.splice(index,1);
			msActivityCoupons.init();
		}
	}
}







var msCoupon = {
	pageNo: 1,
    pageSize: 10,
	pageData:[],
    //上一页/下一页
    goPage: function(type) {
        var page=msCoupon.pageNo;
        if(type==-1){
            msCoupon.pageNo=page-1;
        }else if(type==1){
            msCoupon.pageNo=page+1;
        }
        msCoupon.loadData();
    },
    //加载优惠卷列表
	loadData: function() {
		$.get("../ms_activity/coupon/list",{
			pageNo:msCoupon.pageNo,
			pageSize:msCoupon.pageSize,
		},function( data ){
			console.table( data.lst );
			var list = data.lst || [] ;
			if(msCoupon.pageSize==list.length){
				$("#msCouponsListModal #btn1").removeAttr("disabled");
			}else{
				$("#msCouponsListModal #btn1").attr("disabled","disabled");
			}
			if(msCoupon.pageNo == 1){
				$("#msCouponsListModal #btn2").attr("disabled","disabled");
			}else{
				$("#msCouponsListModal #btn2").removeAttr("disabled");
			}
			var tableHtml="";
			msCoupon.pageData  = list;
			for (var i = 0; i < list.length; i++) {
				tableHtml +="<tr>"
					+"<td>"+list[i].title+"</td>"
					+"<td>"+list[i].couponUrl+"</td>"
				tableHtml += '<td><button class="btn btn-primary" onclick="msCoupon.chose(\''+list[i].objectId+'\')">选择</button>';
				tableHtml += "</td></tr>";

			}
			$("#msCouponsListModal #dataMsg").html(tableHtml);
		})
    },
	show:function( id ){
		msCoupon.loadData();
		$("#msCouponsListModal").modal("show").data("id",id);
	},
	chose:function( id ){
		var $modal = $( "#"+$("#msCouponsListModal").data("id") );
		var coupon = {};
		msCoupon.pageData.forEach(function( item ){
			if( item.objectId == id ){
				coupon = item;
			}
		});
		$modal.find("#couponTitle").val(coupon.title);
		$modal.find("#couponId").val(coupon.objectId);
		$("#msCouponsListModal").modal("hide").data("id","");
	}
};




//ms to hh:mm
function ms2m( ms ){
	var hh = Math.floor(ms/1000/60/60);
	if( hh < 10 ){
		hh = "0"+hh;
	}
	var mm = Math.floor(ms/1000/60%60);
	if( mm < 10 ){
		mm = "0"+mm;
	}
	return hh+":"+mm;
}
//hh:mm to ms
function m2ms( str ){
	if( !/^\d{1,}:\d{1,2}$/ig.test(str) ){
		return 0;
	}else{
		var sum = 0;
		sum += parseInt(str.split(":")[0])*60*60*1000; //时
		sum += parseInt(str.split(":")[1])*60*1000; //分
		return sum;
	}
}
