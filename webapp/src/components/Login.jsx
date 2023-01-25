import { Box } from "@mui/system";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import React from "react";
import classes from "./Login.module.scss";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Button, Typography } from "@mui/material";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  let isCodeUsed = false;
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const client_id = process.env.REACT_APP_CLIENT_ID;
  const redirectUrl = process.env.REACT_APP_REDIRECT_URL_LOGIN;
  const scope = "read:user,admin:org,repo,delete_repo";
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scope}&redirect_uri=${redirectUrl}`;

  const logIn = async () => {
    isCodeUsed = true;
    await fetch(`${serverSite}/api/login?code=${code}`, {
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

  useEffect(() => {
    if (code && !isCodeUsed) logIn();
  }, []);

  if (localStorage.getItem("loggedIn") === "true") return <Navigate to="/" />;

  return (
    <Box className={classes.mainContainer}>
      <Box className={classes.container}>
        <Typography variant="h4" className={classes.appName}>
          DISMaGR
        </Typography>
        <Button
          sx={{
            margin: 0,
            backgroundColor: "black",
            color: "#D9D9D9",
            borderRadius: "5px",
            mt: "5px",
            "&:hover": {
              backgroundColor: "black",
            },
          }}
        >
          <a href={githubUrl}>
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
          </a>
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
