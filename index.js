var express = require('express');
var StickyMiddleware = require('./fastp-core/fastp-sticky-middleware');
const config = require('config');

if(!config.has("type")){
    console.log("Config dosyası okunamadı");
    throw "Config dosyası okunamadı";
}

var app = express();

var sm = new StickyMiddleware(app);
app = sm.StickIt(app);
app.get('/', function (req, res) {
  res.send('Hello From Fastp!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});