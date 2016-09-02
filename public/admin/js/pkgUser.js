/**
 * 包用户管理的相关操作
 * 2015-12-29
 */
var PkgUser={
	actId:null,
	pageNo: 1,
    pageSize:50,
    //分页
    goPage:function(type){
        var page=PkgUser.pageNo;
        if(type==-1){
        	PkgUser.pageNo=page-1;
        }else if(type==1){
        	PkgUser.pageNo=page+1;
        }
        PkgUser.loadData();
    },
	loadData:function(actId){
		if(actId!=undefined){
			PkgUser.actId=actId;
		}
		$("#drawUserModal").modal("show");
		var params={pageNo:PkgUser.pageNo,pageSize:PkgUser.pageSize};
		$.post("../../pkgUser/list/"+PkgUser.actId,params,function(data){
			if(data.status==-2){
				window.location=data.url;
			}
			else if(data.status==-1){
				PkgUser.showMsg($("#drawUserinfo_div"),"red",data.error);
			}else{
				var list=data.list;
				if(PkgUser.pageSize==list.length){
    				$("#user_btn1").removeAttr("disabled");
    			}else{
    				$("#user_btn1").attr("disabled","disabled");
    			}
    			if(PkgUser.pageNo == 1){
                    $("#user_btn2").attr("disabled","disabled");
                }else{
                    $("#user_btn2").removeAttr("disabled");
                }
				//清空选择数据 
				var tableHtml="";
				for (var i = 0; i < list.length; i++) {
					tableHtml+="<tr>" +
							"<td>"+list[i].phone+"</td>" +
							"<td>"+list[i].pkgId+"</td>";
					tableHtml += "</tr>";
				}
				$("#drawuser_tablebody").html(tableHtml);
			}
		});
	},
	//上传数据
	upload:function(){
		var $btn = $("#uploadButton");
		$btn.button('loading');
		//上传资料
		var successCount=0;
		var successTime=new Date().getTime();
	    var data = $("#drawuser_data").val();
	    if(data == null || data.length < 1){
	    	PkgUser.showMsg($("#uploadUserinfo_div"),"red","数据不能为空");
	        $btn.button('reset');
	        return ;
	    }
	    var userArray = new Array();
	    var array = data.split("\n");
	    for(var i = 0 ; i < array.length; i++){
	        var item =  array[i];
	        var itemAttrs = item.split(",");
	        if(itemAttrs.length != 2 ){
	        	PkgUser.showMsg($("#uploadUserinfo_div"),"red","数据格式不对,出错数据在第" + (i+1) +"行，请确保每行只有2个字段");
	            $btn.button('reset');
	            return ;
	        }
	        var userObj = {};
	        userObj.phone=itemAttrs[0];
	        userObj.pkgId=itemAttrs[1];
	        
	        userArray[i] = userObj;
	    }
	    
//	    for(var i=0;i<userArray.length;i++){
//	    	listLabel:for(var j=i+1;j<userArray.length;j++){
//	    		if(userArray[i].phone==userArray[j].phone){
//	    			userArray.splice(i,1);
//	    			i--;
//	    			break listLabel;
//	    		}
//	    	}
//	    }
	    var total=userArray.length;
	    while(userArray.length>0){
	    	var params={userList:JSON.stringify(userArray.splice(0,200))};
	    	$.post("../../pkgUser/upload/"+PkgUser.actId,params,function(data){
	    		if(data.status==-2){
					window.location=data.url;
				}
				else if(data.status==-1){
					PkgUser.showMsg($("#uploadUserinfo_div"),"red",data.error);
				}else{
					$("#uploadUserinfo_div").html("<font color='blue'>已成功上传"+(successCount+=(data.count))+"条数据，耗时"+((new Date().getTime()-successTime)/1000.0).toFixed(2)+"s！</font>");
					if(successCount==total){
						PkgUser.pageNo=1;
						PkgUser.loadData();
						$("#uploadUserinfo_div").show(500).delay(5000).hide(500);
	            	    $("#uploadButton").button('reset');
	            	    $("#drawuser_data").val("");
					}
				}
		    });
	    }
	},
	//删除数据
	deleteData:function(){
		if(confirm("确定删除该活动所有用户")){
			$.get("../../pkgUser/delete/"+PkgUser.actId,function(data){
				if(data.status==-2){
					window.location=data.url;
				}
				else if(data.status==-1){
					PkgUser.showMsg($("#drawUserinfo_div"),"red",data.error);
				}else{
					PkgUser.showMsg($("#drawUserinfo_div"),"blue","删除成功");
					PkgUser.loadData();
				}
			});
		}
	},
	//显示信息提示
	showMsg:function(nodeElement,color,msg){
		nodeElement.html("<font color='"+color+"'>"+msg+"</font>").show(500).delay(5000).hide(500);
	}
}