import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

const SingUpPage = () => {
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const urlParams = useParams();
  const [isCodeValid, setIsCodeValid] = useState(false);
  const generatedCode = urlParams.code;
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [githubLogin, setgithubLogin] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [alert, setAlert] = useState(0);
  const [isAddedStudent, setIsAddedStudent] = useState(false);

  const checkIsCodeValid = async () => {
    const response = await fetch(
      `${serverSite}/api/checkIsCodeExpired?code=${generatedCode}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) setIsCodeValid(true);
  };

  useState(() => {
    checkIsCodeValid();
  }, []);

  if (!isCodeValid)
    return (
      <Box>
        <center>
          <Typography variant="h1" color="error">
            Link jest nieważny!
          </Typography>
          <Typography variant="h4">
            Spytaj prowadzącego zajęcia o poprawność linku
          </Typography>
        </center>
      </Box>
    );

  const addStudent = async () => {
    checkIsCodeValid();
    if (
      name !== "" &&
      name !== " " &&
      surname !== "" &&
      surname !== " " &&
      githubLogin !== "" &&
      githubLogin !== " " &&
      studentEmail !== "" &&
      studentEmail !== " "
    ) {
      const response = await fetch(
        `http://localhost:5000/api/addStudentFromLink?name=${name}&surname=${surname}&githubLogin=${githubLogin}&studentEmail=${studentEmail}&urlCode=${generatedCode}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setIsAddedStudent(true);
        setAlert(1);
      } else if (response.status === 404) {
        setAlert(4);
      } else {
        setAlert(2);
      }
    } else {
      setAlert(3);
    }
  };

  return (
    <Dialog
      open={true}
      PaperProps={{
        style: { backgroundColor: "#d9d9d9", minWidth: 400 },
      }}
    >
      <DialogTitle>
        <center>Dodawanie do sekcji</center>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Imię"
          type="search"
          variant="filled"
          size="small"
          value={name}
          onChange={(event) => setName(event.target.value)}
          sx={{ width: "100%" }}
          InputProps={{
            readOnly: isAddedStudent ? true : false,
          }}
        />
        <br></br>
        <TextField
          label="Nazwisko"
          type="search"
          variant="filled"
          size="small"
          value={surname}
          onChange={(event) => setSurname(event.target.value)}
          sx={{ width: "100%" }}
          InputProps={{
            readOnly: isAddedStudent ? true : false,
          }}
        />
        <br></br>
        <TextField
          label="Uczelniany email"
          type="search"
          variant="filled"
          size="small"
          value={studentEmail}
          onChange={(event) => setStudentEmail(event.target.value)}
          sx={{ width: "100%" }}
          InputProps={{
            readOnly: isAddedStudent ? true : false,
          }}
        />
        <br></br>
        <TextField
          label="GitHub login"
          type="search"
          variant="filled"
          size="small"
          value={githubLogin}
          onChange={(event) => setgithubLogin(event.target.value)}
          sx={{ width: "100%" }}
          InputProps={{
            readOnly: isAddedStudent ? true : false,
          }}
        />
        <br></br>
      </DialogContent>
      {!isAddedStudent && (
        <DialogActions>
          <Button onClick={addStudent}>Wyślij</Button>
        </DialogActions>
      )}
      <Collapse in={alert}>
        {alert === 1 ? (
          <Alert>Zostałeś/aś dodany/a do sekcji!</Alert>
        ) : alert === 2 ? (
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setAlert(0)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            severity="error"
          >
            Nie udało się dodać Cię do sekcji lub już w niej istniejesz!
          </Alert>
        ) : alert === 3 ? (
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setAlert(0)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            severity="error"
          >
            Niektóre pola formularzu nie zostały wypełnione!
          </Alert>
        ) : (
          alert === 4 && (
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
              Użytkownik o loginie {githubLogin} nie istnieje!
            </Alert>
          )
        )}
      </Collapse>
    </Dialog>
  );
};

export default SingUpPage;
