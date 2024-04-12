require("dotenv").config();

const { PORT = 3000 } = process.env;
const express = require("express");
const cors = require("cors");
const server = express();

api_config = {
  'origins': ['http://localhost:5173']
}

cors(server, resources = {"/api" : api_config});

server.use(cors());

const bodyParser = require("body-parser");
server.use(bodyParser.json({limit: '50mb'}));

const apiRouter = require("./api");
server.use("/api", apiRouter);
const { client } = require("./db");
client.connect();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});