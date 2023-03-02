import {
  Alert,
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
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import LeftBar from "./LeftBar";
import TopBar from "./TopBar";
import classesLayout from "./Layout.module.scss";
import classes from "./SingleOrganization.module.scss";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import { isAdmin } from "./CheckIsAdmin";
import * as methods from "./SingleOrganization/methods";

const SingleOrganization = () => {
  //#region Declaration of variables
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const urlParams = useParams();
  const editedOrgId = urlParams.id;
  const siteName = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <GroupWorkIcon color="warning" fontSize="large" sx={{ pr: 1 }} />
      <Typography variant="h5">Edycja organizacji</Typography>
    </Box>
  );
  const [organization, setOrganization] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [orgName, setOrgName] = useState(organization.name);
  const [isAllTeachers, setIsAllTeachers] = useState(false);
  const [filterTeachers, setFilterTeachers] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [notArchivedStudents, setNotArchivedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(0);
  const [dialog, setDialog] = useState(0);
  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();
  //#endregion

  //#region Management of an organization
  const getOrganization = async () => {
    const response = await fetch(
      `${serverSite}/api/getOrganization?id=${editedOrgId}&userId=${localStorage.getItem(
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
        const org = {
          name: body[0][0].name,
          githubName: body[0][0].githubName,
          id: body[0][0].id,
          link: body[0][0].link,
        };

        const sections =
          body[0][0].sections.length > 0
            ? body[0][0].sections.map((row) => {
                return {
                  id: row.id,
                  name: row.name,
                  isSelected: false,
                };
              })
            : {};

        const teachers =
          body[1].length > 0
            ? body[1].map((row) => {
                return {
                  id: row.id,
                  name: row.name,
                  surname: row.surname,
                  githubLogin: row.githubLogin,
                  studentEmail: row.studentEmail,
                  isSelected: false,
                };
              })
            : {};
        setOrganization(org);
        setSections(sections);
        setTeachers(teachers);
        setOrgName(org.name);
      });
    } else {
      setAlert(2);
    }
  };

  const archiveOrganization = async () => {
    setLoading(true);
    const response = await fetch(
      `${serverSite}/github/archive?orgId=${organization.id}&orgName=${orgName}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId: organization.id,
          orgName: orgName,
        }),
      }
    );

    const body = await response.json();
    setLoading(false);
    if (body.length > 0) {
      setNotArchivedStudents(body);
      setDialog(5);
    } else {
      setAlert(1);
    }
  };

  const deleteOrganization = async () => {
    const response = await fetch(`${serverSite}/api/deleteOrganization`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orgId: editedOrgId,
        userId: localStorage.getItem("userId"),
        token: localStorage.getItem("accessToken"),
      }),
    });

    if (response.status === 200) navigate("/organizations");
  };

  const changeOrgLocalName = async () => {
    const response = await fetch(
      `${serverSite}/api/changeOrgLocalName?orgId=${organization.id}&newOrgName=${orgName}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) getOrganization();
  };

  const addSection = async () => {
    handleCloseDialog();
    await fetch(
      `${serverSite}/api/addSectionToOrg?orgId=${editedOrgId}&userId=${localStorage.getItem(
        "userId"
      )}&name=${newSectionName}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    getOrganization();
  };
  //#endregion

  //#region Management of teachers
  const addSelectedTeachersToOrg = () => {
    setDialog(0);
    const selectedTeachers = [];
    const newTeachersTmp = [];

    availableTeachers.forEach((teacher) => {
      if (teacher.isSelected) {
        selectedTeachers.push(teacher.id);
        newTeachersTmp.push(teacher);
      }
    });

    if (selectedTeachers) {
      fetch(`${serverSite}/api/addTeachersToOrganization`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId: editedOrgId,
          teachersIds: selectedTeachers,
        }),
      });

      if (teachers.length > 0) {
        setTeachers((oldTeachers) => [
          ...oldTeachers,
          ...newTeachersTmp,
        ]);
      } else setTeachers(newTeachersTmp);
    }
  };

  const deleteSelectedTeachers = () => {
    const deletedTeachers = [];
    const newTeachersList = [];

    teachers.forEach((teacher) => {
      if (teacher.isSelected) {
        deletedTeachers.push(teacher.id);
      } else {
        newTeachersList.push(teacher);
      }
    });

    deletedTeachers.length > 0 &&
      fetch(`${serverSite}/api/deleteTeachersFromOrganization`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId: editedOrgId,
          userId: deletedTeachers,
        }),
      });

    setDialog(0);
    setIsAllTeachers(false);
    setTeachers(newTeachersList);
  };

  const getAvailableTeachers = async (filter) => {
    const filterTmp = filter !== undefined ? filter : filterTeachers;
    const response = await fetch(
      `${serverSite}/api/getAvailableTeachers?orgId=${editedOrgId}&filter=${filterTmp}`,
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
        const newAvailableTeachers =
          body.length > 0
            ? body.map((teacher) => {
                return { ...teacher, isSelected: false };
              })
            : [];
        setAvailableTeachers(newAvailableTeachers);
      });
    } else setAlert(2);
  };

  const setSelectedTeachers = (githubLogin) => {
    const newTeachersList = teachers.map((teacher) => {
      if (teacher.githubLogin === githubLogin) {
        return { ...teacher, isSelected: !teacher.isSelected };
      }
      return teacher;
    });

    setTeachers(newTeachersList);
  };

  const setSelectedAvailableTeachers = (githubLogin) => {
    const newTeachersList = availableTeachers.map((teacher) => {
      if (teacher.githubLogin === githubLogin) {
        return { ...teacher, isSelected: !teacher.isSelected };
      }
      return teacher;
    });

    setAvailableTeachers(newTeachersList);
  };

  const selectAllTeachers = () => {
    const newTeachersList = teachers.map((teacher) => {
      return { ...teacher, isSelected: !isAllTeachers };
    });

    setTeachers(newTeachersList);
    setIsAllTeachers((oldValue) => !oldValue);
  };
  //#endregion

  //#region Handle dialog screen
  const handleOpenDialog = (id) => {
    if (id === 1) {
      getAvailableTeachers();
    } else if (id === 2) {
      let selectedTeachers = 0;
      teachers.forEach(
        (teacher) => teacher.isSelected === true && selectedTeachers++
      );
      if (selectedTeachers === 0) {
        setAlert(3);
        return;
      }
    }
    setDialog(id);
  };

  const handleCloseDialog = () => {
    if (dialog === 1) {
      setFilterTeachers("");
    } else if (dialog === 3) {
      setNewSectionName("");
    }
    setDialog(0);
  };
  //#endregion

  const checkIsAdmin = async () => {
    const adminTmp = await isAdmin(localStorage.getItem("userId"));
    setAdmin(adminTmp);
  };

  useEffect(() => {
    checkIsAdmin();
    getOrganization();
  }, []);

  //#region Rendered part
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
          <Box className={classes.mainContainer}>
            <Box className={classes.topContainer}>
              <Box>
                {admin ? (
                  <>
                    <TextField
                      label="Nazwa organizacji"
                      type="search"
                      variant="filled"
                      size="small"
                      InputProps={{ className: classes.topLeftTextFieldInput }}
                      sx={{ pr: "10px" }}
                      value={orgName}
                      onChange={(event) => setOrgName(event.target.value)}
                      defaultValue=" "
                    />
                    <Button
                      variant="contained"
                      size="large"
                      onClick={changeOrgLocalName}
                    >
                      ZMIEŃ
                    </Button>
                  </>
                ) : (
                  <>
                    <TextField
                      label="Nazwa organizacji"
                      type="search"
                      variant="filled"
                      size="small"
                      InputProps={{ className: classes.topLeftTextFieldInput }}
                      sx={{ pr: "10px" }}
                      value={orgName}
                      disabled
                      defaultValue=" "
                    />
                  </>
                )}
              </Box>
              <Box className={classes.topRightContainer}>
                {admin && (
                  <>
                    <Box className={classes.topRightButton}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={archiveOrganization}
                      >
                        ARCHIWIZUJ
                      </Button>
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      color="error"
                      onClick={() => handleOpenDialog(4)}
                    >
                      USUŃ
                    </Button>
                  </>
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
                </List>
                <List dense sx={{ maxWidth: "30vw" }}>
                  <ListItem>
                    <ListItemText
                      primary={<Typography variant="h6">Nazwa</Typography>}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="h7">
                          {organization.name}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="h6">Nazwa GitHub</Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="h7">
                          {organization.githubName}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={<Typography variant="h6">Link</Typography>}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="h7">
                          {organization.link}
                        </Typography>
                      }
                    />
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
                  <methods.TeachersList
                    teachers={teachers}
                    setSelectedTeachers={setSelectedTeachers}
                  />
                </List>
                {admin && (
                  <Box className={classes.addButton}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleOpenDialog(1)}
                    >
                      Dodaj
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      color="error"
                      onClick={() => handleOpenDialog(2)}
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
                    <ListItemButton role={undefined} dense>
                      <ListItemText
                        primary={
                          <center>
                            <Typography variant="h5">Sekcje</Typography>
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
                  <methods.SectionsList
                    sections={sections}
                    navigate={navigate}
                  />
                </List>
                {admin && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpenDialog(3)}
                    sx={{ width: "100%" }}
                  >
                    Dodaj
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={dialog}
        onClose={handleCloseDialog}
        PaperProps={{ style: { backgroundColor: "#d9d9d9" } }}
      >
        <methods.DialogScreen
          addSection={addSection}
          addSelectedTeachersToOrg={addSelectedTeachersToOrg}
          availableTeachers={availableTeachers}
          deleteOrganization={deleteOrganization}
          deleteSelectedTeachers={deleteSelectedTeachers}
          dialog={dialog}
          filterTeachers={filterTeachers}
          getAvailableTeachers={getAvailableTeachers}
          handleCloseDialog={handleCloseDialog}
          newSectionName={newSectionName}
          notArchivedStudents={notArchivedStudents}
          setFilterTeachers={setFilterTeachers}
          setNewSectionName={setNewSectionName}
          setSelectedAvailableTeachers={setSelectedAvailableTeachers}
        />
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
      <Collapse
        in={alert}
        sx={{ position: "absolute", width: "100%", bottom: 0 }}
      >
        {alert === 1 ? (
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="error"
                size="small"
                onClick={() => setAlert(0)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            severity="success"
          >
            Archiwizacja się powiodła! Możesz bezpiecznie wcisnąć przycisk USUŃ
            i usunąć dane z GitHub
          </Alert>
        ) : alert === 2 ? (
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="error"
                size="small"
                onClick={() => setAlert(0)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            severity="error"
          >
            Nie udało się pobrać danych!
          </Alert>
        ) : alert === 3 ? (
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="error"
                size="small"
                onClick={() => setAlert(0)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            severity="error"
          >
            Musisz zaznaczyć przynajmniej 1 prowadzącego!
          </Alert>
        ) : (
          <></>
        )}
      </Collapse>
    </Box>
  );
  //#endregion
};

export default SingleOrganization;
