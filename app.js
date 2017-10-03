var http = require('http');
var https = require('https');
var fs = require('fs');
console.log('Starting');
var config = JSON.parse(fs.readFileSync("config.json"));
var host = config.host;
var port = config.port;
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";
var server = http.createServer(function (request, response) {
  console.log('Received request: ' + request.url);
  fs.readFile("./public"+request.url, function (error, data) {
    if (request.url=="/geojson") {
      https.get(url, function(res) {
        var body = '';
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on('end', function() {
          response.end(JSON.stringify(JSON.parse(body.toString('utf8'))['features'].map(function(item) {
            return {
              "mag": item.properties.mag,
              "time": (new Date(item.properties.time)).toUTCString(),
              "place": item.properties.place,
              "alert": item.properties.alert,
              "tsunami": item.properties.tsunami,
              "sig": item.properties.sig,
              "coordinates": item.geometry.coordinates,
              "selected": "false"
            }
          })))
        });
      }).on('error', function(e) {
        console.log("Got an error: "+ e);
      });
    }
    else if (error) {
      response.writeHead(404,{'Content-type': 'text/plain'});
      response.end("Desculpe, página não encontrada"); //mudar para html
    }
    else {
      response.writeHead(404,{'Content-type': 'text/html'});
      response.end(data);
    }
  });
});
server.listen(port, host, function() {
  console.log('Listening '+host+':'+port);
});
fs.watchFile("config.json", function() {
  config = JSON.parse(fs.readFileSync("config.json"));
  var host = config.host;
  var port = config.port;
  server.close();
  server.listen(port, host, function() {
    console.log('Now listening '+host+':'+port);  
  });
});