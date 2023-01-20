import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import LeftBar from "./LeftBar";
import TopBar from "./TopBar";
import classesLayout from "./Layout.module.scss";
import PersonIcon from "@mui/icons-material/Person";
import { useEffect } from "react";
import classes from "./Profile.module.scss";
import CloseIcon from "@mui/icons-material/Close";

const Profile = () => {
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const siteName = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <PersonIcon fontSize="large" sx={{ pr: 1 }} />
      <Typography variant="h5">Profil</Typography>
    </Box>
  );
  const [userData, setUserData] = useState({});
  const [repositoriesList, setRepositoriesList] = useState([]);
  const [alert, setAlert] = useState(0);

  const getUser = async () => {
    await fetch(
      `${serverSite}/api/getUserByLogin?githubLogin=${localStorage.getItem(
        "githubLogin"
      )}&userId=${localStorage.getItem("userId")}`,
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
        if (data[0] === null) localStorage.setItem("loggedIn", false);
        setUserData(data[0]);
        setRepositoriesList(data[1]);
      });
  };

  const changeUserData = async () => {
    const response = await fetch(`${serverSite}/api/changeUserData`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userData: userData }),
    });

    if (response.status === 200) {
      localStorage.setItem("name", userData.name);
      localStorage.setItem("surname", userData.surname);
      localStorage.setItem("studentEmail", userData.studentEmail);
      setAlert(1);
    } else {
      setAlert(2);
    }
  };

  useEffect(() => {
    getUser();
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
          <Box className={classes.mainContainer}>
            <Box className={classes.contentContainer}>
              <Box className={classes.content}>
                <List
                  dense
                  sx={{ maxWidth: "30vw" }}
                  className={classes.contentList}
                >
                  <ListItem>
                    <center>
                      <Typography variant="h5">Informacje</Typography>
                    </center>
                  </ListItem>
                </List>
                <TextField
                  label="Imię"
                  type="search"
                  variant="filled"
                  size="small"
                  sx={{ minWidth: 300 }}
                  value={userData.name}
                  onChange={(event) =>
                    setUserData((oldUserData) => {
                      return { ...oldUserData, name: event.target.value };
                    })
                  }
                  defaultValue=" "
                />
                <br></br>
                <TextField
                  label="Nazwisko"
                  type="search"
                  variant="filled"
                  size="small"
                  sx={{ minWidth: 300 }}
                  value={userData.surname}
                  onChange={(event) =>
                    setUserData((oldUserData) => {
                      return { ...oldUserData, surname: event.target.value };
                    })
                  }
                  defaultValue=" "
                />
                <br></br>
                <TextField
                  label="GitHub Login"
                  type="search"
                  variant="filled"
                  size="small"
                  sx={{ minWidth: 300 }}
                  value={userData.githubLogin}
                  defaultValue=" "
                  aria-readonly
                />
                <br></br>
                <TextField
                  label="Email uczelniany"
                  type="search"
                  variant="filled"
                  size="small"
                  sx={{ minWidth: 300, pb: 1 }}
                  value={userData.studentEmail}
                  onChange={(event) =>
                    setUserData((oldUserData) => {
                      return {
                        ...oldUserData,
                        studentEmail: event.target.value,
                      };
                    })
                  }
                  defaultValue=" "
                />
                <br></br>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ width: "100%" }}
                  onClick={() => changeUserData()}
                >
                  Zapisz
                </Button>
              </Box>
              <Box className={classes.content}>
                <List
                  dense
                  sx={{ maxWidth: "30vw" }}
                  className={classes.contentList}
                >
                  <ListItem>
                    <center>
                      <Typography variant="h5">Organizacje</Typography>
                    </center>
                  </ListItem>
                  {repositoriesList.map((repository) => {
                    return (
                      <ListItem>
                        <ListItemText>{repository.name}</ListItemText>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Collapse
        in={alert}
        sx={{ position: "absolute", width: "100%", bottom: 0 }}
      >
        {alert === 1 ? (
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
            severity="success"
          >
            Dane zostały zmienione!
          </Alert>
        ) : alert === 2 ? (
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
            Nie udało się zmienić danych!
          </Alert>
        ) : (
          <></>
        )}
      </Collapse>
    </Box>
  );
};

export default Profile;
