import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";

const FormOfAddOrg = () => {
  const [nameGitHub, setNameGitHub] = useState("");
  const [name, setName] = useState("");
  const [defaultName, setDefaultName] = useState(true);
  const [isError, setIsError] = useState(false);

  const addOrgToDB = async () => {
    const response = await fetch(
      "http://localhost:5000/api/addExistingOrganization",
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("accessToken"),
          organization: nameGitHub,
          name: name,
        }),
      }
    );
    if (response.status === 201) setIsError(false);
    else if (response.status === 204) {
      alert(`Organizacja ${nameGitHub} już istnieje w bazie danych!`);
      setIsError(false);
    } else {
      setIsError(true);
      alert(`Organizacja ${nameGitHub} nie udało się dodać!`);
    }
  };

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox
            id="defaultName"
            checked={defaultName}
            onChange={(event) => setDefaultName(event.target.checked)}
          />
        }
        label="Ustawić nazwę z GitHuba?"
      />
      <Box>
        {isError ? (
          <TextField
            error
            id="nameGitHub"
            label="Nazwa organizacji w GitHub"
            variant="standard"
            value={nameGitHub}
            onChange={(event) => setNameGitHub(event.target.value)}
            sx={{ width: "35vw" }}
          />
        ) : (
          <TextField
            id="nameGitHub"
            label="Nazwa organizacji w GitHub"
            variant="standard"
            value={nameGitHub}
            onChange={(event) => setNameGitHub(event.target.value)}
            sx={{ width: "35vw" }}
          />
        )}
        {defaultName ? (
          <TextField
            id="name"
            label="Nazwa organizacji"
            variant="standard"
            value={name}
            onChange={(event) => setName(event.target.value)}
            sx={{ width: "35vw" }}
            disabled
          />
        ) : (
          <TextField
            id="name"
            label="Nazwa organizacji"
            variant="standard"
            value={name}
            onChange={(event) => setName(event.target.value)}
            sx={{ width: "35vw" }}
          />
        )}
        <Button
          variant="contained"
          size="large"
          sx={{ height: 48, ml: 5, width: "10vw" }}
          onClick={() => addOrgToDB()}
        >
          Wyślij
        </Button>
      </Box>
    </FormControl>
  );
};

export default FormOfAddOrg;
