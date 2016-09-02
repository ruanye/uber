function syncDataToUber(phone,type,activityId){
//	var alert=$.alert({
//        title: '信息',
//        content: "正在同步到您的优步账户中"
//    });
//	setTimeout(
//		function(){
			AV.Cloud.run("mobile_uber_sync",{phone:phone,type:type,activityId:activityId},{
				success:function(){
//					alert.close();
//					alert=$.alert({
//				        title: '信息',
//				        content: "同步成功"
//				    });
//					setTimeout(function(){alert.close();},1000);
				},
				error:function(error){
//					alert.close();
//					alert=$.alert({
//				        title: '信息',
//				        content: "同步失败"
//				    });
//					setTimeout(function(){alert.close();},1000);
				}
			});
//		},1000);
}