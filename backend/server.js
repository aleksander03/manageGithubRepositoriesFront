import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import request from "request";
import { application, response } from "express";
import { Octokit } from "@octokit/rest";
import { PrismaClient } from "@prisma/client";

const app = express();
const port = 5000;
const prisma = new PrismaClient();

app.use(bodyParser.json());
app.use(cors());

app.post("/api/login", async (req, res) => {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecretId = process.env.REACT_APP_CLIENT_SECRET;
  const clientCode = req.body.code;
  console.log(clientId);

  await request.post(
    {
      url: `https://github.com/login/oauth/access_token/?client_id=${clientId}&client_secret=${clientSecretId}&code=${clientCode}`,
      headers: {
        "User-Agent": "request",
        Accept: "application/json",
      },
    },
    function (error, response, body) {
      res.send(body);
    }
  );
});

app.post("/api/getUser", async (req, res) => {
  const token = req.body.token;
  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.request("GET /user", {});
    let user = await prisma.users.findUnique({
      where: { githubEmail: response.data.email },
    });
    if (!user) {
      const name = response.data.name.split(" ");
      user = await prisma.users.create({
        data: {
          githubEmail: response.data.email,
          name: name[0],
          surname: name[1],
        },
      });
    }
    console.log(user);
    res.send(user);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/", function (req, res) {
  res.send("Get something");
});

app.listen(port, () => {
  console.log(`App listening at ${port} port`);
});
