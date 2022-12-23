import {
  Box,
  Button,
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
import React, { useEffect, useState } from "react";
import classesLayout from "./Layout.module.scss";
import classes from "./Organizations.module.scss";
import TopBar from "./TopBar";
import { Divider } from "@mui/material";
import LeftBar from "./LeftBar";
import { useNavigate } from "react-router-dom";

const headCells = [
  { id: "name", label: "Nazwa organizacji", numeric: false },
  { id: "link", label: "Link", numeric: false },
  { id: "sections", label: "Ilość sekcji", numeric: true },
  {
    id: "organizationsToUsers",
    label: "Ilość studentów",
    numeric: true,
  },
];

const Organizations = () => {
  const siteName = "Organizacje";
  const [data, setData] = useState([]);
  const [countOfStudents, setCountOfStudents] = useState();
  const [orderBy, setOrderBy] = useState(headCells[0].id);
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(10);
  const navigate = useNavigate();
  const getOrganizations = async (orderBy, order, filter, page, rows) => {
    await fetch(
      `http://localhost:5000/api/getOrganizations?perPage=${rows}&page=${page}&orderBy=${orderBy}&order=${order}&filter=${filter}&userId=${localStorage.getItem(
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

  const getOrganizationsCount = async (orderBy, filter) => {
    await fetch(
      `http://localhost:5000/api/getOrganizationsCount?orderBy=${orderBy}&filter=${filter}&userId=${localStorage.getItem(
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
        {headCell.id === "name" || headCell.id === "link" ? (
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
      <TableRow>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.link}</TableCell>
        <TableCell align="right">{row._count.sections}</TableCell>
        <TableCell align="right">{row._count.organizationsToUsers}</TableCell>
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
    getOrganizations(label, orderTmp, filter, page, rowsPerPage);
    getOrganizationsCount(label, filter);
  };

  const handleTyping = (value) => {
    setFilter(value);
    getOrganizations(orderBy, order, value, page, rowsPerPage);
    getOrganizationsCount(orderBy, value);
  };

  useEffect(() => {
    getOrganizations(orderBy, order, filter, page, rowsPerPage);
    getOrganizationsCount(orderBy, filter);
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
          <Box className={classes.topBar}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/addexistingorganization")}
            >
              Dodaj istniejącą
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
              getOrganizations(orderBy, order, filter, newPage, rowsPerPage);
            }}
            onRowsPerPageChange={(event) => {
              setRowPerPage(event.target.value);
              getOrganizations(
                orderBy,
                order,
                filter,
                page,
                event.target.value
              );
              setPage(0);
            }}
            labelRowsPerPage="Wierszy na stronę"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Organizations;
