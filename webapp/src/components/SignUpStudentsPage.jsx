import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";

const SingUpStudentsPage = () => {
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const urlParams = useParams();
  const [isCodeValid, setIsCodeValid] = useState(false);
  const generatedCode = urlParams.code;

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
            Spytaj prowadzącego zajęcia o poprawność linku :)
          </Typography>
        </center>
      </Box>
    );
  return <Box>{generatedCode}</Box>;
};

export default SingUpStudentsPage;
