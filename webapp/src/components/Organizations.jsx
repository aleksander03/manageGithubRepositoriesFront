import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
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
  { id: "id", label: "ID", numeric: true },
  { id: "name", label: "Nazwa organizacji", numeric: false },
  { id: "link", label: "Link", numeric: false },
];

const Organizations = () => {
  const [data, setData] = useState([]);
  const [orderBy, setOrderBy] = useState(headCells[0].id);
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const siteName = "Organizacje";
  const navigate = useNavigate();

  const getOrganizations = async (orderBy, order, filter) => {
    await fetch(
      `http://localhost:5000/api/getOrganizations?orderBy=${orderBy}&order=${order}&filter=${filter}`,
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

  const tableTopBar = headCells.map((headCell) => {
    return (
      <TableCell key={headCell.id} align={headCell.numeric ? "right" : "left"}>
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

  useEffect(() => {
    getOrganizations(orderBy, order, filter);
  }, []);

  const handleSort = (label) => {
    const orderTmp =
      orderBy !== label ? "desc" : order === "asc" ? "desc" : "asc";
    setOrder(orderTmp);
    if (orderBy !== label) setOrderBy(label);
    getOrganizations(label, orderTmp, filter);
  };

  const handleTyping = (value) => {
    setFilter(value);
    getOrganizations(orderBy, order, value);
  };

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
              className={classes.numberOfOrgs}
            />
          </Box>
          <Table>
            <TableHead>
              <TableRow>{tableTopBar}</TableRow>
            </TableHead>
            <TableBody>{tableBody}</TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default Organizations;
