import React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
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
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

export const UsersList = (props) => {
  const list =
    props.users.length > 0 &&
    props.users.map((user) => {
      return (
        <ListItem key={user.githubLogin}>
          <ListItemButton
            role={undefined}
            onClick={() => props.setSelectedUsers(user.githubLogin)}
            dense
          >
            <ListItemIcon>
              {props.isStudent ? <PersonIcon /> : <SchoolIcon />}
            </ListItemIcon>
            <ListItemText
              primary={`${user.name} ${user.surname}`}
              secondary={user.studentEmail}
            />
            <Checkbox checked={user.isSelected} />
          </ListItemButton>
        </ListItem>
      );
    });

  return <>{list}</>;
};

export const AlertScreen = (props) => {
  const alert = props.alert;
  let content;

  switch (alert) {
    case 1:
      content = (
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="error"
              size="small"
              onClick={() => props.setAlert(0)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          severity="error"
        >
          Brak tytułu issue!
        </Alert>
      );
      break;
    case 2:
      content = (
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="error"
              size="small"
              onClick={() => props.setAlert(0)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          severity="error"
        >
          Nie udało się wysłać issue!
        </Alert>
      );
      break;
    case 3:
      content = (
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="error"
              size="small"
              onClick={() => props.setAlert(0)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          severity="success"
        >
          Udało się dodać wszystkich studentów z listy!
        </Alert>
      );
      break;
    default:
      content = <></>;
      break;
  }

  return <>{content}</>;
};

export const DialogScreen = (props) => {
  const {
    dialog,
    filterTeachers,
    setFilterTeachers,
    getAvailableTeachers,
    availableTeachers,
    setSelectedAvailableTeachers,
    handleCloseDialog,
    addSelectedTeachersToSection,
    deleteSelectedTeachers,
    deleteSection,
    issueTitle,
    setIssueTitle,
    issueText,
    setIssueText,
    setDialog,
    sendIssue,
    useTemplate,
    setUseTemplate,
    setTemplateRepositoryName,
    templateRepositoryName,
    handleCsvFile,
    addStudentsFromCSV,
    addStudentsLink,
    generateCode,
    studentsInQueue,
    setDeleteStudentFromLink,
    addStudentsToSection,
    deleteStudentFromLink,
    deleteStudentFromQueue,
    rejectedStudents,
  } = props;
  let content;

  switch (dialog) {
    case 1:
      content = (
        <>
          <DialogTitle>Dodawanie prowadzących do sekcji</DialogTitle>
          <DialogContent>
            <DialogContentText color="error">
              Uwaga! Jeżeli użytkownik nie znajduje się w organizacji, powinien
              zostać ręcznie zaproszony do organizacji z poziomu platformy
              GitHub! Powinien być dodany jako owner!
            </DialogContentText>
            <TextField
              margin="dense"
              label="Filtr"
              type="search"
              fullWidth
              variant="standard"
              value={filterTeachers}
              onChange={(event) => {
                setFilterTeachers(event.target.value);
                getAvailableTeachers(event.target.value);
              }}
            />
            <List dense>
              <UsersList
                users={availableTeachers}
                setSelectedUsers={setSelectedAvailableTeachers}
              />
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Anuluj</Button>
            <Button onClick={addSelectedTeachersToSection}>Dodaj</Button>
          </DialogActions>
        </>
      );
      break;
    case 2:
      content = (
        <>
          <DialogTitle color="error">Usuwanie prowadzących</DialogTitle>
          <DialogContent>
            <DialogContentText color="error">
              Jesteś pewien, że chcesz usunąć zaznaczonych prowadzących z
              sekcji?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Nie</Button>
            <Button onClick={deleteSelectedTeachers}>Tak</Button>
          </DialogActions>
        </>
      );
      break;
    case 3:
      content = (
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
      );
      break;
    case 4:
      content = (
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
      );
      break;
    case 5:
      content = (
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
            <DialogContentText>
              Plik powinien zawierać kolumny:
            </DialogContentText>
            <DialogContentText>
              name, surname, githubLogin, studentEmail
            </DialogContentText>
            <Divider sx={{ mt: 1, mb: 1 }} />
            <input
              accept=".csv"
              multiple
              type="file"
              onChange={handleCsvFile}
            />
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
      );
      break;
    case 6:
      content = (
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
      );
      break;
    case 7:
      content = (
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
      );
      break;
    case 8:
      content = (
        <>
          <DialogTitle>Usuwanie studenta</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Czy jesteś pewien, że chcesz usunąć studenta{" "}
              {deleteStudentFromLink.name + " " + deleteStudentFromLink.surname}
              ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialog(7)}>Anuluj</Button>
            <Button onClick={deleteStudentFromQueue}>Tak</Button>
          </DialogActions>
        </>
      );
      break;
    case 9:
      content = (
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
      );
      break;
    default:
      content = <></>;
      break;
  }

  return <>{content}</>;
};
