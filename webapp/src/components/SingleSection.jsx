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
import classes from "./SingleSection.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { useState } from "react";
import { useEffect } from "react";
import Papa from "papaparse";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CircularProgress from "@mui/material/CircularProgress";
import { isAdmin } from "./CheckIsAdmin";

const SingleSection = () => {
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
  const [professors, setProfessors] = useState([]);
  const [students, setStudents] = useState([]);
  const [dialog, setDialog] = useState(0);
  const [addStudentsLink, setAddStudentsLink] = useState("");
  const [studentsInQueue, setStudentsInQueue] = useState([]);
  const [deleteStudentFromLink, setDeleteStudentFromLink] = useState({});
  const [studentsFromCSV, setStudenstFromCSV] = useState([]);
  const [isAllProfessors, setIsAllProfessors] = useState(false);
  const [isAllStudents, setIsAllStudents] = useState(false);
  const [availableProfessors, setAvailableProfessors] = useState([]);
  const [filterProfessors, setFilterProfessors] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [issueText, setIssueText] = useState("");
  const [alert, setAlert] = useState(0);
  const [templateRepositoryName, setTemplateRepositoryName] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectedStudents, setRejectedStudents] = useState([]);
  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();
  console.log(students);

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
        const professorsList = [];
        const studentsList = [];

        body[0][0].sectionsToUsers.length > 0 &&
          body[0][0].sectionsToUsers.forEach((professor) => {
            professorsList.push({
              id: professor.user.id,
              name: professor.user.name,
              surname: professor.user.surname,
              githubLogin: professor.user.githubLogin,
              studentEmail: professor.user.studentEmail,
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

        setProfessors(professorsList);
        setStudents(studentsList);
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

  const studentsList =
    students.length > 0 &&
    students.map((student) => {
      return (
        <ListItem key={student.githubLogin}>
          <ListItemButton
            role={undefined}
            onClick={() => setSelectedStudents(student.githubLogin)}
            dense
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary={`${student.name} ${student.surname}`}
              secondary={student.studentEmail}
            />
            <Checkbox checked={student.isSelected} />
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
        setStudenstFromCSV(results.data);
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

    if (response.status === 200) {
      const body = await response.json();
      setAddStudentsLink(`${siteUrl}section/form/${body}`);
    }
  };

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

  const selectItem = (list, githubLogin, setList) => {
    const newList = list.map((item) => {
      if (item.githubLogin === githubLogin) {
        return { ...item, isSelected: !item.isSelected };
      }
      return item;
    });

    setList(newList);
  };

  const setSelectedProfessors = (githubLogin) =>
    selectItem(professors, githubLogin, setProfessors);

  const setSelectedStudents = (githubLogin) =>
    selectItem(students, githubLogin, setStudents);

  const selectAllProfessors = () => {
    const newProfessorsList = professors.map((professor) => ({
      ...professor,
      isSelected: !isAllProfessors,
    }));

    setProfessors(newProfessorsList);
    setIsAllProfessors((oldValue) => !oldValue);
  };

  const selectAllStudents = () => {
    const newStudentsList = students.map((section) => ({
      ...section,
      isSelected: !isAllStudents,
    }));

    setStudents(newStudentsList);
    setIsAllStudents((oldValue) => !oldValue);
  };

  const getAvailableProfessors = async (filter = filterProfessors) => {
    const response = await fetch(
      `${serverSite}/api/getAvailableProfessorsForSection?sectionId=${section.id}&filter=${filter}`,
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

      const newAvailableProfessors =
        body.length > 0
          ? body.map((professor) => ({ ...professor, isSelected: false }))
          : [];

      setAvailableProfessors(newAvailableProfessors);
    }
  };

  const setSelectedAvailableProfessors = (id) => {
    const newProfessorsList = availableProfessors.map((professor) => {
      return professor.id === id
        ? { ...professor, isSelected: !professor.isSelected }
        : professor;
    });

    setAvailableProfessors(newProfessorsList);
  };

  const addSelectedProfessorsToSection = async () => {
    setDialog(0);

    const selectedProfessors = availableProfessors
      .filter((professor) => professor.isSelected)
      .map((professor) => professor.id);

    const newProfessors = availableProfessors.filter(
      (professor) => professor.isSelected
    );

    if (selectedProfessors) {
      const response = await fetch(`${serverSite}/api/addProfessorsToSection`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId: section.id,
          professorsIds: selectedProfessors,
        }),
      });

      if (response.status === 201) {
        setProfessors((oldProfessorsList) => [
          ...oldProfessorsList,
          ...newProfessors,
        ]);
      }
    }
  };

  const deleteSelectedProfessors = async () => {
    const deletedProfessors = professors
      .filter((professor) => professor.isSelected)
      .map((professor) => professor.id);
    const newProfessorsList = professors.filter(
      (professor) => !professor.isSelected
    );

    const response = await fetch(
      `${serverSite}/api/deleteProfessorsFromSection`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId: section.id,
          userId: deletedProfessors,
        }),
      }
    );

    if (response.status === 200) {
      setDialog(0);
      setProfessors(newProfessorsList);
    }
  };

  const availableProfessorsList =
    availableProfessors.length > 0
      ? availableProfessors.map((professor) => (
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
                    <Typography variant="h6">{`${professor.name} ${professor.surname}`}</Typography>
                    <Typography variant="h7">
                      {professor.githubLogin}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          </ListItem>
        ))
      : null;

  const handleOpenDeleteDialog = () => {
    let selectedProfessors = 0;
    professors.forEach(
      (professor) => professor.isSelected === true && selectedProfessors++
    );
    if (selectedProfessors === 0) return;
    setDialog(2);
  };

  const deleteSection = async () => {
    setDialog(0);
    setLoading(true);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");
    const users = students.map(
      (student) => student.id + "-" + section.name
    );

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

  const dialogScreen =
    dialog === 1 ? (
      <>
        <DialogTitle>Dodawanie prowadzących do sekcji</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Uwaga! Jeżeli użytkownik nie znajduje się w organizacji, powinien
            zostać ręcznie zaproszony do organizacji z poziomu platformy GitHub!
            Powinien być dodany jako owner!
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
          <Button onClick={addSelectedProfessorsToSection}>Dodaj</Button>
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
          <Button onClick={handleCloseDialog}>Nie</Button>
          <Button onClick={deleteSelectedProfessors}>Tak</Button>
        </DialogActions>
      </>
    ) : dialog === 3 ? (
      <>
        <DialogTitle color="error">Usuwanie sekcji</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Jesteś pewien, że chcesz usunąć sekcję? Proces ten będzie
            nieodwracalny
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Nie</Button>
          <Button onClick={deleteSection}>Tak</Button>
        </DialogActions>
      </>
    ) : dialog === 4 ? (
      <>
        <DialogTitle>Tworzenie issue</DialogTitle>
        <DialogContent>
          <TextField
            label="Tytuł issue*"
            type="search"
            variant="filled"
            size="small"
            sx={{ width: "100%" }}
            value={issueTitle}
            onChange={(event) => setIssueTitle(event.target.value)}
          />
          <TextField
            label="Tekst issue"
            type="search"
            variant="filled"
            size="small"
            sx={{ width: "100%" }}
            multiline
            rows={5}
            value={issueText}
            onChange={(event) => setIssueText(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(0)}>Anuluj</Button>
          <Button onClick={sendIssue}>Wyślij</Button>
        </DialogActions>
      </>
    ) : dialog === 5 ? (
      <>
        <DialogTitle>Dodawanie studentów z pliku CSV</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Czy chcesz użyć przykładowego repozytorium?
            <Checkbox
              value={useTemplate}
              onClick={(event) => {
                event.target.checked
                  ? setUseTemplate(event.target.checked)
                  : setTemplateRepositoryName("");
                setUseTemplate(event.target.checked);
              }}
            />
          </DialogContentText>
          {useTemplate && (
            <>
              <TextField
                label="Nazwa repozytorium"
                type="search"
                variant="filled"
                sx={{ minWidth: 452 }}
                value={templateRepositoryName}
                onChange={(event) =>
                  setTemplateRepositoryName(event.target.value)
                }
              />
              <DialogContentText color="error">
                Uwaga! Repozytorium powinno być w tej samej organizacji!
              </DialogContentText>
            </>
          )}
          <DialogContentText>Plik powinien zawierać kolumny:</DialogContentText>
          <DialogContentText>
            name, surname, githubLogin, studentEmail
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
            <Button onClick={addStudentsFromCSV}>Dodaj</Button>
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
                    <TableCell>{row.githubLogin}</TableCell>
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
          <DialogContentText>
            Czy chcesz użyć przykładowego repozytorium?
            <Checkbox
              value={useTemplate}
              onClick={(event) => {
                event.target.checked
                  ? setUseTemplate(event.target.checked)
                  : setTemplateRepositoryName("");
                setUseTemplate(event.target.checked);
              }}
            />
          </DialogContentText>
          {useTemplate && (
            <>
              <TextField
                label="Nazwa repozytorium"
                type="search"
                variant="filled"
                sx={{ minWidth: 452 }}
                value={templateRepositoryName}
                onChange={(event) =>
                  setTemplateRepositoryName(event.target.value)
                }
              />
              <DialogContentText color="error">
                Uwaga! Repozytorium powinno być w tej samej organizacji!
              </DialogContentText>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(0)}>Anuluj</Button>
          {studentsInQueue.length > 0 && (
            <Button onClick={() => addStudentsToSection()}>
              Dodaj wszystkich
            </Button>
          )}
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
          <Button onClick={deleteStudentFromQueue}>Tak</Button>
        </DialogActions>
      </>
    ) : dialog === 9 ? (
      <>
        <DialogTitle>Lista osób, których nie udało się dodać</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imię</TableCell>
                <TableCell>Nazwisko</TableCell>
                <TableCell>Login GitHub</TableCell>
                <TableCell>Email uczelniany</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rejectedStudents.map((student) => {
                return (
                  <TableRow key={student.githubLogin}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.surname}</TableCell>
                    <TableCell>{student.githubLogin}</TableCell>
                    <TableCell>{student.studentEmail}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(0)}>Zrozumiałem</Button>
        </DialogActions>
      </>
    ) : (
      <></>
    );

  const alertScreen =
    alert === 1 ? (
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
        Brak tytułu issue!
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
        Nie udało się wysłać issue!
      </Alert>
    ) : (
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
        Udało się dodać wszystkich studentów z listy!
      </Alert>
    );

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
              {admin ? (
                <Button
                  variant="contained"
                  size="large"
                  color="error"
                  onClick={() => setDialog(3)}
                >
                  USUŃ
                </Button>
              ) : (
                <Button variant="contained" size="large" color="error" disabled>
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
                    onClick={() => {
                      getAvailableProfessors();
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
        {dialogScreen}
        <Collapse in={alert}>{alertScreen}</Collapse>
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
