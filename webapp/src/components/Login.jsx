import { Box } from "@mui/system";
import { Navigate, useNavigate } from "react-router-dom";
import React from "react";
import GitHubLogin from "react-login-github";
import classes from "./Login.module.scss";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Alert, Collapse, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

const Login = () => {
  const navigate = useNavigate();
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const client_id = process.env.REACT_APP_CLIENT_ID;
  const mainSite = process.env.REACT_APP_REDIRECT_URL;
  const scope = "read:user, admin:org, repo";
  const [isAlert, setIsAlert] = useState(false);

  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn === "true") return <Navigate to="/" />;

  const onSuccess = async (response) => {
    await fetch(`${serverSite}/api/login?code=${response.code}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 200) {
        response.json().then(async (body) => {
          localStorage.setItem("accessToken", body.access_token);

          await fetch(`${serverSite}/api/getUser`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: body.access_token,
            }),
          }).then((response2) => {
            response2.json().then((body2) => {
              localStorage.setItem("userId", body2.id);
              localStorage.setItem("name", body2.name);
              localStorage.setItem("surname", body2.surname);
              localStorage.setItem("githubLogin", body2.githubLogin);
              localStorage.setItem("studentEmail", body2.studentEmail);
              localStorage.setItem("loggedIn", true);

              navigate("/");
            });
          });
        });
      }
    });
  };

  const onFailure = (response) => setIsAlert(true);

  return (
    <Box className={classes.mainContainer}>
      <Box className={classes.container}>
        <Typography variant="h4" className={classes.appName}>
          DISMaGR
        </Typography>
        <GitHubLogin
          clientId={client_id}
          redirectUri={mainSite}
          onSuccess={onSuccess}
          onFailure={onFailure}
          className={classes.loginButton}
          scope={scope}
        >
          <Box>
            <GitHubIcon
              color="primary"
              fontSize="large"
              className={classes.loginButtonContent}
            />
            <Typography variant="h5" className={classes.loginButtonContent}>
              Zaloguj się
            </Typography>
          </Box>
        </GitHubLogin>
      </Box>
      <Collapse in={isAlert}>
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setIsAlert(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          severity="error"
        >
          Przy logowaniu doszło do błędu! Zaloguj się ponownie :)
        </Alert>
      </Collapse>
    </Box>
  );
};

export default Login;
