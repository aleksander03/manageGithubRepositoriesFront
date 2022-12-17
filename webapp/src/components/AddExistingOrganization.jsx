import { Box, Divider, TextField, Typography } from "@mui/material";
import React from "react";
import LeftBar from "./LeftBar";
import TopBar from "./TopBar";
import classesLayout from "./Layout.module.scss";
import classes from "./AddExistingOrganization.module.scss";
import { useState } from "react";
import FormOfAddOrg from "./FormOfAddOrg";

const AddExistingOrganization = () => {
  const siteName = "Dodawanie istniejącej organizacji";
  const [numberOfOrgs, setNumberOfOrgs] = useState(1);
  const maxCountOfOrgs = 5;

  const forms = [];
  for (let i = 0; i < numberOfOrgs; i++) {
    forms.push(
      <>
        <FormOfAddOrg key={i} />
        <Divider sx={{ border: 0 }} />
      </>
    );
  }

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
            <Box className={classes.countContainer}>
              <Typography variant="h6" className={classes.textOfNumber}>
                Liczba dodawanych organizacji
              </Typography>
              <TextField
                id="numberOfOrgs"
                type="number"
                value={numberOfOrgs}
                onChange={(event) =>
                  event.target.value < 1
                    ? setNumberOfOrgs(1)
                    : event.target.value > maxCountOfOrgs
                    ? setNumberOfOrgs(maxCountOfOrgs)
                    : setNumberOfOrgs(event.target.value)
                }
                InputProps={{
                  inputProps: {
                    min: 1,
                    max: maxCountOfOrgs,
                    style: {
                      textAlign: "center",
                    },
                  },
                }}
                variant="standard"
              />
            </Box>
            <Divider sx={{ border: 0 }} />
            {forms}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddExistingOrganization;
