var path = require("path");
var bodyParser = require("body-parser");

// this need a server so, will implement in next time
module.exports = function (app, route) {
  app.use(bodyParser.json());
  app.get(route + "report", (req, res) => {
    res.send({ message: "hello report" });
  });
};
