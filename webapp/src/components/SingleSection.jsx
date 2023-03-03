import {
  Box,
  Button,
  Collapse,
  Dialog,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import LeftBar from "./LeftBar";
import TopBar from "./TopBar";
import classesLayout from "./Layout.module.scss";
import classes from "./SingleSection.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { useState } from "react";
import { useEffect } from "react";
import Papa from "papaparse";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CircularProgress from "@mui/material/CircularProgress";
import { isAdmin } from "./CheckIsAdmin";
import { AlertScreen, DialogScreen, UsersList } from "./SingleSection/methods";

const SingleSection = () => {
  //#region Declaration of variables
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const siteUrl = process.env.REACT_APP_REDIRECT_URL;
  const urlParams = useParams();
  const editedSectionId = urlParams.id;
  const siteName = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <PeopleAltIcon color="success" fontSize="large" sx={{ pr: 1 }} />
      <Typography variant="h5">Edycja sekcji</Typography>
    </Box>
  );
  const [section, setSection] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [dialog, setDialog] = useState(0);
  const [addStudentsLink, setAddStudentsLink] = useState("");
  const [studentsInQueue, setStudentsInQueue] = useState([]);
  const [deleteStudentFromLink, setDeleteStudentFromLink] = useState({});
  const [studentsFromCSV, setStudenstFromCSV] = useState([]);
  const [isAllTeachers, setIsAllTeachers] = useState(false);
  const [isAllStudents, setIsAllStudents] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [filterTeachers, setFilterTeachers] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [issueText, setIssueText] = useState("");
  const [alert, setAlert] = useState(0);
  const [templateRepositoryName, setTemplateRepositoryName] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectedStudents, setRejectedStudents] = useState([]);
  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();
  //#endregion

  //#region Management of a section
  const getSection = async () => {
    const response = await fetch(
      `${serverSite}/api/getSection?sectionId=${editedSectionId}&userId=${localStorage.getItem(
        "userId"
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      response.json().then((body) => {
        setSection({
          id: body[0][0].id,
          name: body[0][0].name,
          organizationId: body[0][0].organization.id,
          organization: body[0][0].organization.name,
          organizationGitHub: body[0][0].organization.githubName,
        });
        const teachersList = [];
        const studentsList = [];

        body[0][0].sectionsToUsers.length > 0 &&
          body[0][0].sectionsToUsers.forEach((teacher) => {
            teachersList.push({
              id: teacher.user.id,
              name: teacher.user.name,
              surname: teacher.user.surname,
              githubLogin: teacher.user.githubLogin,
              studentEmail: teacher.user.studentEmail,
              isSelected: false,
            });
          });

        body[1].students.length > 0 &&
          body[1].students.forEach((student) => {
            const repositories = [];

            student.repositoriesToUsers.forEach((repository) => {
              repositories.push({ link: repository.repository.link });
            });

            studentsList.push({
              id: student.id,
              name: student.name,
              surname: student.surname,
              githubLogin: student.githubLogin,
              studentEmail: student.studentEmail,
              isSelected: false,
              repositories: repositories,
            });
          });

        setTeachers(teachersList);
        setStudents(studentsList);
      });
    }
  };

  const deleteSection = async () => {
    setDialog(0);
    setLoading(true);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");
    const users = students.map((student) => student.id + "-" + section.name);

    const response = await fetch(`${serverSite}/api/deleteSection`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sectionId: section.id,
        sectionName: section.name,
        userId: userId,
        users: users,
        accessToken: token,
        org: section.organizationGitHub,
      }),
    });
    if (response.status === 200)
      navigate(`/organization/${section.organizationId}`);
    else alert("Coś tam, coś tam");
  };
  //#endregion

  //#region Management of teachers
  const getAvailableTeachers = async (filter = filterTeachers) => {
    const response = await fetch(
      `${serverSite}/api/getAvailableTeachersForSection?sectionId=${section.id}&filter=${filter}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const body = await response.json();

      const newAvailableTeachers =
        body.length > 0
          ? body.map((teacher) => ({ ...teacher, isSelected: false }))
          : [];

      setAvailableTeachers(newAvailableTeachers);
    }
  };

  const addSelectedTeachersToSection = async () => {
    setDialog(0);

    const selectedTeachers = availableTeachers
      .filter((teacher) => teacher.isSelected)
      .map((teacher) => teacher.id);

    const newTeachers = availableTeachers.filter(
      (teacher) => teacher.isSelected
    );

    if (selectedTeachers) {
      const response = await fetch(`${serverSite}/api/addTeachersToSection`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId: section.id,
          teachersIds: selectedTeachers,
        }),
      });

      if (response.status === 201) {
        setTeachers((oldTeachersList) => [...oldTeachersList, ...newTeachers]);
      }
    }
  };

  const deleteSelectedTeachers = async () => {
    const deletedTeachers = teachers
      .filter((teacher) => teacher.isSelected)
      .map((teacher) => teacher.id);
    const newTeachersList = teachers.filter((teacher) => !teacher.isSelected);

    const response = await fetch(
      `${serverSite}/api/deleteTeachersFromSection`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId: section.id,
          userId: deletedTeachers,
        }),
      }
    );

    if (response.status === 200) {
      setDialog(0);
      setTeachers(newTeachersList);
    }
  };
  //#endregion

  //#region Management of students
  const addStudentsToSection = async () => {
    const studentsToAdd = studentsInQueue.map((student) => ({
      id: student.id,
      githubLogin: student.githubLogin,
    }));

    const response = await fetch(`${serverSite}/api/addStudentsToSection`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        users: studentsToAdd,
        sectionId: section.id,
        token: localStorage.getItem("accessToken"),
        sectionName: section.name,
        orgName: section.organizationGitHub,
        templateName: templateRepositoryName,
      }),
    });

    if (response.status === 200) {
      setDialog(0);
      setStudents((oldStudents) => [...oldStudents, ...studentsInQueue]);
    }
  };

  const addStudentsFromCSV = async () => {
    const requestBody = {
      users: studentsFromCSV,
      sectionId: section.id,
      sectionName: section.name,
      orgName: section.organizationGitHub,
      token: localStorage.getItem("accessToken"),
      templateName: templateRepositoryName,
    };
    setDialog(0);
    setLoading(true);
    const response = await fetch(`${serverSite}/api/addStudentsFromCSV`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {
      getSection();
      const body = await response.json();
      if (body.length) {
        setRejectedStudents(body);
        setDialog(9);
      } else setAlert(3);
    }
    setLoading(false);
  };

  const getStudentsInQueue = async () => {
    const response = await fetch(
      `${serverSite}/api/getStudentsInQueue?sectionId=${editedSectionId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200)
      response.json().then((body) => setStudentsInQueue(body));
  };

  const deleteStudentFromQueue = async () => {
    const response = await fetch(`${serverSite}/api/deleteStudentFromQueue`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: deleteStudentFromLink.id,
        urlCode: deleteStudentFromLink.urlCodesToUsers[0].urlCode.id,
      }),
    });

    if (response.status === 200)
      setStudentsInQueue((oldList) =>
        oldList.filter((student) => student.id !== deleteStudentFromLink.id)
      );

    setDialog(7);
  };

  const handleCsvFile = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      encoding: "windows-1250",
      complete: (results) => {
        setStudenstFromCSV(results.data);
      },
    });
  };

  const generateCode = async () => {
    const userId = localStorage.getItem("userId");
    const response = await fetch(
      `${serverSite}/api/generateCode?userId=${userId}&sectionId=${section.id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const body = await response.json();
      setAddStudentsLink(`${siteUrl}section/form/${body}`);
    }
  };

  const sendIssue = async () => {
    if (issueTitle.length < 1) setAlert(1);
    else {
      let repositories = [];

      students.forEach((student) => {
        if (student.isSelected)
          repositories.push(`${student.id}-${section.name}-repo`);
      });

      const response = await fetch(`${serverSite}/github/createIssue`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("accessToken"),
          owner: section.organizationGitHub,
          repoName: repositories,
          issueTitle: issueTitle,
          issueText: issueText,
        }),
      });

      if (response.status === 200) {
        setIssueTitle("");
        setIssueText("");
        setAlert(0);
        setDialog(0);
      } else {
        setAlert(2);
      }
    }
  };
  //#endregion

  //#region Management of selecting users
  const selectItem = (list, githubLogin, setList) => {
    const newList = list.map((item) => {
      if (item.githubLogin === githubLogin) {
        return { ...item, isSelected: !item.isSelected };
      }
      return item;
    });

    setList(newList);
  };

  const setSelectedTeachers = (githubLogin) =>
    selectItem(teachers, githubLogin, setTeachers);

  const setSelectedStudents = (githubLogin) =>
    selectItem(students, githubLogin, setStudents);

  const setSelectedAvailableTeachers = (githubLogin) =>
    selectItem(availableTeachers, githubLogin, setAvailableTeachers);

  const selectAllTeachers = () => {
    const newTeachersList = teachers.map((teacher) => ({
      ...teacher,
      isSelected: !isAllTeachers,
    }));

    setTeachers(newTeachersList);
    setIsAllTeachers((oldValue) => !oldValue);
  };

  const selectAllStudents = () => {
    const newStudentsList = students.map((section) => ({
      ...section,
      isSelected: !isAllStudents,
    }));

    setStudents(newStudentsList);
    setIsAllStudents((oldValue) => !oldValue);
  };
  //#endregion

  //#region Management of dialogs
  const handleCloseDialog = () => {
    if (dialog === 6) setAddStudentsLink("");
    setDialog(0);
  };

  const handleOpenDeleteDialog = () => {
    let selectedTeachers = 0;
    teachers.forEach(
      (teacher) => teacher.isSelected === true && selectedTeachers++
    );
    if (selectedTeachers === 0) return;
    setDialog(2);
  };
  //#endregion

  const checkIsAdmin = async () => {
    const adminTmp = await isAdmin(localStorage.getItem("userId"));
    setAdmin(adminTmp);
  };

  useEffect(() => {
    checkIsAdmin();
    getSection();
  }, []);

  return (
    <Box className={classesLayout.mainContainer}>
      <Box className={classesLayout.topBar}>
        <TopBar siteName={siteName} />
      </Box>
      <Divider />
      <Box className={classesLayout.contentContainer}>
        <Box className={classesLayout.leftBar}>
          <LeftBar chosenItem={"organizations"} />
        </Box>
        <Box className={classesLayout.content}>
          <Box className={classes.topContainer}>
            <Box className={classes.topRightContainer}>
              {admin && (
                <Button
                  variant="contained"
                  size="large"
                  color="error"
                  onClick={() => setDialog(3)}
                >
                  USUŃ
                </Button>
              )}
            </Box>
          </Box>
          <Box className={classes.contentContainer}>
            <Box className={classes.content}>
              <List
                dense
                sx={{ maxWidth: "30vw" }}
                className={classes.contentList}
              >
                <ListItem>
                  <ListItemButton role={undefined} dense>
                    <ListItemText
                      primary={
                        <center>
                          <Typography variant="h5">Informacje</Typography>
                        </center>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={<Typography variant="h6">Nazwa sekcji</Typography>}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="h7">{section.name}</Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={<Typography variant="h6">Organizacja</Typography>}
                  />
                </ListItem>
                <ListItem
                  secondaryAction={
                    <IconButton edge="right" aria-label="sectionPage">
                      <FindInPageIcon
                        onClick={() =>
                          navigate(`/organization/${section.organizationId}`)
                        }
                      />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="h7">
                        {section.organization}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem sx={{ mt: 1 }}>
                  <ListItemButton
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "white",
                      borderRadius: 2,
                      "&:hover": { backgroundColor: "#1976d2" },
                    }}
                    onClick={() => {
                      getStudentsInQueue();
                      setDialog(7);
                    }}
                  >
                    <ListItemText
                      primary={
                        <center>
                          <Typography variant="h6">
                            Lista oczekujących
                          </Typography>
                        </center>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
            <Box className={classes.content}>
              <List
                dense
                sx={{ maxWidth: "30vw" }}
                className={classes.contentList}
              >
                <ListItem>
                  <ListItemButton
                    role={undefined}
                    onClick={() => selectAllTeachers()}
                    dense
                  >
                    <ListItemText
                      primary={
                        <center>
                          <Typography variant="h5">Prowadzący</Typography>
                        </center>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </List>
              <List
                dense
                sx={{ maxWidth: "30vw" }}
                className={classes.contentList}
              >
                <UsersList
                  users={teachers}
                  setSelectedUsers={setSelectedTeachers}
                />
              </List>
              {admin && (
                <Box className={classes.addButton}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      getAvailableTeachers();
                      setDialog(1);
                    }}
                  >
                    Dodaj
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    color="error"
                    onClick={handleOpenDeleteDialog}
                  >
                    USUŃ
                  </Button>
                </Box>
              )}
            </Box>
            <Box className={classes.content}>
              <List
                dense
                sx={{ maxWidth: "30vw" }}
                className={classes.contentList}
              >
                <ListItem>
                  <ListItemButton
                    role={undefined}
                    onClick={() => selectAllStudents()}
                    dense
                  >
                    <ListItemText
                      primary={
                        <center>
                          <Typography variant="h5">Studenci</Typography>
                        </center>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </List>
              <List
                dense
                sx={{ maxWidth: "30vw" }}
                className={classes.contentList}
              >
                <UsersList
                  users={students}
                  setSelectedUsers={setSelectedStudents}
                  isStudent={true}
                />
              </List>
              <Box className={classes.addButton}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setDialog(6)}
                >
                  Dodaj
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    if (students.some((student) => student.isSelected))
                      setDialog(4);
                  }}
                >
                  ISSUE
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={dialog}
        onClose={handleCloseDialog}
        PaperProps={{
          style: {
            backgroundColor: "#d9d9d9",
            maxWidth: 1000,
            minWidth: 500,
          },
        }}
      >
        <DialogScreen
          dialog={dialog}
          filterTeachers={filterTeachers}
          setFilterTeachers={setFilterTeachers}
          getAvailableTeachers={getAvailableTeachers}
          availableTeachers={availableTeachers}
          setSelectedAvailableTeachers={setSelectedAvailableTeachers}
          handleCloseDialog={handleCloseDialog}
          addSelectedTeachersToSection={addSelectedTeachersToSection}
          deleteSelectedTeachers={deleteSelectedTeachers}
          deleteSection={deleteSection}
          issueTitle={issueTitle}
          setIssueTitle={setIssueTitle}
          issueText={issueText}
          setIssueText={setIssueText}
          setDialog={setDialog}
          sendIssue={sendIssue}
          useTemplate={useTemplate}
          setUseTemplate={setUseTemplate}
          setTemplateRepositoryName={setTemplateRepositoryName}
          templateRepositoryName={templateRepositoryName}
          handleCsvFile={handleCsvFile}
          addStudentsFromCSV={addStudentsFromCSV}
          addStudentsLink={addStudentsLink}
          generateCode={generateCode}
          studentsInQueue={studentsInQueue}
          setDeleteStudentFromLink={setDeleteStudentFromLink}
          addStudentsToSection={addStudentsToSection}
          deleteStudentFromLink={deleteStudentFromLink}
          deleteStudentFromQueue={deleteStudentFromQueue}
          rejectedStudents={rejectedStudents}
        />
        <Collapse in={alert}>
          <AlertScreen alert={alert} setAlert={setAlert} />
        </Collapse>
      </Dialog>
      <Collapse in={loading}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress color="warning" />
        </Box>
      </Collapse>
    </Box>
  );
};

export default SingleSection;
