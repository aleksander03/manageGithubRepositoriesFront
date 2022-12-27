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
  try {
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
  } catch (error) {
    res.send(error);
  }
});

app.post("/api/getUser", async (req, res) => {
  try {
    const token = req.body.token;
    const octokit = new Octokit({ auth: token });
    const response = await octokit.request("GET /user", {});
    let user = await client.findUserByGitHubEmail(response.data.email);

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

app.post("/github/findAndCreateOrganization", async (req, res) => {
  try {
    const token = req.body.token;
    const org = req.body.org;
    const octokit = new Octokit({ auth: token });

    const response = await octokit.request("GET /orgs/{org}", {
      org: org,
    });
    const isOrgExist = await client.checkIfOrgExist(response.data.login);
    if (isOrgExist) {
      res.sendStatus(204);
    } else {
      const organization = await client.addExistingOrganization(
        response.data.login,
        response.data.login,
        response.data.html_url
      );
      res.send(organization);
    }
  } catch (error) {
    res.sendStatus(418);
  }
});

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

app.get("/api/getOrganization", async (req, res) => {
  try {
    const id = parseInt(req.query.id);
    const userId = parseInt(req.query.userId);

    const isAdmin = await client.isAdmin(userId);
    const organization = await client.getOrganization(id, userId, isAdmin);
    if (organization) {
      res.send(organization);
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    console.error(error);
  }
});

app.delete("/api/deleteOrganization", async (req, res) => {
  try {
    const orgId = parseInt(req.query.orgId);
    const userId = parseInt(req.query.userId);

    const isAdmin = await client.isAdmin(userId);
    if (isAdmin) {
      const org = await client.deleteOrganization(orgId);
      if (org) res.sendStatus(200);
      else res.sendStatus(418);
    } else res.sendStatus(401);
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/getAvailableProfessors", async (req, res) => {
  try {
    const orgId = parseInt(req.query.orgId);
    const filter = req.query.filter;

    const professors = await client.getAvailableProfessors(orgId, filter);
    if (professors) res.send(professors);
    else res.sendStatus(204);
  } catch (error) {
    res.send(418);
  }
});

app.put("/api/addProfessorsToOrganization", async (req, res) => {
  try {
    const orgId = parseInt(req.query.orgId);
    const professorId = parseInt(req.query.userId);

    const addRelation = await client.addProfessorsToOrganization(
      orgId,
      professorId
    );
    if (addRelation) res.sendStatus(201);
    else res.sendStatus(503);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/api/deleteProfessorsFromOrganization", async (req, res) => {
  try {
    const orgId = parseInt(req.query.orgId);
    const professorId = parseInt(req.query.userId);

    const deleteRelation = await client.deleteProfessorsFromOrganization(
      orgId,
      professorId
    );
    if (deleteRelation) res.sendStatus(200);
    else res.sendStatus(503);
  } catch (error) {
    res.send(error);
  }
});

app.put("/api/addSectionToOrg", async (req, res) => {
  try {
    const orgId = parseInt(req.query.orgId);
    const professorId = parseInt(req.query.userId);
    const name = req.query.name;

    const section = await client.addSectionToOrg(orgId, professorId, name);
    if (section) res.send(section);
    else res.sendStatus(503);
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

app.get("/test", async (req, res) => {
  const test = await client.test();
  res.send(test);
});

app.get("/", function (req, res) {
  res.send("Get something");
});

app.listen(port, () => {
  console.log(`App listening at ${port} port`);
});
