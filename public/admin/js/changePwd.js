/**
 * Created by husu on 15/6/29.
 */



function pwdReset(){
    $("#oldpwd").val("");
    $("#newpwd").val("");
    $("#repwd").val("");
}

function changePassword() {

    var user = AV.User.current();


    if(user==null){
        window.location = "login.html";
    }



    if(user!= null){

        if ( $("#newpwd").val().length < 6 ) {

            $("#changepwdHint").html("<font color='red'>密码长度不能少于6位</font>");
            return ;
        }
        if( $("#newpwd").val() !=  $("#repwd").val() ){

            $("#changepwdHint").html("<font color='red'>两次输入的密码必须一致</font>");
            return;
        }

        user.updatePassword($("#oldpwd").val(), $("#newpwd").val(),{
            success: function(){
                //更新成功
                pwdReset();
                $("#changepwdHint").html("<font color='blue'>密码修改成功</font>");
            },
            error: function(object, error){
                //更新失败
                console.log(error);
                $("#changepwdHint").html("<font color='red'>"+error.message+"</font>");

            }
        });
    }else{
        window.location.href = "login.html";
    }
}