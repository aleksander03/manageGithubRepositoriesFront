import {
  Box,
  Button,
  Checkbox,
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
import classes from "./SingleSection.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { useState } from "react";
import { useEffect } from "react";
import Papa from "papaparse";
import DeleteIcon from "@mui/icons-material/Delete";

const SingleSection = () => {
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const siteUrl = process.env.REACT_APP_REDIRECT_URL;
  const urlParams = useParams();
  const editedSectionId = urlParams.id;
  const siteName = "Edycja sekcji";
  const [section, setSection] = useState({});
  const [professors, setProfessors] = useState([]);
  const [students, setStudents] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [dialog, setDialog] = useState(0);
  const [addStudentsLink, setAddStudentsLink] = useState("");
  const [studentsInQueue, setStudentsInQueue] = useState([]);
  const [deleteStudentFromLink, setDeleteStudentFromLink] = useState({});
  const navigate = useNavigate();

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
          id: body[0].id,
          name: body[0].name,
          organizationId: body[0].organization.id,
          organization: body[0].organization.name,
        });
        const professorsList = [];
        const studentsList = [];

        body[0].sectionsToUsers.length > 0 &&
          body[0].sectionsToUsers.forEach((professor) => {
            professorsList.push({
              id: professor.user.id,
              name: professor.user.name,
              surname: professor.user.surname,
              githubEmail: professor.user.githubEmail,
              studentEmail: professor.user.studentEmail,
              isSelected: false,
            });
          });

        body[1].students.length > 0 &&
          body[1].students.forEach((student) => {
            studentsList.push({
              id: student.id,
              name: student.name,
              surname: student.surname,
              githubEmail: student.githubEmail,
              studentEmail: student.studentEmail,
              isSelected: false,
            });
          });

        setProfessors(professorsList);
        setStudents(studentsList);
        setSectionName(body[0].name);
      });
    }
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

  const professorsList =
    professors.length > 0 &&
    professors.map((professor) => {
      const label = professor.name + " " + professor.surname;
      return (
        <ListItem key={professor.githubEmail}>
          <ListItemButton
            role={undefined}
            //onClick={() => setSelectedProfessors(professor.githubEmail)}
            dense
          >
            <ListItemIcon>
              <Checkbox checked={professor.isSelected} />
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        </ListItem>
      );
    });

  const studentsList =
    students.length > 0 &&
    students.map((student) => {
      const label = student.name + " " + student.surname;
      return (
        <ListItem key={student.githubEmail}>
          <ListItemButton
            role={undefined}
            //onClick={() => setSelectedProfessors(professor.githubEmail)}
            dense
          >
            <ListItemIcon>
              <Checkbox checked={student.isSelected} />
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        </ListItem>
      );
    });

  const handleCsvFile = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      encoding: "windows-1250",
      complete: (results) => {
        console.log(results.data);
      },
    });
  };

  const handleCloseDialog = () => {
    if (dialog === 6) setAddStudentsLink("");
    setDialog(0);
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

    if (response.status === 200)
      response.json().then((body) => {
        console.log(body);
        setAddStudentsLink(`${siteUrl}section/form/${body}`);
      });
  };

  const addStudentsToSection = async () => {
    const studentsToAdd = [];

    studentsInQueue.map((student) => studentsToAdd.push(student.id));
    console.log(studentsToAdd);

    const response = await fetch(`${serverSite}/api/addStudentsToSection`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        users: studentsToAdd,
        sectionId: section.id,
      }),
    });

    if (response.status === 200) {
      setDialog(0);
      getSection();
    }
  };

  const dialogScreen =
    dialog === 1 ? (
      <>
        <DialogTitle>Dodawanie prowadzących do sekcji</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Filtr"
            type="search"
            fullWidth
            variant="standard"
            // value={filterProfessors}
            // onChange={(event) => {
            //   setFilterProfessors(event.target.value);
            //   getAvailableProfessors(event.target.value);
            // }}
          />
          {/* <List dense>{availableProfessorsList}</List> */}
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={addSelectedProfessorsToOrg}>Dodaj</Button> */}
        </DialogActions>
      </>
    ) : dialog === 2 ? (
      <>
        <DialogTitle color="error">Usuwanie prowadzących</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Jesteś pewien, że chcesz usunąć zaznaczonych prowadzących z sekcji?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleCloseDialog}>Nie</Button>
          <Button onClick={deleteSelectedProfessors}>Tak</Button> */}
        </DialogActions>
      </>
    ) : dialog === 3 ? (
      <>
        <DialogTitle>Dodawanie nowego studenta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa sekcji"
            type="search"
            fullWidth
            variant="standard"
            // value={newSectionName}
            // onChange={(event) => {
            //   setNewSectionName(event.target.value);
            // }}
          />
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={addSection}>Dodaj</Button> */}
        </DialogActions>
      </>
    ) : dialog === 4 ? (
      <>
        <DialogTitle color="error">Usuwanie sekcji</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Jesteś pewien, że chcesz usunąć sekcję? Proces ten będzie
            nieodwracalny
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleCloseDialog}>Nie</Button>
          <Button onClick={deleteOrganization}>Tak</Button> */}
        </DialogActions>
      </>
    ) : dialog === 5 ? (
      <>
        <DialogTitle>Dodawanie studentów z pliku CSV</DialogTitle>
        <DialogContent>
          <DialogContentText>Plik powinien zawierać kolumny:</DialogContentText>
          <DialogContentText>
            name, surname, githubEmail, studentEmail
          </DialogContentText>
          <Divider sx={{ mt: 1, mb: 1 }} />
          <input accept=".csv" multiple type="file" onChange={handleCsvFile} />
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button onClick={() => setDialog(6)}>Dodaj z linku</Button>
          <Box>
            <Button onClick={handleCloseDialog}>Anuluj</Button>
            <Button onClick={handleCloseDialog}>Dodaj</Button>
          </Box>
        </DialogActions>
      </>
    ) : dialog === 6 ? (
      <>
        <DialogTitle>Dodawanie studentów z linku</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Uwaga! Link będzie ważny tylko przez godzinę!
          </DialogContentText>
          <Divider sx={{ mt: 1, mb: 1 }} />
          <TextField
            label="Link"
            type="search"
            variant="filled"
            InputProps={{
              readOnly: true,
            }}
            sx={{ minWidth: "100%" }}
            value={addStudentsLink}
          />
          <Divider sx={{ mt: 1, mb: 1 }} />
          <Button
            variant="contained"
            sx={{ minWidth: "100%", pt: 2, pb: 2 }}
            onClick={generateCode}
          >
            Generuj link
          </Button>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button onClick={() => setDialog(5)}>Dodaj z pliku CSV</Button>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
        </DialogActions>
      </>
    ) : dialog === 7 ? (
      <>
        <DialogTitle>Lista oczekujących studentów do dodania</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imię</TableCell>
                <TableCell>Nazwisko</TableCell>
                <TableCell>Email GitHub</TableCell>
                <TableCell>Email uczelniany</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentsInQueue.map((row) => {
                return (
                  <TableRow>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.surname}</TableCell>
                    <TableCell>{row.githubEmail}</TableCell>
                    <TableCell>{row.studentEmail}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setDeleteStudentFromLink(row);
                          setDialog(8);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(0)}>Anuluj</Button>
          <Button onClick={() => addStudentsToSection()}>
            Dodaj wszystkich
          </Button>
        </DialogActions>
      </>
    ) : dialog === 8 ? (
      <>
        <DialogTitle>Usuwanie studenta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Czy jesteś pewien, że chcesz usunąć studenta{" "}
            {deleteStudentFromLink.name + " " + deleteStudentFromLink.surname}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(7)}>Anuluj</Button>
          <Button>Tak</Button>
        </DialogActions>
      </>
    ) : (
      <></>
    );

  useEffect(() => {
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
          <LeftBar />
        </Box>
        <Box className={classesLayout.content}>
          <Box className={classes.topContainer}>
            <Box>
              <TextField
                label="Nazwa sekcji"
                type="search"
                variant="filled"
                size="small"
                InputProps={{ className: classes.topLeftTextFieldInput }}
                sx={{ pr: "10px" }}
                value={sectionName}
                onChange={(event) => setSectionName(event.target.value)}
              />
              <Button variant="contained" size="large">
                ZMIEŃ
              </Button>
            </Box>
            <Box className={classes.topRightContainer}>
              <Box className={classes.topRightButton}>
                <Button variant="contained" size="large">
                  ARCHIWIZUJ
                </Button>
              </Box>
              <Button variant="contained" size="large" color="error">
                USUŃ
              </Button>
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
                  <ListItemButton role={undefined} dense>
                    <ListItemIcon>
                      <Checkbox />
                    </ListItemIcon>
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
              <Box className={classes.addButton}>
                <Button
                  variant="contained"
                  size="large"
                  //onClick={() => handleOpenDialog(1)}
                >
                  Dodaj
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  color="error"
                  //onClick={() => handleOpenDialog(2)}
                >
                  USUŃ
                </Button>
              </Box>
            </Box>
            <Box className={classes.content}>
              <List
                dense
                sx={{ maxWidth: "30vw" }}
                className={classes.contentList}
              >
                <ListItem>
                  <ListItemButton role={undefined} dense>
                    <ListItemIcon>
                      <Checkbox />
                    </ListItemIcon>
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
                {studentsList}
              </List>
              <Box className={classes.addButton}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setDialog(6)}
                >
                  Dodaj
                </Button>
                <Button variant="contained" size="large">
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
          },
        }}
      >
        {dialogScreen}
      </Dialog>
    </Box>
  );
};

export default SingleSection;
