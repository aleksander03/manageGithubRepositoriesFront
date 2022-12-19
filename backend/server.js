import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import request from "request";
import { Octokit } from "@octokit/rest";
import * as client from "./dbOps";

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.post("/api/login", async (req, res) => {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecretId = process.env.REACT_APP_CLIENT_SECRET;
  const clientCode = req.body.code;

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

    let user = await client.findUserByGitHubEmail(response.data.githubEmail);

    if (!user) {
      let name;
      if (response.data.name) {
        name = response.data.name.split(" ");
      } else {
        name = ["Undefined", "Undefined"];
      }

      user = await client.createNewUserFromGit(
        response.data.email,
        name[0],
        name[1]
      );
    }

    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

// app.put("/api/addExistingOrganization", async (req, res) => {
//   const token = req.body.token;
//   const org = req.body.organization;
//   const name = req.body.name;
//   const octokit = new Octokit({ auth: token });

//   try {
//     const response = await octokit.request("GET /orgs/{org}", {
//       org: org,
//     });

//     //issues_url - zmienna w response
//     let organization = await prisma.organizations.findUnique({
//       where: { link: response.data.url },
//     });

//     if (!organization) {
//       organization = await prisma.organizations.create({
//         data: {
//           githubName: response.data.login.toUpperCase(),
//           link: response.data.url,
//           name: name ? name.toUpperCase() : response.data.login.toUpperCase(),
//         },
//       });

//       res.sendStatus(201);
//     } else {
//       res.sendStatus(204);
//     }
//   } catch (error) {
//     res.sendStatus(418);
//   }
// });

app.get("/api/getOrganizations", async (req, res) => {
  try {
    const orderBy = req.query.orderBy;
    const order = req.query.order;
    const filter = req.query.filter;
    const userId = parseInt(req.query.userId);
    const perPage = parseInt(req.query.perPage);
    const page = parseInt(req.query.page);
    const toSkip = perPage * page;

    const isAdmin = await client.isAdmin(userId);
    const organizations = await client.getOrganizations(
      orderBy,
      order,
      filter,
      userId,
      perPage,
      toSkip,
      isAdmin
    );

    res.send(organizations);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/getOrganizationsCount", async (req, res) => {
  try {
    const orderBy = req.query.orderBy;
    const order = req.query.order;
    const filter = req.query.filter;
    const userId = parseInt(req.query.userId);

    const isAdmin = await client.isAdmin(userId);
    const organizationsCount = await client.getOrganizationsCount(
      orderBy,
      filter,
      userId,
      isAdmin
    );

    res.send(organizationsCount);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/getStudents", async (req, res) => {
  try {
    const orderBy = req.query.orderBy;
    const order = req.query.order;
    const filter = req.query.filter;
    const userId = parseInt(req.query.userId);
    const perPage = parseInt(req.query.perPage);
    const page = parseInt(req.query.page);
    const toSkip = perPage * page;
    //czemu szukam po id organizacji? Lepiej chyba po id sekcji
    const isAdmin = await client.isAdmin(userId);
    const orgsIds = isAdmin ? [] : await client.orgsIdsForUser(userId);

    const students = await client.getStudents(
      orderBy,
      order,
      filter,
      perPage,
      toSkip,
      isAdmin,
      orgsIds
    );

    res.send(students);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/getStudentsCount", async (req, res) => {
  try {
    const orderBy = req.query.orderBy;
    const filter = req.query.filter;
    const userId = parseInt(req.query.userId);

    const isAdmin = await client.isAdmin(userId);
    const orgsIds = isAdmin ? [] : await client.orgsIdsForUser(userId);

    const studentsCount = await client.getStudentsCount(
      orderBy,
      filter,
      orgsIds,
      isAdmin
    );

    res.send(studentsCount);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/getSections", async (req, res) => {
  try {
    const orderBy = req.query.orderBy;
    const order = req.query.order;
    const filter = req.query.filter;
    const userId = parseInt(req.query.userId);
    const perPage = parseInt(req.query.perPage);
    const page = parseInt(req.query.page);
    const toSkip = perPage * page;

    const isAdmin = await client.isAdmin(userId);
    const sections = await client.getSections(
      orderBy,
      order,
      filter,
      perPage,
      toSkip,
      isAdmin,
      userId
    );

    res.send(sections);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/getSectionsCount", async (req, res) => {
  try {
    const orderBy = req.query.orderBy;
    const order = req.query.order;
    const filter = req.query.filter;
    const userId = parseInt(req.query.userId);

    const isAdmin = await client.isAdmin(userId);
    const sectionsCount = await client.getSectionsCount(
      orderBy,
      filter,
      userId,
      isAdmin
    );

    res.send(sectionsCount);
  } catch (error) {
    res.send(error);
  }
});

app.get("/", function (req, res) {
  res.send("Get something");
});

app.listen(port, () => {
  console.log(`App listening at ${port} port`);
});
