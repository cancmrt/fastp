const fs = require("fs");
const config = require('config');
const SqliteConnector = require("./dbconnectors/sqlite-connector");

class Engine {
    Run(url,body,nextFunc,FinalData) {
        var Connector;
        console.log(url);
      var urlResult = this.UrlExist(url);
      if(urlResult == false){
        console.log("URL eşleştirme başarısız");
        nextFunc();
      }
      if(!config.has("type")){
        console.log("Veritabanı bağlantı tipi bulunamadı");
        nextFunc();
      }
      if(!config.has("dbconnection")){
        console.log("Veritabanı bağlantı bilgileri bulunamadı");
        nextFunc();
      }
      if(config.get("type") == "sqlite"){
        Connector = new SqliteConnector(config.get("dbconnection"))
      }else{
        console.log("Veritabanı connectoru sağlanamadı.");
        nextFunc();
      }

      let query = fs.readFileSync(process.cwd() + "/" + urlResult).toString();
      if(!query){
        console.log("Konumdan sorgu çekilemedi");
        nextFunc();
      }

      for(var name in body) {
        var value = body[name];
        query = query.replaceAll(("@"+name),value)
      }
      Connector.GetQuery(query, (data) => {
        FinalData(data);
      });
      

    }
    UrlExist(url){
        if(!fs.existsSync("paths")){
            console.log("Paths klasörü mevcut değil");
            nextFunc();
        }
        var newUrl = "paths/" + url.join("/") + ".sql";
        if(!fs.existsSync(newUrl)){
            console.log(newUrl+" mevcut değil");
            return false;
        }
        return newUrl;
    }
  }

module.exports = Engine
