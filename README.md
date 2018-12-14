vue plugins, run websocket like controller-action mode.

```import Wsca from 'Wsca';Vue.use(Wsca,{domain:'ws://127.0.0.1:8282',dir:'./static/wm/controller/',global:{uid:"1","globaldata":"global"}});```

at the server side, your websocket send back like ```{"controller":"jsController","action":"jsAction","data":{"yourData":"datas"}}```