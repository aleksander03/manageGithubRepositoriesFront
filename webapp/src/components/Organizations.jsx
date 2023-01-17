import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import React, { useEffect, useState } from "react";
import classesLayout from "./Layout.module.scss";
import classes from "./Organizations.module.scss";
import TopBar from "./TopBar";
import { Divider } from "@mui/material";
import LeftBar from "./LeftBar";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import GroupWorkIcon from "@mui/icons-material/GroupWork";

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
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const siteName = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <GroupWorkIcon fontSize="large" sx={{ pr: 1 }} />
      <Typography variant="h5">Organizacje</Typography>
    </Box>
  );
  const [data, setData] = useState([]);
  const [countOfStudents, setCountOfStudents] = useState();
  const [orderBy, setOrderBy] = useState(headCells[0].id);
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(10);
  const [orgName, setOrgName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [alertType, setAlertType] = useState(0);
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

  const findOrganization = async () => {
    if (orgName) {
      const response = await fetch(
        "http://localhost:5000/github/findAndCreateOrganization",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: localStorage.getItem("token"),
            org: orgName,
          }),
        }
      );
      if (response.status === 200) {
        response.json().then((body) => {
          navigate(`/organization/${body.id}`);
        });
      } else if (response.status === 204) {
        setAlertType(1);
      } else {
        setAlertType(2);
      }
    } else {
      setAlertType(2);
    }
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
      <TableRow
        hover
        onClick={() => navigate(`/organization/${row.id}`)}
        key={row.link}
      >
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

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOrgName("");
    setAlertType(0);
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
            <Button variant="contained" size="large" onClick={handleOpenDialog}>
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
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{ style: { backgroundColor: "#d9d9d9" } }}
      >
        <DialogTitle>Dodawanie istniejącej organizacji</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nazwa organizacji"
            type="search"
            fullWidth
            variant="standard"
            onChange={(event) => {
              setOrgName(event.target.value);
              alertType !== 0 && setAlertType(0);
            }}
            value={orgName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={() => findOrganization()}>Dodaj</Button>
        </DialogActions>
        <Collapse in={alertType === 1}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setAlertType(0)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            severity="info"
          >
            Organizacja {orgName} już istnieje!
          </Alert>
        </Collapse>
        <Collapse in={alertType === 2}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setAlertType(0)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            severity="error"
          >
            Nie udało się dodać organizacji {orgName}!
          </Alert>
        </Collapse>
      </Dialog>
    </Box>
  );
};

export default Organizations;
