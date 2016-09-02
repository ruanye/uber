/**
 * 乘车券的相关操作
 * 2016-01-04
 */
var CarCoupon={
	pkgId:null,
	list:function(pkgId){
		if(pkgId!=0){
			CarCoupon.pkgId=pkgId;
			$("#couponName").val("");
			$("#money").val("");
			$("#num").val("");
			$("#couponUrl").val("");
		}
		$("#couponModal").modal("show");
		var query=new AV.Query(CarCouponObj);
		query.equalTo("pkgId",CarCoupon.pkgId);
		query.descending("createdAt");
		query.find({
			success:function(list){
				//清空选择数据 
				var tableHtml="";
				for (var i = 0; i < list.length; i++) {
					tableHtml+="<tr>" +
							"<td>"+list[i].get("couponName")+"</td>" +
							"<td>"+list[i].get("money")+"</td>" +
							"<td>"+(!list[i].get("num")?"":list[i].get("num"))+"</td>" +
							"<td>"+(!list[i].get("couponUrl")?"":list[i].get("couponUrl"))+"</td>"+
							"<td>"+(list[i].get("robuser")==-1?"所有用户":(list[i].get("robuser")==1?'新用户':'老用户'))+"</td>";
					tableHtml+="<td><button class='btn btn-primary' onclick='CarCoupon.deleteData(\""+list[i].id+"\")'>删除</button></td>";
					tableHtml += "</tr>";
				}
				$("#coupons_tablebody").html(tableHtml);
			},
			error:function(error){
				CarCoupon.showMsg($("#couponlist_div"),"red",error.message);
			}
		});
	},
	//保存修改或保存
	save:function(){
		var couponName=$("#couponName").val();
		var money=$("#money").val();
		var couponUrl=$("#couponUrl").val();
		if(couponName.length==0){
			CarCoupon.showMsg($("#couponlist_div"),"red","请输入乘车券名称");
			return;
		}
		if(couponUrl.length==0){
			CarCoupon.showMsg($("#couponlist_div"),"red","请输入乘车券链接");
			return;
		}
		if(money.length==0){
			CarCoupon.showMsg($("#couponlist_div"),"red","请输入乘车券金额");
			return;
		}
		var couponObj=new CarCouponObj();
		couponObj.set("couponName",couponName);
		couponObj.set("money",parseFloat(money));
		couponObj.set("num",Number($("#num").val()));
		couponObj.set("robuser",Number($("#robuser").val()));
		couponObj.set("robnum",0);
		couponObj.set("couponUrl",couponUrl);
		couponObj.set("pkgId",CarCoupon.pkgId);
		couponObj.set("couponPkg",new AV.Object.createWithoutData("CouponPkg",CarCoupon.pkgId));
		couponObj.set("actId",CouponPkg.activity_objectId);
		couponObj.set("actCar",new AV.Object.createWithoutData("ActivityCar",CouponPkg.activity_objectId));
		couponObj.save(null,{
			success:function(data){
				CarCoupon.list(0);
			},
			error:function(obj,error){
				CarCoupon.showMsg($("#couponlist_div"),"red",error.message);
			}
		});
	},
	//删除数据
	deleteData:function(objectId){
		var query=new AV.Query(CarCouponObj);
		query.equalTo("objectId",objectId);
		query.destroyAll({
			success:function(){
				CarCoupon.list(0);
			},
			error:function(error){
				CarCoupon.showMsg($("#couponlist_div"),"red",error.message);
			}
		});
	},
	//显示信息提示
	showMsg:function(nodeElement,color,msg){
		nodeElement.html("<font color='"+color+"'>"+msg+"</font>").show(500).delay(5000).hide(500);
	}
}