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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import LeftBar from "./LeftBar";
import TopBar from "./TopBar";
import classesLayout from "./Layout.module.scss";
import { useState } from "react";
import classes from "./TeachersList.module.scss";
import { useEffect } from "react";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import { isAdmin } from "./CheckIsAdmin";
import { useNavigate } from "react-router-dom";

const headCells = [
  { id: "name", label: "Imię" },
  { id: "surname", label: "Nazwisko" },
  { id: "githubLogin", label: "GitHub Login" },
  { id: "studentEmail", label: "Uczelniany Email" },
  { id: "admin", label: "Administrator" },
  { id: "teacher", label: "Prowadzący" },
  { id: "delete", label: "" },
];

const TeachersList = () => {
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const siteName = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <GroupIcon color="primary" fontSize="large" sx={{ pr: 1 }} />
      <Typography variant="h5">Lista prowadzących</Typography>
    </Box>
  );
  const [data, setData] = useState([]);
  const [countOfStudents, setCountOfStudents] = useState();
  const [orderBy, setOrderBy] = useState(headCells[0].id);
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(10);
  const [dialog, setDialog] = useState(false);
  const [chosenTeacher, setChosenTeacher] = useState({});
  const [admin, setAdmin] = useState(true);
  const navigate = useNavigate();

  const getTeachers = async (orderBy, order, filter, page, rows) => {
    await fetch(
      `${serverSite}/api/getTeachers?perPage=${rows}&page=${page}&orderBy=${orderBy}&order=${order}&filter=${filter}&userId=${localStorage.getItem(
        "userId"
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const teachers = [];

        data[0].forEach((teacher) => {
          teachers.push({
            id: teacher.id,
            name: teacher.name,
            surname: teacher.surname,
            githubLogin: teacher.githubLogin,
            studentEmail: teacher.studentEmail,
            admin: teacher.usersToRoles.some(
              (teacherTmp) => teacherTmp.role.role === "Administrator"
            )
              ? true
              : false,
            teacher: teacher.usersToRoles.some(
              (teacherTmp) => teacherTmp.role.role === "Profesor"
            )
              ? true
              : false,
          });
        });
        setData(teachers);
        setCountOfStudents(data[1]);
      });
  };

  const deleteUser = async (userId, githubLogin) => {
    const response = await fetch(`${serverSite}/api/deleteUser`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        token: localStorage.getItem("accessToken"),
        githubLogin: githubLogin,
      }),
    });

    if (response.status === 200) {
      const newTeachersList = [];
      data.forEach((teacher) => {
        if (teacher.id !== userId) newTeachersList.push(teacher);
      });
      setData(newTeachersList);
      setCountOfStudents((oldCount) => oldCount - 1);
    }
  };

  const tableTopBar = headCells.map((headCell) => {
    return (
      <TableCell
        sx={{ backgroundColor: "#D9D9D9" }}
        key={headCell.id}
        align={headCell.numeric ? "right" : "left"}
      >
        {headCell.id === "admin" ||
        headCell.id === "teacher" ||
        headCell.id === "delete" ? (
          headCell.label
        ) : (
          <TableSortLabel
            active={orderBy === headCell.id}
            direction={order}
            onClick={() => handleSort(headCell.id)}
          >
            {headCell.label}
          </TableSortLabel>
        )}
      </TableCell>
    );
  });

  const tableRow = (row) => {
    return (
      <TableRow hover>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.surname}</TableCell>
        <TableCell>{row.githubLogin}</TableCell>
        <TableCell>{row.studentEmail}</TableCell>
        <TableCell sx={{ width: 2 }}>
          <center>
            <Checkbox
              checked={row.admin}
              onClick={(event) =>
                handleChangeRole("admin", row.id, event.target.checked)
              }
            />
          </center>
        </TableCell>
        <TableCell sx={{ width: 2 }}>
          <center>
            <Checkbox
              checked={row.teacher}
              onClick={(event) =>
                handleChangeRole("teacher", row.id, event.target.checked)
              }
            />
          </center>
        </TableCell>
        <TableCell sx={{ width: 2 }}>
          <IconButton
            onClick={() => {
              setChosenTeacher({ githubLogin: row.githubLogin, id: row.id });
              setDialog(true);
            }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  const tableBody =
    data.length > 1 ? (
      data.map((row) => tableRow(row))
    ) : data.length === 1 ? (
      tableRow(data[0])
    ) : (
      <></>
    );

  const handleSort = (label) => {
    const orderTmp =
      orderBy !== label ? "desc" : order === "asc" ? "desc" : "asc";
    setOrder(orderTmp);
    if (orderBy !== label) setOrderBy(label);
    getTeachers(label, orderTmp, filter, page, rowsPerPage);
  };

  const handleTyping = (value) => {
    setFilter(value);
    getTeachers(orderBy, order, value, page, rowsPerPage);
  };

  const handleChangeRole = async (role, userId, checked) => {
    if (!(userId === localStorage.getItem("userId") && role === "admin")) {
      const roleName =
        role === "admin"
          ? "Administrator"
          : role === "teacher"
          ? "Profesor"
          : "unknown";

      if (roleName !== "unknown") {
        if (checked) {
          const response = await fetch(
            `${serverSite}/api/giveRole?role=${roleName}&userId=${userId}`,
            {
              method: "PUT",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 201) {
            const newTeachersList = [];
            data.forEach((teacher) => {
              if (teacher.id === userId)
                newTeachersList.push({ ...teacher, [role]: checked });
              else newTeachersList.push(teacher);
            });

            setData(newTeachersList);
          }
        } else {
          const response = await fetch(
            `${serverSite}/api/deleteRole?role=${roleName}&userId=${userId}`,
            {
              method: "DELETE",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 200) {
            const newTeachersList = [];
            data.forEach((teacher) => {
              if (teacher.id === userId)
                newTeachersList.push({ ...teacher, [role]: checked });
              else newTeachersList.push(teacher);
            });

            setData(newTeachersList);
          }
        }
      }
    }
  };

  const checkIsAdmin = async () => {
    const adminTmp = await isAdmin(localStorage.getItem("userId"));
    setAdmin(adminTmp);
  };

  useEffect(() => {
    checkIsAdmin();
    getTeachers(orderBy, order, filter, page, rowsPerPage);
  }, []);

  if (!admin) navigate("/");

  return (
    <Box className={classesLayout.mainContainer}>
      <Box className={classesLayout.topBar}>
        <TopBar siteName={siteName} />
      </Box>
      <Divider />
      <Box className={classesLayout.contentContainer}>
        <Box className={classesLayout.leftBar}>
          <LeftBar chosenItem={"teachersList"} />
        </Box>
        <Box className={classesLayout.content}>
          <Box className={classes.textFieldContainer}>
            <TextField
              label="Filtruj"
              type="search"
              variant="filled"
              size="small"
              value={filter}
              onChange={(event) => handleTyping(event.target.value)}
            />
          </Box>
          <TableContainer sx={{ height: "calc(100vh - 197px)" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>{tableTopBar}</TableRow>
              </TableHead>
              <TableBody>{tableBody}</TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            count={countOfStudents}
            component="div"
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => {
              setPage(newPage);
              getTeachers(orderBy, order, filter, newPage, rowsPerPage);
            }}
            onRowsPerPageChange={(event) => {
              setRowPerPage(event.target.value);
              getTeachers(orderBy, order, filter, page, event.target.value);
              setPage(0);
            }}
            labelRowsPerPage="Wierszy na stronę"
          />
        </Box>
      </Box>
      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        PaperProps={{ style: { backgroundColor: "#d9d9d9" } }}
      >
        <DialogTitle color="error">Usuwanie prowadzącego</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Czy na pewno chcesz usunąć użytkownika o loginie{" "}
            {chosenTeacher.githubLogin}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setDialog(false)}>
            Anuluj
          </Button>
          <Button
            color="error"
            onClick={() => {
              deleteUser(chosenTeacher.id, chosenTeacher.githubLogin);
              setDialog(false);
            }}
          >
            Tak
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeachersList;
