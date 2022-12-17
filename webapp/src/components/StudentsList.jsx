import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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

const headCells = [
  { id: "name", label: "Imię", numeric: false },
  { id: "surname", label: "Nazwisko", numeric: false },
  { id: "githubEmail", label: "GitHub Email", numeric: false },
  { id: "studentEmail", label: "Studencki Email", numeric: false },
  { id: "organization", label: "Organizacja", numeric: false },
  { id: "section", label: "Sekcja", numeric: false },
];

const StudentsList = () => {
  const siteName = "Lista studentów";
  const [data, setData] = useState([]);
  const [orderBy, setOrderBy] = useState(headCells[0].id);
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  //const getStudents = () => { }

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
      <TableRow>
        <TableCell align="right">{row.id}</TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.link}</TableCell>
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
    //getStudents(label, orderTmp, filter);
  };

  const handleTyping = (value) => {
    setFilter(value);
    //getStudents(orderBy, order, value);
  };

  // useEffect(() => {
  //   getStudents(orderBy, order, filter);
  // }, []);

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
          <TableContainer sx={{ maxHeight: "calc(100vh - 145px)" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>{tableTopBar}</TableRow>
              </TableHead>
              <TableBody>{tableBody}</TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default StudentsList;
