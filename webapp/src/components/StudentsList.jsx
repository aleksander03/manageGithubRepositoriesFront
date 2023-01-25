import {
  Box,
  Button,
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
import classes from "./StudentsList.module.scss";
import { useEffect } from "react";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import { isAdmin } from "./CheckIsAdmin";
import { useNavigate } from "react-router-dom";

const headCells = [
  { id: "name", label: "Imię", numeric: false },
  { id: "surname", label: "Nazwisko", numeric: false },
  { id: "githubLogin", label: "GitHub Login", numeric: false },
  { id: "studentEmail", label: "Studencki Email", numeric: false },
  { id: "delete", label: "", numeric: false },
];

const StudentsList = () => {
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const siteName = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <GroupIcon color="secondary" fontSize="large" sx={{ pr: 1 }} />
      <Typography variant="h5">Lista studentów</Typography>
    </Box>
  );
  const [data, setData] = useState([]);
  const [countOfStudents, setCountOfStudents] = useState();
  const [orderBy, setOrderBy] = useState(headCells[0].id);
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(10);
  const [dialog, setDialog] = useState(0);
  const [chosenStudent, setChosenStudent] = useState({});
  const [chosenStudentRepositories, setChosenStudentRepositories] = useState(
    []
  );
  const [admin, setAdmin] = useState(true);
  const navigate = useNavigate();

  const getStudents = async (orderBy, order, filter, page, rows) => {
    const userId = localStorage.getItem("userId");

    const response = await fetch(
      `${serverSite}/api/getStudents?perPage=${rows}&page=${page}&orderBy=${orderBy}&order=${order}&filter=${filter}&userId=${userId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    setData(data[0]);
    setCountOfStudents(data[1]._all);
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
      setData(data.filter((student) => student.id !== userId));
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
        <TableSortLabel
          active={orderBy === headCell.id}
          direction={order}
          onClick={() => handleSort(headCell.id)}
        >
          {headCell.label}
        </TableSortLabel>
      </TableCell>
    );
  });

  const tableRow = (row) => {
    return (
      <TableRow hover>
        <TableCell onClick={() => getStudentData(row.id)}>{row.name}</TableCell>
        <TableCell onClick={() => getStudentData(row.id)}>
          {row.surname}
        </TableCell>
        <TableCell onClick={() => getStudentData(row.id)}>
          {row.githubLogin}
        </TableCell>
        <TableCell onClick={() => getStudentData(row.id)}>
          {row.studentEmail}
        </TableCell>
        <TableCell sx={{ width: 2 }}>
          <IconButton
            onClick={() => {
              setChosenStudent({ githubLogin: row.githubLogin, id: row.id });
              setDialog(1);
            }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  const tableBody = data?.length ? data.map((row) => tableRow(row)) : <></>;

  const handleSort = (label) => {
    const orderTmp =
      orderBy !== label ? "desc" : order === "asc" ? "desc" : "asc";
    setOrder(orderTmp);
    setOrderBy(label);
    getStudents(label, orderTmp, filter, page, rowsPerPage);
  };

  const handleTyping = (value) => {
    setFilter(value);
    getStudents(orderBy, order, value, page, rowsPerPage);
  };

  const getStudentData = async (userId) => {
    const response = await fetch(
      `${serverSite}/api/getUsersRepositories?userId=${userId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const data = await response.json();

      setChosenStudentRepositories(data);
      setDialog(2);
    }
  };

  const checkIsAdmin = async () => {
    const adminTmp = await isAdmin(localStorage.getItem("userId"));
    setAdmin(adminTmp);
  };

  useEffect(() => {
    checkIsAdmin();
    getStudents(orderBy, order, filter, page, rowsPerPage);
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
          <LeftBar chosenItem={"studentsList"} />
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
              getStudents(orderBy, order, filter, newPage, rowsPerPage);
            }}
            onRowsPerPageChange={(event) => {
              setRowPerPage(event.target.value);
              getStudents(orderBy, order, filter, page, event.target.value);
              setPage(0);
            }}
            labelRowsPerPage="Wierszy na stronę"
          />
        </Box>
      </Box>
      <Dialog
        open={dialog}
        onClose={() => setDialog(0)}
        PaperProps={{ style: { backgroundColor: "#d9d9d9", minWidth: 800 } }}
      >
        {dialog === 1 ? (
          <>
            <DialogTitle color="error">Usuwanie studenta</DialogTitle>
            <DialogContent>
              <DialogContentText color="error">
                Czy na pewno chcesz usunąć studenta o loginie{" "}
                {chosenStudent.githubLogin}?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button color="error" onClick={() => setDialog(0)}>
                Anuluj
              </Button>
              <Button
                color="error"
                onClick={() => {
                  deleteUser(chosenStudent.id, chosenStudent.githubLogin);
                  setDialog(0);
                }}
              >
                Tak
              </Button>
            </DialogActions>
          </>
        ) : (
          dialog === 2 && (
            <>
              <DialogTitle>Repozytoria studenta</DialogTitle>
              <DialogContent>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organizacja</TableCell>
                      <TableCell>Sekcja</TableCell>
                      <TableCell>Link do repozytorium</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chosenStudentRepositories.length > 0 &&
                      chosenStudentRepositories.map((student) => {
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              {student.section?.organization?.name}
                            </TableCell>
                            <TableCell>{student.section?.name}</TableCell>
                            <TableCell>{student.link}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </DialogContent>
            </>
          )
        )}
      </Dialog>
    </Box>
  );
};

export default StudentsList;
