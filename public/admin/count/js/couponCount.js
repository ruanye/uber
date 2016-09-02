/**
 * Created by ThinkPad E450 on 2015/10/15.
 */
var request=GetRequest();
var objectId=request["objectId"];
$(document).ready(function () {

    AV.Cloud.run("admin_usercount_event",{metrics: "event_count", event:"counpon_"+objectId},{
        success:function(list){
            var datas = list.data;
            var num = 0;
            for(var k in datas){
                num+=datas[k];
            }
            $("#PVSpan").html("总PV: "+num);
        },
        error:function(error){
            console.log(JSON.stringify(error));
        }
    });


    var $startTime=$("#startTime"),
        $endTime=$("#endTime"),
        $lineChart=$("#lineChart"),
        $legend=$(".legend"),
        dateStart,
        dateEnd,
        dateStartMs,
        dateEndMs,
        dateLength,
        date=new Date();
    //设置默认时间
    $endTime.val(date.format("yyyy-MM-dd"));
    $startTime.val(new Date(date.getTime()-7*24*3600*1000).format("yyyy-MM-dd"));
    $legend.css({
        "top":$lineChart.offset().top,
        "right":-80
    });

    //datetimepicker初始化
    $('#startTime,#endTime').datetimepicker({
        minView: "month", //选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", //选择日期后，文本框显示的日期格式
        language: 'zh-CN', //汉化
        autoclose:true //选择日期后自动关闭
    });
    //加载数据
    function loadData(type){
        AV.Cloud.run("admin_event",{event:"counpon_"+objectId,start:$startTime.val().split("-").join(""),end:$endTime.val().split("-").join("")},{
            success:function(list){
                setData(type,list,0);
                //console.log(JSON.stringify(list.data));
            },
            error:function(error){
                console.log(JSON.stringify(error));
            }
        });
    }
    
    loadData();
    //选择开始时间
    $startTime.on("change", function () {
        if($endTime.val()!=""){
            //显示数据
            setDate();
            if(dateStartMs>=dateEndMs){
                dateEndMs=dateStartMs+86400000*6;
                var dates=new Date(dateEndMs);
                dates=formatterDate(dates);
                $endTime.val(dates);
            }
            loadData(0);
        }
    });
    //选择截止时间
    $endTime.on("change", function () {
        if($startTime.val()!=""){
            //显示数据
            setDate();
            if(dateStartMs>=dateEndMs){
                dateStartMs=dateEndMs-86400000*6;
                var dates=new Date(dateStartMs);
                dates=formatterDate(dates);
                $startTime.val(dates);
            }
            loadData(1);
        }
    });
    //格式化时间（毫秒数转日期2015-10-19）
    function formatterDate(date) {
        var datetime =date.getFullYear()+"-"+((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : "0"
            + (date.getMonth() + 1))
            + "-"// "月"
            + (date.getDate() <10 ? "0" + date.getDate() : date
                .getDate());
        return datetime;
    }
    //初始化插件
    var lineData = {
        labels: [],
        datasets: [
            {
                label: "Example dataset",
                fillColor: "rgba(0,164,123,0)",
                strokeColor: "rgba(0,164,123,1)",
                pointColor: "rgba(0,164,123,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(0,164,123,1)",
                data: [65, 59, 80, 81, 56, 55, 40]
            }
        ]
    };
    var lineOptions = {
        scaleOverlay : false,
        scaleOverride : false,
        scaleFontSize : 12,
        scaleSteps : null,
        scaleStepWidth : 20,
        scaleShowGridLines: true,
        scaleGridLineColor: "rgba(0,0,0,.05)",
        scaleGridLineWidth: 1,
        scaleLineWidth : 1,
        bezierCurve: true,
        bezierCurveTension: 0.4,
        pointDot: true,
        pointDotRadius: 4,
        pointDotStrokeWidth: 1,
        pointHitDetectionRadius: 20,
        datasetStroke: true,
        datasetStrokeWidth: 1,
        datasetFill: true,
        responsive: true
    };
    //设置时间
    function setDate(){
        dateStart=new Date($startTime.val());//开始时间
        dateEnd=new Date($endTime.val());//结束时间
        dateStartMs=dateStart.getTime();//开始时间毫秒数
        dateEndMs=dateEnd.getTime();//结束时间毫秒数
        dateLength=(dateEndMs-dateStartMs)/86400000+1;//天数
    }
    //绘制图表
    function setData(type,list,type1){
        setDate();
        var lineLabel,
            ctx,
            myNewChart,
            dayMs=86400000;//一天的毫秒数
        //最多显示30条数据
        if(dateLength>30){
            dateLength=30;
            if(type==0){
                dateEndMs=dateStartMs+86400000*29;
                var dates=new Date(dateEndMs);
                dates=formatterDate(dates);
                $endTime.val(dates);
            }else{
                if(type==1){
                    dateStartMs=dateEndMs-86400000*29;
                    var dates=new Date(dateStartMs);
                    dates=formatterDate(dates);
                    $startTime.val(dates);
                }
            }
        }

        lineData.labels=[];//清空x轴数据
        lineData.datasets[type1].data=[];//清空y轴数据
        for(var i=0;i<dateLength;i++){
            //设置x y轴数据
            lineLabel=new Date(dateStartMs+dayMs*i);
            lineData.labels[i]=formatterDate(lineLabel);
            lineData.datasets[type1].data[i]=list.data[lineData.labels[i]];
        }

        //重绘canvas
        $('#lineChart').remove(); // this is my <canvas> element
        $('#lineChartParent').append('<canvas id="lineChart" height="140"></canvas>');
        ctx = document.getElementById("lineChart").getContext("2d");
        myNewChart = new Chart(ctx).Line(lineData, lineOptions);
    }
}) ;