var Event={
	sendEvent:function(analytics_event_id){
		var analytics = AV.analytics({
		    appId: leancloudappid,
		    appKey: leancloudappkey,
		    version: '1.8.6',
		    channel: 'weixin'
		});
		analytics.send({
		    // 事件名称
		    event: analytics_event_id,
		    // 事件属性，任意数据
		    attr: {
//		        testa: 123,
//		        testb: 'abc'
		    },
		    // 该事件持续时间（毫秒）
		    duration: 6000
		}, function(result) {
			console.log("result:"+JSON.stringify(result));
		    if (result) {
		        console.log('统计数据发送成功！');
		    }
		});
	}
}
