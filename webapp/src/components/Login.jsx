import { Box } from "@mui/system";
import { Navigate } from "react-router-dom";
import React from "react";
import LoginGithub from "react-login-github";
import { useState } from "react";
import classes from "./Login.module.scss";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Typography } from "@mui/material";

const Login = () => {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("loggedIn"));
  const onSuccess = (response) => {
    console.log(response);
    localStorage.setItem("loggedIn", true);
    setLoggedIn(true);
  };
  const onFailure = (response) => console.error(response);

  if (loggedIn) return <Navigate to="/" />;

  return (
    <Box className={classes.mainContainer}>
      <Box className={classes.container}>
        <Typography variant="h3" className={classes.appName}>
          Manage github repositories
        </Typography>
        <LoginGithub
          clientId={clientId}
          onSuccess={onSuccess}
          onFailure={onFailure}
          className={classes.loginButton}
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
        </LoginGithub>
      </Box>
    </Box>
  );
};

export default Login;
