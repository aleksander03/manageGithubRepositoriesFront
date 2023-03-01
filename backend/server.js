import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import request from "request";
import { Octokit } from "@octokit/rest";
import * as client from "./dbOps";
import simpleGit from "simple-git";
import fs from "fs-extra";
import archiver from "archiver";

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get("/api/isAdmin", async (req, res) => {
  const userId = req.query.userId;

  const isAdmin = await client.isAdmin(userId)
  console.log(isAdmin)

  if(isAdmin) res.sendStatus(200);
  else res.sendStatus(418);
})

app.get("/api/login", async (req, res) => {
  try {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const clientSecretId = process.env.REACT_APP_CLIENT_SECRET;
    const clientCode = req.query.code;

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
    let user = await client.findUserBygithubLogin(response.data.login);

    if (user === null) {
      let name;
      if (response.data.name) {
        name = response.data.name.split(" ");
      } else {
        name = ["Undefined", "Undefined"];
      }
      //sprawdzanie czy uuid się nie powtarza
      for (let i = 0; i < 10; i++) {
        user = await client.createNewUserFromGit(
          response.data.login,
          name[0],
          name[1]
        );

        if (user) break;
      }
    }

    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/getUserByLogin", async (req, res) => {
  try {
    const githubLogin = req.query.githubLogin;
    const userId = req.query.userId;

    const user = await client.findUserBygithubLogin(githubLogin);
    const orgs = await client.getUsersOrgs(userId);

    res.send([user, orgs]);
  } catch (error) {
    console.error(error);
  }
});

app.put("/api/changeUserData", async (req, res) => {
  try {
    const userData = req.body.userData;

    const user = await client.changeUserData(userData);

    if (user) res.sendStatus(200);
    else res.sendStatus(418);
  } catch (error) {
    console.error(error);
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
    const userId = req.query.userId;
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

app.get("/api/getOrganization", async (req, res) => {
  try {
    const id = parseInt(req.query.id);
    const userId = req.query.userId;

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
    const userId = req.query.userId;

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

app.post("/api/addProfessorsToOrganization", async (req, res) => {
  try {
    const orgId = parseInt(req.body.orgId);
    const professorsIds = req.body.professorsIds;

    const addRelation = await client.addProfessorsToOrganization(
      orgId,
      professorsIds
    );

    if (addRelation) res.sendStatus(201);
    else res.sendStatus(503);

  } catch (error) {
    res.send(error);
  }
});

app.delete("/api/deleteProfessorsFromOrganization", async (req, res) => {
  try {
    const orgId = parseInt(req.body.orgId);
    const professorId = req.body.userId;

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

app.get("/api/getSection", async (req, res) => {
  try {
    const sectionId = parseInt(req.query.sectionId);
    const userId = req.query.userId;

    const isAdmin = await client.isAdmin(userId);

    const section = await client.getSection(sectionId, userId, isAdmin);
    if (section) res.send(section);
    else res.sendStatus(404);
  } catch (error) {
    console.error(error);
  }
});

app.put("/api/addSectionToOrg", async (req, res) => {
  try {
    const orgId = parseInt(req.query.orgId);
    const professorId = req.query.userId;
    const name = req.query.name;

    const section = await client.addSectionToOrg(orgId, professorId, name);
    if (section) res.send(section);
    else res.sendStatus(503);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/generateCode", async (req, res) => {
  try {
    const userId = req.query.userId;
    const sectionId = parseInt(req.query.sectionId);

    const code = await client.generateCode(userId, sectionId);
    if (code) res.send(JSON.stringify(code));
    else res.sendStatus(403);
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/checkIsCodeExpired", async (req, res) => {
  try {
    const code = req.query.code;

    const isCodeExpired = await client.checkIsCodeExpired(code);
    if (isCodeExpired)
      if (isCodeExpired.expireDate > new Date()) res.sendStatus(200);
      else res.sendStatus(418);
  } catch (error) {
    console.error(error);
  }
});

app.put("/api/addStudentFromLink", async (req, res) => {
  try {
    const name = req.query.name;
    const surname = req.query.surname;
    const githubLogin = req.query.githubLogin;
    const studentEmail = req.query.studentEmail;
    const urlCode = req.query.urlCode;
    const octokit = new Octokit();
    let user;

    try {
      await octokit.users.getByUsername({ username: githubLogin });

      const isUserExist = await client.checkIsUserExist(
        githubLogin,
        studentEmail
      );

      if (isUserExist) {
        user = await client.addStudentToUrlCode(
          githubLogin,
          urlCode,
          studentEmail
        );
      } else {
        //sprawdzanie czy id nie jest zajęte
        for (let i = 0; i < 10; i++) {
          user = await client.addStudentFromLink(
            name,
            surname,
            githubLogin,
            studentEmail,
            urlCode
          );

          if (user) break;
        }
      }

      if (user) res.sendStatus(200);
      else res.sendStatus(418);
    } catch (e) {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/getStudentsInQueue", async (req, res) => {
  try {
    const sectionId = parseInt(req.query.sectionId);

    const students = await client.getStudentsInQueue(sectionId);

    if (students) res.send(students);
    else res.sendStatus(404);
  } catch (error) {
    console.error(error);
  }
});

app.delete("/api/deleteStudentFromQueue", async (req, res) => {
  try {
    const userId = req.body.userId;
    const urlCode = req.body.urlCode;

    await client.deleteStudentFromQueue(userId, urlCode);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
  }
});

app.post("/api/addStudentsToSection", async (req, res) => {
  try {
    const users = req.body.users;
    const sectionId = req.body.sectionId;
    const sectionName = req.body.sectionName;
    const token = req.body.token;
    const orgName = req.body.orgName;
    const template_name = req.body.templateName;
    const octokit = new Octokit({ auth: token });

    users.map(async (student) => {
      try {
        let repo;

        if (template_name === "") {
          const { data: repoTmp } = await octokit.repos.createInOrg({
            org: orgName,
            name: student.id + "-" + sectionName + "-repo",
            private: true,
            auto_init: true,
          });

          repo = repoTmp;
        } else {
          const { data: repoTmp } = await octokit.repos.createUsingTemplate({
            template_owner: orgName,
            template_repo: "template",
            name: student.id + "-" + sectionName + "-repo",
            private: true,
            owner: orgName,
          });

          repo = repoTmp;
        }

        const { data: team } = await octokit.teams.create({
          org: orgName,
          name: student.id + "-" + sectionName,
          privacy: "closed",
          permission: "push",
          repo_names: [`${orgName}/${repo.name}`],
        });

        await client.createRepositoryForStudent(
          student.id,
          repo.html_url,
          sectionId
        );

        await octokit.teams.addOrUpdateMembershipForUserInOrg({
          team_slug: team.slug,
          org: orgName,
          username: student.githubLogin,
        });
      } catch (e) {
        console.error(e);
      }
    });

    const students = await client.addStudentsToSection(users, sectionId);
    if (students) res.sendStatus(200);
    else res.sendStatus(418);
  } catch (error) {
    console.error(error);
  }
});

app.post("/api/addStudentsFromCSV", async (req, res) => {
  const studentsList = req.body.users;
  const sectionId = parseInt(req.body.sectionId);
  const token = req.body.token;
  const orgName = req.body.orgName;
  const sectionName = req.body.sectionName;
  const template_name = req.body.templateName;
  const octokit = new Octokit({ auth: token });

  const notAcceptedUsers = [];

  const promises = studentsList.map(async (student) => {
    if (student.name !== "") {
      try {
        let user;

        await octokit.users.getByUsername({ username: student.githubLogin });

        const isStudentExist = await client.checkIsUserExist(
          student.githubLogin,
          student.studentEmail
        );

        if (!isStudentExist) {
          //sprawdzanie czy id nie jest zajęte
          for (let i = 0; i < 10; i++) {
            user = await client.addStudentFromCSV(student, sectionId);

            if (user) break;
          }
        } else {
          user = await client.addStudentToSectionFromCSV(student, sectionId);
          if (!user) throw "User exist in section!";
        }

        if (user.id) {
          let repo;

          if (template_name === "") {
            const { data: repoTmp } = await octokit.repos.createInOrg({
              org: orgName,
              name: user.id + "-" + sectionName + "-repo",
              private: true,
              auto_init: true,
            });

            repo = repoTmp;
          } else {
            const { data: repoTmp } = await octokit.repos.createUsingTemplate({
              template_owner: orgName,
              template_repo: template_name,
              name: user.id + "-" + sectionName + "-repo",
              private: true,
              owner: orgName,
            });

            repo = repoTmp;
          }

          const { data: team } = await octokit.teams.create({
            org: orgName,
            name: user.id + "-" + sectionName,
            privacy: "closed",
            permission: "push",
            repo_names: [`${orgName}/${repo.name}`],
          });

          await client.createRepositoryForStudent(
            user.id,
            repo.html_url,
            sectionId
          );

          await octokit.teams.addOrUpdateMembershipForUserInOrg({
            team_slug: team.slug,
            org: orgName,
            username: user.githubLogin,
          });
        }
      } catch (e) {
        if (e.status !== 422 && e !== "User exist in section!") {
          await client.deleteUserToSectionRelation(student.githubLogin);
          notAcceptedUsers.push(student);
        }
        console.error(e);
      }
    }
  });

  if (promises) await Promise.all(promises);
  res.send(notAcceptedUsers);
});

app.get("/api/getAvailableProfessorsForSection", async (req, res) => {
  try {
    const sectionId = parseInt(req.query.sectionId);
    const filter = req.query.filter;

    const professors = await client.getAvailableProfessorsForSection(
      sectionId,
      filter
    );
    if (professors) res.send(professors);
    else res.sendStatus(204);
  } catch (error) {
    res.send(418);
  }
});

app.post("/api/addProfessorsToSection", async (req, res) => {
  try {
    const sectionId = parseInt(req.body.sectionId);
    const professorsIds = req.body.professorsIds;

    const addRelation = await client.addProfessorsToSection(
      sectionId,
      professorsIds
    );

    if (addRelation) res.sendStatus(201);
    else res.sendStatus(503);

  } catch (error) {
    res.send(error);
  }
});

app.delete("/api/deleteProfessorsFromSection", async (req, res) => {
  try {
    const sectionId = parseInt(req.body.sectionId);
    const professorId = req.body.userId;

    const deleteRelation = await client.deleteUsersFromSection(
      sectionId,
      professorId
    );
    if (deleteRelation) res.sendStatus(200);
    else res.sendStatus(503);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/api/deleteSection", async (req, res) => {
  try {
    const sectionId = parseInt(req.body.sectionId);
    const sectionName = req.body.sectionName;
    const userId = req.body.userId;
    const users = req.body.users;
    const token = req.body.accessToken;
    const org = req.body.org;
    const octokit = new Octokit({ auth: token });

    const notDeletedRepositories = [];

    const promises = users.map(async (user) => {
      try {
        await octokit.repos.delete({ owner: org, repo: user + "-repo" });
        await octokit.teams.deleteInOrg({
          org: org,
          team_slug: user,
        });
      } catch (error) {
        notDeletedRepositories.push(repository);
        console.error(error);
      }
    });

    const isAdmin = await client.isAdmin(userId);
    if (isAdmin) {
      if (promises) await Promise.all(promises);

      if (!notDeletedRepositories) {
        res.status(401);
        res.send(notDeletedRepositories);
      }

      const section = await client.deleteSection(sectionId);
      if (section) res.sendStatus(200);
      else res.sendStatus(418);
    } else res.sendStatus(401);
  } catch (error) {
    console.error(error);
  }
});

app.post("/github/archive", async (req, res) => {
  try {
    const orgId = parseInt(req.body.orgId);
    const orgName = req.body.orgName;

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const hour = currentDate.getHours();
    const minute = currentDate.getMinutes();
    const formatedDate = `${year}-${month}-${day}-${hour}-${minute}`;

    const git = simpleGit();

    const sections = await client.getOrgForArchive(orgId);
    const notDeletedRepositories = [];

    const promises = sections.map(async (repository) => {
      try {
        const folderName = `${orgName}_${formatedDate}/${
          repository.sectionName
        }/${repository.name + "_" + repository.surname}`;

        await git.clone(repository.repository, `./Archiwum/${folderName}`);
        const output = fs.createWriteStream(`./Archiwum/${folderName}.zip`);
        const archive = archiver("zip", { zlib: { level: 9 } });
        output.on("close", async () => {
          await fs.rm(
            `./Archiwum/${folderName}`,
            { recursive: true },
            (err) => {
              if (err) console.error(err);
            }
          );
        });
        archive.pipe(output);
        archive.directory(`./Archiwum/${folderName}`, "");
        archive.finalize();
      } catch (err) {
        notDeletedRepositories.push(repository);
      }
    });

    await Promise.all(promises);
    res.send(notDeletedRepositories);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Wystąpił błąd podczas tworzenia archiwum" });
  }
});

app.post("/github/createIssue", (req, res) => {
  try {
    const token = req.body.token;
    const owner = req.body.owner;
    const repoName = req.body.repoName;
    const issueTitle = req.body.issueTitle;
    const issueText = req.body.issueText;

    const octokit = new Octokit({ auth: token });

    repoName.forEach(async (repo) => {
      try {
        const result = await octokit.issues.create({
          owner: owner,
          repo: repo,
          title: issueTitle,
          body: issueText,
        });
      } catch (err) {
        console.error(err);
      }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/getTeachers", async (req, res) => {
  try {
    const orderBy = req.query.orderBy;
    const order = req.query.order;
    const filter = req.query.filter;
    const perPage = parseInt(req.query.perPage);
    const page = parseInt(req.query.page);
    const toSkip = perPage * page;

    const teachers = await client.getTeachers(
      orderBy,
      order,
      filter,
      perPage,
      toSkip
    );

    res.send(teachers);
  } catch (error) {
    console.error(error);
  }
});

app.put("/api/giveRole", (req, res) => {
  try {
    const role = req.query.role;
    const userId = req.query.userId;

    client.giveRole(role, userId);

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
  }
});

app.delete("/api/deleteRole", (req, res) => {
  try {
    const role = req.query.role;
    const userId = req.query.userId;

    client.deleteRole(role, userId);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
  }
});

app.delete("/api/deleteUser", async (req, res) => {
  try {
    const userId = req.body.userId;
    const githubLogin = req.body.githubLogin;
    const token = req.body.token;

    const octokit = new Octokit({ auth: token });
    const orgs = await client.getUsersOrgs(userId);

    orgs.forEach(async (org) => {
      try {
        await octokit.orgs.removeMember({ org: org, username: githubLogin });
      } catch (err) {
        console.error(err);
      }
    });

    await client.deleteUser(userId);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/getStudents", async (req, res) => {
  try {
    const orderBy = req.query.orderBy;
    const order = req.query.order;
    const filter = req.query.filter;
    const userId = req.query.userId;
    const perPage = parseInt(req.query.perPage);
    const page = parseInt(req.query.page);
    const toSkip = perPage * page;
    const isAdmin = await client.isAdmin(userId);
    const sectionsIds = isAdmin ? [] : await client.sectionsIdsForUser(userId);

    const students = await client.getStudents(
      orderBy,
      order,
      filter,
      perPage,
      toSkip,
      isAdmin,
      sectionsIds
    );

    res.send(students);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/getUsersRepositories", async (req, res) => {
  try {
    const userId = req.query.userId;

    const repositories = await client.getUsersRepositories(userId);

    res.send(repositories);
  } catch (error) {
    console.error(error);
  }
});

app.put("/api/changeOrgLocalName", async (req, res) => {
  try {
    const orgId = parseInt(req.query.orgId);
    const newOrgName = req.query.newOrgName;

    await client.changeOrgLocalName(orgId, newOrgName);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/getArchive", (req, res) => {
  try {
    const directory = req.query.directory;

    fs.readdir(`./${directory}`, (err, files) => {
      if (err) res.sendStatus(418);
      else res.send(files);
    });
  } catch (error) {
    console.error(error);
  }
});

app.delete("/api/deleteArchive", (req, res) => {
  try {
    const filePath = req.query.filePath;

    fs.remove(`./${filePath}`)
      .then(() => res.sendStatus(200))
      .catch((err) => res.sendStatus(418));
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/downloadFile", (req, res) => {
  try {
    const directory = req.query.directory;
    const fileName = req.query.fileName;
    console.log(`.${directory}/${fileName}`);

    res.download(`.${directory}/${fileName}`);
  } catch (error) {
    console.error(error);
  }
});

app.get("/", function (req, res) {
  res.send("Get something");
});

app.listen(port, () => {
  console.log(`App listening at ${port} port`);
});
