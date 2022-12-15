import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import request from "request";
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
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

app.post("/api/addExistingOrganization", async (req, res) => {
  const token = req.body.token;
  const org = req.body.organization;
  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.request("GET /orgs/{org}", {
      org: org,
    });
    //issues_url - zmienna w response
    let organization = await prisma.organizations.findUnique({
      where: { link: response.data.url },
    });
    if (!organization)
      organization = await prisma.organizations.create({
        data: {
          name: response.data.login,
          link: response.data.url,
        },
      });
    res.send(organization);
  } catch (error) {
    res.send(error);
  }
});

// app.post("/api/createOrganization", async (req, res) => {
//   try{
//     await request.post({
//       url: `https://github.hpe.com/api/v3/admin/organizations`,
//       headers:{

//       }
//     })
    
//   }catch(error){
//     console.log(error)
//     res.send(error)
//   }
// })

app.get("/", function (req, res) {
  res.send("Get something");
});

app.listen(port, () => {
  console.log(`App listening at ${port} port`);
});
