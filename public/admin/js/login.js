//用户退出
function logout() {
    AV.User.logOut();
    window.location.href = "login.html";
}

//设置cookie
function createCookie(cookieName, value) {
    var cookieTime = new Date();
    cookieTime.setTime(cookieTime.getTime() + (24 * 60 * 60 * 1000));
    $.cookie(cookieName, value, {expires: cookieTime});
}

//用户登录
function login() {
    $("#hintinfo").html("");
    var name = $("#username").val();
    var pwd = $("#pwd").val();
    var loginCode = $("#loginCode").val();
    if (name == null || name.length < 1) {
        $("#hintinfo").html("<font color='red'>用户名不能为空</font>");
        return;
    }
    if (pwd == null || pwd.length < 1) {
        $("#hintinfo").html("<font color='red'>密码不能为空</font>");
        return;
    }
    AV.User.logIn(name, pwd, {
        success: function (user) {
            try {
                createCookie("szadmin" + user.get("username"), user.get("username"));

            } catch (e) {
                console.log(e.message);
            }


            $.post("../admin_login", {username: name, password: pwd}, function (data) {
                if (data.status == true) {
                    window.parent.document.location = "activityCar.html";
                } else {
                    $("#hintinfo").html("<font color='red'>账号或密码不正确</font>");
                }
            });

        },
        error: function (user, error) {
            $("#hintinfo").html("<font color='red'>账号或密码不正确</font>");
        }
    });
}
