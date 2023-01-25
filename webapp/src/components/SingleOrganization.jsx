import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { useEffect } from "react";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import SchoolIcon from "@mui/icons-material/School";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import { isAdmin } from "./CheckIsAdmin";

const SingleOrganization = () => {
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
  const [professors, setProfessors] = useState([]);
  const [sections, setSections] = useState([]);
  const [orgName, setOrgName] = useState(organization.name);
  const [isAllProfessors, setIsAllProfessors] = useState(false);
  const [filterProfessors, setFilterProfessors] = useState("");
  const [availableProfessors, setAvailableProfessors] = useState([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [notArchivedStudents, setNotArchivedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(0);
  const [dialog, setDialog] = useState(0);
  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();

  const professorsList =
    professors.length > 0 &&
    professors.map((professor) => {
      return (
        <ListItem key={professor.githubLogin}>
          <ListItemButton
            role={undefined}
            onClick={() => setSelectedProfessors(professor.githubLogin)}
            dense
          >
            <ListItemIcon>
              <SchoolIcon />
            </ListItemIcon>
            <ListItemText
              primary={`${professor.name} ${professor.surname}`}
              secondary={professor.studentEmail}
            />
            <Checkbox checked={professor.isSelected} />
          </ListItemButton>
        </ListItem>
      );
    });

  const sectionsList =
    sections.length > 0 ? (
      sections.map((section) => {
        return (
          <ListItem key={section.id}>
            <ListItemButton
              role={undefined}
              onClick={() => navigate(`/section/${section.id}`)}
              dense
            >
              <ListItemIcon>
                <FindInPageIcon />
              </ListItemIcon>
              <ListItemText primary={section.name} />
            </ListItemButton>
          </ListItem>
        );
      })
    ) : (
      <></>
    );

  const setSelectedProfessors = (githubLogin) => {
    const newProfessorsList = professors.map((professor) => {
      if (professor.githubLogin === githubLogin) {
        return { ...professor, isSelected: !professor.isSelected };
      }
      return professor;
    });
    setProfessors(newProfessorsList);
  };

  const selectAllProfessors = () => {
    const newProfessorsList = professors.map((professor) => {
      return { ...professor, isSelected: !isAllProfessors };
    });
    setProfessors(newProfessorsList);
    setIsAllProfessors((oldValue) => !oldValue);
  };

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

        const professors =
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
        setProfessors(professors);
        setOrgName(org.name);
      });
    } else {
      setAlert(2);
    }
  };

  const handleOpenDialog = (id) => {
    if (id === 1) {
      getAvailableProfessors();
    } else if (id === 2) {
      let selectedProfessors = 0;
      professors.forEach(
        (professor) => professor.isSelected === true && selectedProfessors++
      );
      if (selectedProfessors === 0) {
        setAlert(3);
        return;
      }
    }
    setDialog(id);
  };

  const handleCloseDialog = () => {
    if (dialog === 1) {
      setFilterProfessors("");
    } else if (dialog === 3) {
      setNewSectionName("");
    }
    setDialog(0);
  };

  const getAvailableProfessors = async (filter) => {
    const filterTmp = filter !== undefined ? filter : filterProfessors;
    const response = await fetch(
      `${serverSite}/api/getAvailableProfessors?orgId=${editedOrgId}&filter=${filterTmp}`,
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
        const newAvailableProfessors =
          body.length > 0
            ? body.map((professor) => {
                return { ...professor, isSelected: false };
              })
            : [];
        setAvailableProfessors(newAvailableProfessors);
      });
    } else setAlert(2);
  };

  const setSelectedAvailableProfessors = (id) => {
    const newProfessorsList = availableProfessors.map((professor) => {
      if (professor.id === id) {
        return { ...professor, isSelected: !professor.isSelected };
      }
      return professor;
    });
    setAvailableProfessors(newProfessorsList);
  };

  const addSelectedProfessorsToOrg = () => {
    setDialog(0);
    const selectedProfessors = [];
    const newProfessorsTmp = [];

    availableProfessors.forEach((professor) => {
      if (professor.isSelected) {
        selectedProfessors.push(professor.id);
        newProfessorsTmp.push(professor);
      }
    });

    if (selectedProfessors) {
      fetch(`${serverSite}/api/addProfessorsToOrganization`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId: editedOrgId,
          professorsIds: selectedProfessors,
        }),
      });

      if (professors.length > 0) {
        setProfessors((oldProfessors) => [
          ...oldProfessors,
          ...newProfessorsTmp,
        ]);
      } else setProfessors(newProfessorsTmp);
    }
  };

  const availableProfessorsList =
    availableProfessors.length > 0
      ? availableProfessors.map((professor) => {
          return (
            <ListItem>
              <ListItemButton
                role={undefined}
                onClick={() => setSelectedAvailableProfessors(professor.id)}
                dense
              >
                <ListItemIcon>
                  <Checkbox checked={professor.isSelected} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <>
                      <Typography variant="h6">
                        {professor.name + " " + professor.surname}
                      </Typography>
                      <Typography variant="h7">
                        {professor.githubLogin}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })
      : null;

  const deleteSelectedProfessors = () => {
    const deletedProfessors = [];
    const newProfessorsList = [];

    professors.forEach((professor) => {
      if (professor.isSelected) {
        deletedProfessors.push(professor.id);
      } else {
        newProfessorsList.push(professor);
      }
    });

    deletedProfessors.length > 0 &&
      fetch(`${serverSite}/api/deleteProfessorsFromOrganization`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId: editedOrgId,
          userId: deletedProfessors,
        }),
      });

    setDialog(0);
    setIsAllProfessors(false);
    setProfessors(newProfessorsList);
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

  const deleteOrganization = async () => {
    const response = await fetch(
      `${serverSite}/api/deleteOrganization?orgId=${editedOrgId}&userId=${localStorage.getItem(
        "userId"
      )}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
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

  const checkIsAdmin = async () => {
    const adminTmp = await isAdmin(localStorage.getItem("userId"));
    setAdmin(adminTmp);
  };

  useEffect(() => {
    checkIsAdmin();
    getOrganization();
  }, []);

  const dialogScreen =
    dialog === 1 ? (
      <>
        <DialogTitle>Dodawanie profesorów do organizacji</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Uwaga! Użytkownik dodawany do organizacji, powinien zostać ręcznie
            zaproszony do organizacji z poziomu platformy GitHub! Powinien być
            dodany jako owner!
          </DialogContentText>
          <TextField
            margin="dense"
            label="Filtr"
            type="search"
            fullWidth
            variant="standard"
            value={filterProfessors}
            onChange={(event) => {
              setFilterProfessors(event.target.value);
              getAvailableProfessors(event.target.value);
            }}
          />
          <List dense>{availableProfessorsList}</List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={addSelectedProfessorsToOrg}>Dodaj</Button>
        </DialogActions>
      </>
    ) : dialog === 2 ? (
      <>
        <DialogTitle color="error">Usuwanie użytkowników</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Jesteś pewien, że chcesz usunąć zaznaczonych użytkowników z
            organizacji?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Nie</Button>
          <Button onClick={deleteSelectedProfessors}>Tak</Button>
        </DialogActions>
      </>
    ) : dialog === 3 ? (
      <>
        <DialogTitle>Tworzenie nowej sekcji</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa sekcji"
            type="search"
            fullWidth
            variant="standard"
            value={newSectionName}
            onChange={(event) => {
              setNewSectionName(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={addSection}>Dodaj</Button>
        </DialogActions>
      </>
    ) : dialog === 4 ? (
      <>
        <DialogTitle color="error">Usuwanie organizacji</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Jesteś pewien, że chcesz usunąć organizację? Proces ten będzie
            nieodwracalny
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Nie</Button>
          <Button onClick={deleteOrganization}>Tak</Button>
        </DialogActions>
      </>
    ) : dialog === 5 ? (
      <>
        <DialogTitle color="error">
          Nie udało się zarchiwizować tych repozytoriów
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sekcja</TableCell>
                <TableCell>Imię</TableCell>
                <TableCell>Nazwisko</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notArchivedStudents.map((student) => (
                <TableRow key={student.repository}>
                  <TableCell>{student.sectionName}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.surname}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Zrozumiałem</Button>
        </DialogActions>
      </>
    ) : (
      <></>
    );

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
                    <Button variant="contained" size="large" disabled>
                      ZMIEŃ
                    </Button>
                  </>
                )}
              </Box>
              <Box className={classes.topRightContainer}>
                {admin ? (
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
                ) : (
                  <>
                    <Box className={classes.topRightButton}>
                      <Button variant="contained" size="large" disabled>
                        ARCHIWIZUJ
                      </Button>
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      color="error"
                      disabled
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
                      onClick={() => selectAllProfessors()}
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
                  {professorsList}
                </List>
                {admin ? (
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
                ) : (
                  <Box className={classes.addButton}>
                    <Button variant="contained" size="large" disabled>
                      Dodaj
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      color="error"
                      disabled
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
                  {sectionsList}
                </List>
                {admin ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpenDialog(3)}
                    sx={{ width: "100%" }}
                  >
                    Dodaj
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    disabled
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
        {dialogScreen}
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
};

export default SingleOrganization;
