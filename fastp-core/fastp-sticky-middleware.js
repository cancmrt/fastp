var bodyParser = require('body-parser');
var Engine = require('./fastp-engine');

class StickyMiddleware {
    StickIt(app) {
      app.use(bodyParser.urlencoded({ extended: false }))
      app.use(bodyParser.json())
      return app.use((req, res, next) => {
        var splitedUrl = req.url.substring(1).split("/");
        if(req.method.toLowerCase() == "post" && splitedUrl.length > 0 && splitedUrl[0] == "api"){
          splitedUrl.shift();
          var fastpEngine = new Engine();
          fastpEngine.Run(splitedUrl,req.body,next, (ComingData)=>{
            res.send(ComingData);
          });
          
        }
        else{
          next()
        }
        
      })
    }
  }

module.exports = StickyMiddleware



