var msVote = {
	pageNo: 1,
    pageSize: 10,
    activity_objectId:"",

    //上一页/下一页
    goPage: function(type) {
        var page=msVote.pageNo;
        if(type==-1){
            msVote.pageNo=page-1;
        }else if(type==1){
            msVote.pageNo=page+1;
        }
        msVote.loadData();
    },
    //加载投票列表
	loadData: function() {
		$.get("../vote/list",{
			pageNo:msVote.pageNo,
			pageSize:msVote.pageSize,
		},function( data ){
			console.table( data.lst );
			var list = data.lst || [] ;
			if(msVote.pageSize==list.length){
				$("#btn1").removeAttr("disabled");
			}else{
				$("#btn1").attr("disabled","disabled");
			}
			if(msVote.pageNo == 1){
				$("#btn2").attr("disabled","disabled");
			}else{
				$("#btn2").removeAttr("disabled");
			}
			var tableHtml="";
			msVote.pageData  = list;
			for (var i = 0; i < list.length; i++) {
				tableHtml +="<tr>"
					+"<td>"+list[i].voteName+"</td>"
				tableHtml += "<td nowrap='true' style='width: 150px'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
					+ "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
					+ "<span class='caret'></span></button>"
					+ "<ul class='dropdown-menu' role='menu'>";
				tableHtml +=
					"<li><a href='javascript:void(0)' onclick='msVote.showSaveView(\""+list[i].objectId+"\")'>修改</a></li>"+
					"<li><a href='javascript:void(0)' onclick='msVote.deleteObj(\""+list[i].objectId+"\")'>删除</a></li>";
				tableHtml += "</ul>"
				tableHtml += "</td></tr>";

			}
			$("#dataMsg").html(tableHtml);
		})
    },
    showSaveView:function(objectId){
		$("#title").val("");
    	$("#magic_url").val("");
		msVote.activity_objectId = objectId;
		msVoteItem.pageData = [];
		msVote.pageData.forEach(function( item ){
			if( item.objectId === objectId){
				$("#title").val(item.voteName);
		    	// $("#styleClass").val(item.magic_url);
				msVoteItem.pageData = item.items || [];
			}
		});
        $("#myModal").modal("show");
		msVoteItem.init();
    },
    saveData:function(){
		var objectId = msVote.activity_objectId;
    	var title = $("#title").val();
		if( !title ){
			alert("请输入活动名称");
			return;
		}
		var styleClass = $("#styleClass").val();
		if( !styleClass ){
			// alert("请输入样式名称");
			// return;
		}
		// var setting = $("#setting").val();
		// if( !setting ){
		// 	alert("请输入设置");
		// 	return;
		// }

		$.post("../vote/save",{
			promoId:objectId,
			voteName:title,
			// styleClass:styleClass,
			setting:"",
			items:JSON.stringify(msVoteItem.pageData),
		},function( data ){
			if( data.code != 0 ){
				alert( data.msg );
				return;
			}
			window.location.reload();
		});
    },
    //删除活动
    deleteObj:function(objectId){
        if(confirm("是否确认删除!")){
			$.post("../vote/delete",{
				promoId:objectId,
				itemId:""
			},function( data ){
				window.location.reload();
			});
        }
    },
};








