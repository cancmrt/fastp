const fs = require("fs");
const config = require('config');
const { Curl } = require('node-libcurl');
const SqlString = require('sqlstring');
const SqliteConnector = require("./dbconnectors/sqlite-connector");

class Engine {
    Run(url,body,nextFunc,FinalData) {
        var Connector;
        console.log(url);
      var urlResult = this.UrlExistAndType(url);
      var urlReplaceChracter = '\\';
      var urlReplaceChracterNow = "'";
      if(urlResult == -1){
        console.log("URL eşleştirme başarısız");
        nextFunc();
      }
      if(urlResult == 1){
        if(!config.has("type")){
          console.log("Veritabanı bağlantı tipi bulunamadı");
          nextFunc();
        }
        if(!config.has("dbconnection")){
          console.log("Veritabanı bağlantı bilgileri bulunamadı");
          nextFunc();
        }
        if(config.get("type") == "sqlite"){
          urlReplaceChracter = '\\';
          urlReplaceChracterNow = "'";
          Connector = new SqliteConnector(config.get("dbconnection"))
        }else{
          console.log("Veritabanı connectoru sağlanamadı.");
          nextFunc();
        }
  
        let query = fs.readFileSync(process.cwd() + "/" + this.GetUrlPath(url,".sql")).toString();
        if(!query){
          console.log("Sorgu çekilemedi");
          nextFunc(); 
        }
  
        for(var name in body) {
          var value = SqlString.escape(body[name]).replaceAll(urlReplaceChracter,urlReplaceChracterNow);
          query = query.replaceAll(("@"+name),value)
        }
        console.log(query);
        if(query.toLowerCase().includes("insert") || query.toLowerCase().includes("update")){
          Connector.ExecuteQuery(query, (data) => {
            console.log(data);
            FinalData(data);
          });
        }
        else{
          Connector.GetQuery(query, (data) => {
            console.log(data);
            FinalData(data);
          });
        }
        
      }
      if(urlResult == 2){
        let CurlCommand = fs.readFileSync(process.cwd() + "/" + this.GetUrlPath(url,".curl")).toString();
        if(!CurlCommand){
          console.log("CURL çekilemedi");
          nextFunc();
        }
        
        let CurlCmdJs = JSON.parse(CurlCommand);

        if(CurlCmdJs.PassBodyAsRequest != true){
          for(var name in body) {
            var value = body[name];
            CurlCommand = CurlCommand.replaceAll(("@"+name),value)
          }
          CurlCmdJs = JSON.parse(CurlCommand);
        }

        const curl = new Curl();

        curl.setOpt('URL', CurlCmdJs.RequestUrl);
        curl.setOpt(Curl.option.HTTPHEADER,CurlCmdJs.Headers)
        curl.setOpt('FOLLOWLOCATION', true);
        
        curl.setOpt(Curl.option.CUSTOMREQUEST, CurlCmdJs.Method);
        if(CurlCmdJs.PassBodyAsRequest == true && CurlCmdJs.Method == "POST"){
          curl.setOpt(Curl.option.POSTFIELDS, JSON.stringify(body));
        }

        curl.setOpt(Curl.option.SSL_VERIFYPEER, CurlCmdJs.SSLVerifyPeer);

        
        curl.on('end', function (statusCode, data, headers) {
          console.log(statusCode);
          console.log('---');
          console.log(data.length);
          console.log('---');
          console.log(this.getInfo( 'TOTAL_TIME'));
          console.log(data);
          this.close();
          FinalData(data);
        });

        curl.on('error', function (error, errorCode) {
          console.error(error, errorCode)
        
          this.close()
        });

        curl.perform();
      }
      
      

    }
    UrlExistAndType(url){
        if(!fs.existsSync("paths")){
            console.log("Paths klasörü mevcut değil");
            nextFunc();
        }
        var newUrlSql = "paths/" + url.join("/") + ".sql";
        var newUrlCurl = "paths/" + url.join("/") + ".curl";
        if(fs.existsSync(newUrlSql)){
            return 1;
        }
        else if(fs.existsSync(newUrlCurl)){
          return 2;
        }
        else{
          return -1;
        }
    }
    GetUrlPath(url,extension){
      return "paths/" + url.join("/") + extension;
    }
  }

module.exports = Engine
