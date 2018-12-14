var wsjca = {};
wsjca.install = function (Vue, options) {

  let opt = {
    domain:'ws://127.0.0.1:8282',   /*默认websocket服务连接地址*/
    dir:'./static/wm/controller',
    global:{}
  }
  for(let property in options){
    opt[property] = options[property];  // 使用 options 的配置
  }

  onOpen = function(evt){
    console.error('websocket connected');
    connected = true;
  },
  onClose = function(evt){
    console.error('websocket has been closed');
    connected = false;
  },
  onError = function(evt){
    console.error('wsjca websocket error: ' + evt.data);
  },
  onMessage = function(evt){
    var message = JSON.parse(evt.data);
    if(eval('typeof '+message.controller+'=="object"')){
      if(eval('typeof '+message.controller+'.'+message.action+'=="function"')){
        eval(message.controller+'.'+message.action+"(message)");
      }else{
        console.error('function: '+message.action+' not in '+message.controller+'.js controller');
      }
    }else{
      var scrp = document.createElement("script");
      scrp.src = opt.dir+'/'+message.controller+".js";
      document.body.appendChild(scrp);
      scrp.onload = function(){
        if(typeof eval(message.controller) == 'object'){
          if(this.debug)console.info('get controller : '+message.controller+'.js success');
          onMessage(evt);
        }else{
          console.error('the controller object not in the controller file');
        }
      }
      scrp.onerror = function(){
        console.error('get controller : '+this.jsdoc.message.controller+'.js failed, or file not exists');
      }
    }
  }

  Vue.prototype.$ws = null;
  if(window.MozWebSocket) {
    Vue.prototype.$ws = new MozWebSocket(opt.domain);
  }else if(window.WebSocket){
    Vue.prototype.$ws = new WebSocket(opt.domain);
  }else{
    Vue.prototype.$ws = null;
    console.error("your browser not support websocket");
  }
  if(Vue.prototype.$ws != null){
    Vue.prototype.$ws.options = opt;
    Vue.prototype.$ws.onopen = function (evt) { onOpen(evt) };
    Vue.prototype.$ws.onclose = function (evt) { onClose(evt) };
    Vue.prototype.$ws.onmessage = function (evt) { onMessage(evt) };
    Vue.prototype.$ws.onerror = function (evt) { onError(evt) };
    Vue.prototype.$ws.doSend = function (data,controller,action) {
      var contrl = (controller ? controller : 'index');
      var actn = (action ? action : 'index');
      var datas = data;
      if(typeof datas == 'object'){
        var global = Vue.prototype.$ws.options;
        for(var gb in global){
          datas[gb] = global[gb];
        }
        datas.controller = contrl;
        datas.action = actn;
        datas = JSON.stringify(datas);
      }
      Vue.prototype.$ws.send(datas);
    };
  }
  window.wsjca = Vue.prototype.$ws;
}
module.exports = wsjca;
