import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
} from "@mui/material";
import React from "react";
import LeftBar from "./LeftBar";
import TopBar from "./TopBar";
import classesLayout from "./Layout.module.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./StudentsList.module.scss";
import { useEffect } from "react";

const headCells = [
  { id: "name", label: "Imię", numeric: false },
  { id: "surname", label: "Nazwisko", numeric: false },
  { id: "githubLogin", label: "GitHub Login", numeric: false },
  { id: "studentEmail", label: "Studencki Email", numeric: false },
];

const StudentsList = () => {
  const siteName = "Lista studentów";
  const [data, setData] = useState([]);
  const [countOfStudents, setCountOfStudents] = useState();
  const [orderBy, setOrderBy] = useState(headCells[0].id);
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(10);
  const navigate = useNavigate();

  const getStudents = async (orderBy, order, filter, page, rows) => {
    await fetch(
      `http://localhost:5000/api/getStudents?perPage=${rows}&page=${page}&orderBy=${orderBy}&order=${order}&filter=${filter}&userId=${localStorage.getItem(
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
      .then((data) => setData(data));
  };

  const getCountOfStudents = async (orderBy, filter) => {
    await fetch(
      `http://localhost:5000/api/getStudentsCount?orderBy=${orderBy}&filter=${filter}&userId=${localStorage.getItem(
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
      .then((body) => setCountOfStudents(body._all));
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
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.surname}</TableCell>
        <TableCell>{row.githubLogin}</TableCell>
        <TableCell>{row.studentEmail}</TableCell>
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
    getStudents(label, orderTmp, filter, page, rowsPerPage);
    getCountOfStudents(label, filter);
  };

  const handleTyping = (value) => {
    setFilter(value);
    getStudents(orderBy, order, value, page, rowsPerPage);
    getCountOfStudents(orderBy, value);
  };

  useEffect(() => {
    getStudents(orderBy, order, filter, page, rowsPerPage);
    getCountOfStudents(orderBy, filter);
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
          <Box className={classes.textFieldContainer}>
            <TextField
              label="Filtruj"
              type="search"
              variant="filled"
              size="small"
              value={filter}
              onChange={(event) =>
                handleTyping(event.target.value.toUpperCase())
              }
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
    </Box>
  );
};

export default StudentsList;
