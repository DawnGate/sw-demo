const express = require("express");
var bodyParser = require("body-parser");
var glob = require("glob");
var path = require("path");
var fs = require("fs");

var app = express();

// middleware for parse body to json
app.use(bodyParser.json());

// middleware for cors origin
app.use(function cosify(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

// middleware set header to service worker
// clean file sw in server with cache in node server
app.use(function setServiceWorkerHeader(req, res, next) {
  var file = req.url.split("/").pop();
  if (
    file === "seriver-worker.js" ||
    file === "worker.js" ||
    file === "sw.js"
  ) {
    res.header("Cache-control", "public, max-age=0");
  }
  next();
});

// match all server.js file and mark to server to open the new server
// url endpoint
glob.sync("./*/server.js").map(function requireRecipe(file) {
  var route = "/" + path.basename(path.dirname(file)) + "/";
  require(file)(app, route);
});

var port = process.env.PORT || 3003;
var ready = new Promise(function willListen(resolve, reject) {
  app.listen(port, function didListen(err) {
    if (err) {
      reject(err);
      return;
    }
    console.log("app listent on port http://localhost:%d", port);
    resolve();
  });
});

app.ready = ready;
exports.app = app;