var msVoteItem = {
	pageData:[],
	//刷新视图
	init:function(){
		var $table = $("#timePoints");
		$table.find("tbody").html("");
		msVoteItem.pageData.forEach(function( item,index ){
			item.objectId = index;
			// item.coupons = item.coupons || [];
			msVoteItem.add( item );
		});
	},
	save:function(){
		var $modal = $("#msVoteItemModal");
		var objectId  = $modal.data("id");
		var title = $modal.find("#title").val();
		if( !title ){
			alert("请输入投票项标题");
			return;
		}
		var logoUrl = $modal.find("#logoUrl").val();
		if( !logoUrl ){
			alert("请输入图片地址");
			return;
		}
		var intro = $modal.find("#intro").val();
		if( !intro ){
			alert("请输入简介");
			return;
		}
		var couponUrl = $modal.find("#couponUrl").val();
		if( !couponUrl ){
			alert("请输入优惠券链接");
			return;
		}
		var redirectUrl = $modal.find("#redirectUrl").val();
		if( !redirectUrl ){
			alert("新用户跳转链接");
			return;
		}
		var oldAmount = $modal.find("#oldAmount").val();
		if( !oldAmount){
			alert("老用户抢券上限");
			return;
		}
		//查找是否存在
		var arr = msVoteItem.pageData.filter(function( item ){
			if( item.objectId == parseInt(objectId) ){
				return true;
			}else{
				return false;
			}
		});
		if( arr.length != 1 ){
			//新增
			msVoteItem.pageData.push({
				couponUrl:couponUrl,
				redirectUrl:redirectUrl,
                oldAmount:oldAmount,
				logoUrl:logoUrl,
				intro:intro,
				title:title
			})
		}else{
			//修改
			arr[0].couponUrl = couponUrl;
			arr[0].logoUrl = logoUrl;
			arr[0].intro = intro;
			arr[0].redirectUrl = redirectUrl;
            arr[0].oldAmount = oldAmount;
			arr[0].title = title;
		}
		$("#msVoteItemModal").modal("hide");
		msVoteItem.init();
	},
	show:function( id ){
		var obj = {objectId:''};
		msVoteItem.pageData.forEach(function( item,index ){
			if(item.objectId == parseInt(id)){
				obj = item;
			}
		});
		$("#msVoteItemModal").data("id",obj.objectId);
		$("#msVoteItemModal").find("#title").val( obj.title );
		$("#msVoteItemModal").find("#logoUrl").val(obj.logoUrl);
		$("#msVoteItemModal").find("#intro").val(obj.intro);
		$("#msVoteItemModal").find("#couponUrl").val( obj.couponUrl );
		$("#msVoteItemModal").find("#redirectUrl").val( obj.redirectUrl );
		$("#msVoteItemModal").find("#oldAmount").val( obj.oldAmount);
		$("#msVoteItemModal").modal("show");
	},
	add:function( obj ){
		obj = obj || {};
		var $table = $("#timePoints");
		var tableHtml = "<tr>";
		tableHtml += "<td>"+obj.title+"</td>";
		tableHtml += "<td>"+obj.couponUrl+"</td>"
		tableHtml += "<td nowrap='true' style='width: 150px'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
			+ "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
			+ "<span class='caret'></span></button>"
			+ "<ul class='dropdown-menu' role='menu'>";
		tableHtml +=
			"<li><a href='javascript:void(0)' onclick='msVoteItem.show(\""+obj.objectId+"\")'>修改</a></li>"+
			"<li><a href='javascript:void(0)' onclick='msVoteItem.remove(\""+obj.objectId+"\")'>删除</a></li>";
		tableHtml += "</ul>"
		tableHtml += "</td></tr>";
		$table.find("tbody").append( tableHtml);
	},
	remove:function( id ){
		if( confirm("是否确认删除!") ){
			var index = 0;
			msVoteItem.pageData.filter(function( item,index ){
				if( item.objectId == parseInt(id) ){
					index = index;
				}
			});
			msVoteItem.pageData.splice(index,1);
			$.post("../vote/delete",{
				promoId:msVote.activity_objectId,
				itemId:id
			},function( data ){
				//window.location.reload();
			});
			msVoteItem.init();
		}
	}
}

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
// $("#day").datetimepicker({
// 	todayBtn:true,
// 	todayHighlight:true,
// 	format:"yyyy-mm-dd",
// 	language:"zh-CN",
// 	autoclose:true,
// 	minView:2
// });
// $("#startTime,#endTime").timepicker({
// 	minuteStep:1,
// 	showMeridian:false,
// 	explicitMode:true,
// 	snapToStep:true,
// 	defaultTime:"00:00 AM",
// });
