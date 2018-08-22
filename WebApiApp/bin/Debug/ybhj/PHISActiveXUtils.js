(function(global){
	var ua = navigator.userAgent.toLowerCase();
	check = function(r){               
		return r.test(ua);  
	};
	version = function (is, regex) {
		var m;
		return (is && (m = regex.exec(ua))) ? parseFloat(m[1]) : 0;
	}
	var isOpera = check(/opera/);
	var isWebKit = check(/webkit/);
	var isChrome = check(/\bchrome\b/);
	var isSafari = !isChrome && check(/safari/);
	var isIE = !isOpera && check(/msie/);
	var isIE6 = isIE && check(/msie 6/);
	var isGecko = !isWebKit && check(/gecko/);
	var isFirefox = check(/\bfirefox/);
	var id = "phisActiveXObject"
	var sybId = "ocxObj";
	var hzyb2014Id ="WebClientSiInterface";
	var codebase = "PHIS.cab";
	var html=null
	var sybhtml=null;
	var hzyb2014html = null;
	if(isIE){
		html = "<OBJECT ProgID='PHIS.MedicalInsurance' classid='clsid:E28F7E48-2C08-4E42-8860-15681CA3FCD5' width='100' height='100' id='" + id + "' name='" +id+ "' codebase='" + codebase + "'></OBJECT>"
		sybhtml = "<OBJECT id='"+sybId+"' name='"+sybId+"' style='display:none' classid='CLSID:D4B0A700-B1C0-44AC-B5D1-962EAE3B91FB' codeBase='BargaingApplyV2_01050.ocx'></OBJECT>";
		hzyb2014html = "<OBJECT id='"+hzyb2014Id+"' name='"+hzyb2014Id+"' style='display:none' classid='CLSID:188DAF2C-27D8-4C03-9E35-A0A71EC4A77F'></OBJECT>";
	}
	else {
		html = '<object id="' +id+ '" TYPE="application/x-itst-activex" ALIGN="baseline" BORDER="0" WIDTH="0" HEIGHT="0" clsid="{E28F7E48-2C08-4E42-8860-15681CA3FCD5}" codeBaseURL="' + codebase + '"></object>';
		sybhtml = '<object id="'+sybId+'" TYPE="application/x-itst-activex" ALIGN="baseline" BORDER="0" WIDTH="0" HEIGHT="0" clsid="{D4B0A700-B1C0-44AC-B5D1-962EAE3B91FB}" codeBaseURL="BargaingApplyV2_01050.ocx"></object>';
		hzyb2014html = '<object id="'+hzyb2014Id+'" TYPE="application/x-itst-activex" ALIGN="baseline" BORDER="0" WIDTH="0" HEIGHT="0" clsid="{CLSID:188DAF2C-27D8-4C03-9E35-A0A71EC4A77F}" ></object>';
	}
	
	global.$PhisActiveXObjectUtils = {
		initHtmlElement:function(){
//			if(!this.initHtmlElement){
			if(!this.ele){
			this.ele = document.createElement("div")
				this.ele.innerHTML = html;
			document.body.appendChild(this.ele);
			}
//			this.initHtmlElement = true;
//			}
		},
		getObject:function(){
			if (window.document[id]) {
				return window.document[id];
			}
			if (isIE) {
				if (document.embeds && document.embeds[id])
				  return document.embeds[id]; 
			} 
			else {
				return document.getElementById(id);
			}
		},
		initSYBHtmlElement:function(){
			if(!this.initSYBHtml){
				var ele = document.createElement("div")
					ele.setAttribute("width","0px")
					ele.setAttribute("height","0px")
					ele.innerHTML = sybhtml;
				document.body.appendChild(ele);
				this.initSYBHtml = true;
			}
		},
		getSybObject:function(){
			if (window.document[sybId]) {
				return window.document[sybId];
			}
			if (isIE) {
				if (document.embeds && document.embeds[sybId])
				  return document.embeds[sybId]; 
			} 
			else {
				return document.getElementById(sybId);
			}
		},
		initHZYB2014HtmlElement:function(){
			if(!this.initHZYB2014Html){
				var ele = document.createElement("div")
					ele.setAttribute("width","0px")
					ele.setAttribute("height","0px")
					ele.innerHTML = hzyb2014html;
				document.body.appendChild(ele);
				this.initHZYB2014Html = true;
			}
		},
		getHZYB2014Object:function(){
			if (window.document[hzyb2014Id]) {
				return window.document[hzyb2014Id];
			}
			if (isIE) {
				if (document.embeds && document.embeds[hzyb2014Id])
				  return document.embeds[hzyb2014Id]; 
			} 
			else {
				return document.getElementById(hzyb2014Id);
			}
		},
		szybUserBargaingApply : function(jym,no,data1,data2){
			this.initSYBHtmlElement();
			var obj = this.getSybObject();
			if(!this.UserBargaingInit){
				var reInitCord = obj.UserBargaingInit("","");
				if(reInitCord<0){
					obj.reCord = reInitCord;
					if(!obj.ErrMsg){
						obj.ErrMsg = obj.RetData.split("$$")[1].split("~")[1];
					}
					return obj;
				}
				this.UserBargaingInit = true;
			}
			var reCord = obj.UserBargaingApply(jym,no,data1,data2)
			obj.reCord = reCord;
			if(reCord<0){
				if(!obj.ErrMsg){
					obj.ErrMsg = obj.RetData.split("$$")[1].split("~")[1];
				}
			}
			return obj;
		},
		/**余杭医保(全局的初始化对象返回值yhybInit,各方法调用时都会使用)*/
		getYHYBObject : function(){
			$PhisActiveXObjectUtils.initHtmlElement();
			var yhobj = $PhisActiveXObjectUtils.getObject();
			//是否已初始化
			if(!this.yhybInit){
				//获取余杭医保配置
				var ret = util.rmi.miniJsonRequestSync({
								serviceId : "medicareYHService",
								serviceAction : "getYHServer"
							});
				if(ret.code > 300){
					this.processReturnMsg(ret.code, ret.msg);
					return;
				}
				
				var yhip = eval(ret.json).YHYBSERVERIP;
				var yhport = eval(ret.json).YHYBSERVERPORT;
				var yhservlet = eval(ret.json).YHYBSERVERSERVLET;
				
				//应用服务器IP地址,应用服务器端口号,Servlet为应用服务器入口Servlet的名称
				this.yhybInit = yhobj.Hy_newinterfacewithinit(yhip, yhport, yhservlet);
				if(!this.yhybInit || this.yhybInit < 0){
					alert("余杭医保接口初始化失败!");
					return;
				}
			}
			//是否已登录
			if(!this.yhybLogin){
				var res_l = yhobj.Hy_start(this.yhybInit,0);//登录
				yhobj.Hy_putcol(this.yhybInit,"staff_id","staff1")
				yhobj.Hy_putcol(this.yhybInit,"staff_pwd","staff_pwd")
				var res = yhobj.Hy_run(this.yhybInit);
				if(res < 0){
					var err = yhobj.Hy_getmessage(this.yhybInit);
					MyMessageTip.msg("提示", "登录到余杭医保中心失败!"+res+":"+err, true);
					return;
				}else{
					this.yhybLogin = true;
					MyMessageTip.msg("提示", "成功登录到余杭医保中心!", false);
				}
			}
			yhobj.yhybInit = this.yhybInit;
			return yhobj;
		}
	}
})(this)