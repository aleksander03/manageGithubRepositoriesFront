import React from "react";
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import FindInPageIcon from "@mui/icons-material/FindInPage";

export const TeachersList = (props) => {
  const list =
    props.teachers.length > 0 &&
    props.teachers.map((teacher) => {
      return (
        <ListItem key={teacher.githubLogin}>
          <ListItemButton
            role={undefined}
            onClick={() => props.setSelectedTeachers(teacher.githubLogin)}
            dense
          >
            <ListItemIcon>
              <SchoolIcon />
            </ListItemIcon>
            <ListItemText
              primary={`${teacher.name} ${teacher.surname}`}
              secondary={teacher.studentEmail}
            />
            <Checkbox checked={teacher.isSelected} />
          </ListItemButton>
        </ListItem>
      );
    });

  return <>{list}</>;
};

export const SectionsList = (props) => {
  const list =
    props.sections.length > 0 &&
    props.sections.map((section) => {
      return (
        <ListItem key={section.id}>
          <ListItemButton
            role={undefined}
            onClick={() => props.navigate(`/section/${section.id}`)}
            dense
          >
            <ListItemIcon>
              <FindInPageIcon />
            </ListItemIcon>
            <ListItemText primary={section.name} />
          </ListItemButton>
        </ListItem>
      );
    });

  return <>{list}</>;
};

export const DialogScreen = (props) => {
  const dialog = props.dialog;
  let content;

  switch (dialog) {
    case 1:
      content = (
        <>
          <DialogTitle>Dodawanie prowadzących do organizacji</DialogTitle>
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
              value={props.filterTeachers}
              onChange={(event) => {
                props.setFilterTeachers(event.target.value);
                props.getAvailableTeachers(event.target.value);
              }}
            />
            <List dense>
              <TeachersList
                teachers={props.availableTeachers}
                setSelectedTeachers={props.setSelectedAvailableTeachers}
              />
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={props.handleCloseDialog}>Anuluj</Button>
            <Button onClick={props.addSelectedTeachersToOrg}>Dodaj</Button>
          </DialogActions>
        </>
      );
      break;

    case 2:
      content = (
        <>
          <DialogTitle color="error">Usuwanie użytkowników</DialogTitle>
          <DialogContent>
            <DialogContentText color="error">
              Jesteś pewien, że chcesz usunąć zaznaczonych użytkowników z
              organizacji?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={props.handleCloseDialog}>Nie</Button>
            <Button onClick={props.deleteSelectedTeachers}>Tak</Button>
          </DialogActions>
        </>
      );
      break;

    case 3:
      content = (
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
              value={props.newSectionName}
              onChange={(event) => {
                props.setNewSectionName(event.target.value);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={props.handleCloseDialog}>Anuluj</Button>
            <Button onClick={props.addSection}>Dodaj</Button>
          </DialogActions>
        </>
      );
      break;

    case 4:
      content = (
        <>
          <DialogTitle color="error">Usuwanie organizacji</DialogTitle>
          <DialogContent>
            <DialogContentText color="error">
              Jesteś pewien, że chcesz usunąć organizację? Proces ten będzie
              nieodwracalny
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={props.handleCloseDialog}>Nie</Button>
            <Button onClick={props.deleteOrganization}>Tak</Button>
          </DialogActions>
        </>
      );
      break;

    case 5:
      content = (
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
                {props.notArchivedStudents.map((student) => (
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
            <Button onClick={props.handleCloseDialog}>Zrozumiałem</Button>
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
