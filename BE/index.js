require("dotenv").config();

const { PORT = 3000 } = process.env;
const express = require("express");
const cors = require("cors");
const server = express();

server.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "http://localhost:5173"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});

//server.use(cors());

const bodyParser = require("body-parser");
server.use(bodyParser.json({limit: '50mb'}));

const apiRouter = require("./api");
server.use("/api", apiRouter);
const { client } = require("./db");
client.connect();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});