import { Box } from "@mui/system";
import { Navigate, useNavigate } from "react-router-dom";
import React from "react";
import LoginGithub from "react-login-github";
import classes from "./Login.module.scss";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Button, Typography } from "@mui/material";

const Login = () => {
  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_CLIENT_ID;

  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn === "true") return <Navigate to="/" />;

  const onSuccess = async (response) => {
    await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: response.code,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((body) => {
        localStorage.setItem("accessToken", body.access_token);
      });

    await fetch("http://localhost:5000/api/getUser", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("accessToken"),
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((body) => {
        localStorage.setItem("email", body.githubEmail);
        localStorage.setItem("isProfessor", body.isProfessor);
        localStorage.setItem("name", body.name);
        localStorage.setItem("studentEmail", body.studentEmail);
        localStorage.setItem("surname", body.surname);
      });

    localStorage.setItem("loggedIn", true);

    navigate("/");
  };
  const onFailure = (response) => console.error(response);

  return (
    <Box className={classes.mainContainer}>
      <Box className={classes.container}>
        <Typography variant="h4" className={classes.appName}>
          DISMaGR
        </Typography>
        <LoginGithub
          clientId={clientId}
          onSuccess={onSuccess}
          onFailure={onFailure}
          className={classes.loginButton}
          redirectUri="http://localhost:3000/"
          scope="read:user, admin:org, repo"
        >
          {/* <Button className={classes.loginButton} onClick={onSuccess}> */}
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
          {/* </Button> */}
        </LoginGithub>
      </Box>
    </Box>
  );
};

export default Login;
