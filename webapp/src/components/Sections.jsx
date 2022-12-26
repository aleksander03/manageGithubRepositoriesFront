import {
  Box,
  Button,
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
import classes from "./Sections.module.scss";
import { useEffect } from "react";

const headCells = [
  { id: "name", label: "Nazwa", numeric: false },
  { id: "countOfUsers", label: "Ilość studentów", numeric: true },
];

const Sections = () => {
  const siteName = "Sekcje";
  const [data, setData] = useState([]);
  const [countOfStudents, setCountOfStudents] = useState();
  const [orderBy, setOrderBy] = useState(headCells[0].id);
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(10);
  const navigate = useNavigate();

  const getSections = async (orderBy, order, filter, page, rows) => {
    await fetch(
      `http://localhost:5000/api/getSections?perPage=${rows}&page=${page}&orderBy=${orderBy}&order=${order}&filter=${filter}&userId=${localStorage.getItem(
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

  const getCountOfSections = async (orderBy, filter) => {
    await fetch(
      `http://localhost:5000/api/getSectionsCount?orderBy=${orderBy}&filter=${filter}&userId=${localStorage.getItem(
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
        {headCell.id === "name" ? (
          <TableSortLabel
            active={orderBy === headCell.id}
            direction={order}
            onClick={() => handleSort(headCell.id)}
          >
            {headCell.label}
          </TableSortLabel>
        ) : (
          headCell.label
        )}
      </TableCell>
    );
  });

  const tableRow = (row) => {
    return (
      <TableRow hover>
        <TableCell>{row.name}</TableCell>
        <TableCell align="right">{row._count.sectionsToUsers}</TableCell>
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
    getSections(label, orderTmp, filter, page, rowsPerPage);
    getCountOfSections(label, filter);
  };

  const handleTyping = (value) => {
    setFilter(value);
    getSections(orderBy, order, value, page, rowsPerPage);
    getCountOfSections(orderBy, value);
  };

  useEffect(() => {
    getSections(orderBy, order, filter, page, rowsPerPage);
    getCountOfSections(orderBy, filter);
  }, []);
  console.log(data);
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
          <Box className={classes.topBar}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/addexistingorganization")}
            >
              Utwórz
            </Button>
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
              getSections(orderBy, order, filter, newPage, rowsPerPage);
            }}
            onRowsPerPageChange={(event) => {
              setRowPerPage(event.target.value);
              getSections(orderBy, order, filter, page, event.target.value);
              setPage(0);
            }}
            labelRowsPerPage="Wierszy na stronę"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Sections;
