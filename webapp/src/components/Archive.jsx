import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
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
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import LeftBar from "./LeftBar";
import TopBar from "./TopBar";
import classesLayout from "./Layout.module.scss";
import ArchiveIcon from "@mui/icons-material/Archive";
import { useEffect } from "react";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FileSaver from "file-saver";
import { isAdmin } from "./CheckIsAdmin";
import { useNavigate } from "react-router-dom";

const headCells = [
  { id: "fileName", label: "Nazwa pliku" },
  { id: "download", label: "" },
  { id: "delete", label: "" },
];

const Archive = () => {
  const siteName = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <ArchiveIcon color="action" fontSize="large" sx={{ pr: 1 }} />
      <Typography variant="h5">Archiwum</Typography>
    </Box>
  );
  const [filesFromBackend, setFilesFromBackend] = useState([]);
  const [files, setFiles] = useState([]);
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const [loading, setLoading] = useState(true);
  const [directory, setDirectory] = useState("/Archiwum");
  const [filter, setFilter] = useState("");
  const [fileToDelete, setFileToDelete] = useState("");
  const [alert, setAlert] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [admin, setAdmin] = useState(true);
  const navigate = useNavigate();

  const getFiles = async () => {
    const response = await fetch(
      `${serverSite}/api/getArchive?directory=${directory}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const body = await response.json();
      setFilesFromBackend(body);
      setFiles(body);
    } else {
      setDirectory((oldDirectory) =>
        oldDirectory !== "/Archiwum"
          ? oldDirectory.substring(0, directory.lastIndexOf("/"))
          : "/Archiwum"
      );
      setAlert(1);
    }
  };

  const deletePath = async () => {
    const response = await fetch(
      `${serverSite}/api/deleteArchive?filePath=${directory}/${fileToDelete}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      getFiles();
    } else {
      setAlert(2);
    }

    setDialog(false);
  };

  const handleFilter = (value) => {
    setFilter(value);
    const filesTmp = filesFromBackend.filter((file) =>
      file.toLowerCase().includes(value.toLowerCase())
    );
    setFiles(filesTmp);
  };

  const handleChangeDirectory = (value) => {
    setDirectory((oldDirectory) => oldDirectory + `/${value}`);
  };

  const handleReturn = () => {
    setDirectory((oldDirectory) =>
      oldDirectory !== "/Archiwum"
        ? oldDirectory.substring(0, directory.lastIndexOf("/"))
        : "/Archiwum"
    );
  };

  const downloadFile = async (fileName) => {
    setLoading(true);
    const response = await fetch(
      `${serverSite}/api/downloadFile?directory=${directory}&fileName=${fileName}`,
      {
        method: "GET",
        responseType: "blob",
      }
    );

    const data = await response.blob();
    FileSaver.saveAs(data, fileName);
    setLoading(false);
  };

  const checkIsAdmin = async () => {
    const adminTmp = await isAdmin(localStorage.getItem("userId"));
    setAdmin(adminTmp);
  };

  useEffect(() => {
    checkIsAdmin();
    getFiles();
    setLoading(false);
  }, [directory]);

  if (!admin) navigate("/");

  return (
    <Box className={classesLayout.mainContainer}>
      <Box className={classesLayout.topBar}>
        <TopBar siteName={siteName} />
      </Box>
      <Divider />
      <Box className={classesLayout.contentContainer}>
        <Box className={classesLayout.leftBar}>
          <LeftBar chosenItem={"archive"} />
        </Box>
        <Box className={classesLayout.content}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton onClick={handleReturn}>
              <KeyboardReturnIcon fontSize="large" color="info" />
            </IconButton>
            <TextField
              label="Filtruj"
              type="search"
              variant="filled"
              size="small"
              value={filter}
              onChange={(event) => handleFilter(event.target.value)}
            />
          </Box>
          {files.length === 0 ? (
            <center>
              <Typography variant="h2">Folder jest pusty!</Typography>
            </center>
          ) : (
            <TableContainer sx={{ height: "calc(100vh - 137px)" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {headCells.map((cell) => (
                      <TableCell key={cell.id}>{cell.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key="file">
                      <Button
                        sx={{ width: "100%", justifyContent: "flex-start" }}
                        onClick={() => handleChangeDirectory(file)}
                      >
                        <TableCell>{file}</TableCell>
                      </Button>
                      <TableCell sx={{ width: 2 }}>
                        {file.includes(".zip") && (
                          <center>
                            <IconButton onClick={() => downloadFile(file)}>
                              <DownloadIcon color="success" />
                            </IconButton>
                          </center>
                        )}
                      </TableCell>
                      <TableCell sx={{ width: 2 }}>
                        <center>
                          <IconButton
                            onClick={() => {
                              setFileToDelete(file);
                              setDialog(true);
                            }}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </center>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
      <Collapse
        in={alert}
        sx={{ position: "absolute", width: "100%", bottom: 0 }}
      >
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="error"
              size="small"
              onClick={() => setAlert(0)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          severity="error"
        >
          {alert === 1
            ? "To nie jest folder!"
            : alert === 2
            ? "Nie udało się usunąć pliku/folderu!"
            : ""}
        </Alert>
      </Collapse>
      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        PaperProps={{
          style: {
            backgroundColor: "#d9d9d9",
            maxWidth: 1000,
            minWidth: 500,
          },
        }}
      >
        <DialogTitle color="error">Usuwanie pliku {fileToDelete}</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            Czy jesteś pewien, że chcesz usunąć ten plik? Będzie to proces
            nieodwracalny!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Anuluj</Button>
          <Button onClick={deletePath}>Tak</Button>
        </DialogActions>
      </Dialog>
      <Collapse in={loading}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress color="warning" />
        </Box>
      </Collapse>
    </Box>
  );
};

export default Archive;
