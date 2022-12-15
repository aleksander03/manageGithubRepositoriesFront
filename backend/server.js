const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require("request");
const { application } = require("express");
const { Octokit } = require("@octokit/rest");

const app = express();
const port = 5000;
require('dotenv').config();

app.use(bodyParser.json());
app.use(cors());

app.post("/api/login", async (req, res) => {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecretId = process.env.REACT_APP_CLIENT_SECRET;
  const clientCode = req.body.code;

  await request.post({
    url: `https://github.com/login/oauth/access_token/?client_id=${clientId}&client_secret=${clientSecretId}&code=${clientCode}`,
    headers: {
      "User-Agent": "request",
      Accept: "application/json"
    }},
    function(error, response, body) {
      res.send(body)
  });
});

app.post("/api/getUser", async (req, res) => {
  const token = req.body.token;
  const octokit = new Octokit({auth: token})

  const response = await octokit.request('GET /user', {})
  res.send(response)
})

app.get("/", function (req, res) {
  res.send("Get something");
});

app.listen(port, () => {
  console.log(`App listening at ${port} port`);
});
