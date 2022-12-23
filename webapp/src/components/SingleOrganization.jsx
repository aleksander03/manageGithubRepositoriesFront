import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import LeftBar from "./LeftBar";
import TopBar from "./TopBar";
import classesLayout from "./Layout.module.scss";
import classes from "./SingleOrganization.module.scss";
import { useState } from "react";
import { useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";

const SingleOrganization = () => {
  const data = [];
  const urlParams = useParams();
  const editedOrgId = urlParams.id;
  const siteName = editedOrgId ? "Edycja organizacji" : "Tworzenie organizacji";
  const [professors, setProfessors] = useState([
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
    { name: "Jan", surname: "Janowicz" },
  ]);
  const [sections, setSections] = useState([
    { name: "inf_kat_głupki_rok_4" },
    { name: "inf_kat_głupki_rok_3" },
    { name: "inf_kat_głupki_rok_2" },
    { name: "inf_kat_głupki_rok_1" },
    { name: "inf_kat_głupki_rok_4" },
    { name: "inf_kat_głupki_rok_3" },
    { name: "inf_kat_głupki_rok_2" },
    { name: "inf_kat_głupki_rok_1" },
    { name: "inf_kat_głupki_rok_4" },
    { name: "inf_kat_głupki_rok_3" },
    { name: "inf_kat_głupki_rok_2" },
    { name: "inf_kat_głupki_rok_1" },
  ]);
  const [orgName, setOrgName] = useState(data ? data.name : "");
  const [dense, setDense] = useState(false);

  const professorsList =
    professors.length > 0 ? (
      professors.map((person) => {
        const label = person.name + " " + person.surname;
        return (
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton role={undefined} dense>
              <ListItemIcon>
                <Checkbox />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        );
      })
    ) : (
      <></>
    );

  const sectionsList =
    sections.length > 0 ? (
      sections.map((section) => {
        return (
          <ListItem>
            <ListItemButton role={undefined}>
              <ListItemText primary={section.name} />
            </ListItemButton>
          </ListItem>
        );
      })
    ) : (
      <></>
    );

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
            <Box className={classes.topContainer}>
              <Box>
                <TextField
                  label="Nazwa organizacji"
                  type="search"
                  variant="filled"
                  size="small"
                  InputProps={{ className: classes.topLeftTextFieldInput }}
                  sx={{ pr: "10px" }}
                  value={orgName}
                  onChange={(event) => setOrgName(event.target.value)}
                />
                {editedOrgId ? (
                  <Button variant="contained" size="large">
                    ZMIEŃ
                  </Button>
                ) : (
                  <Button variant="contained" size="large">
                    ZNAJDŹ ONLINE
                  </Button>
                )}
              </Box>
              <Box className={classes.topRightContainer}>
                {editedOrgId && (
                  <>
                    <Box className={classes.topRightButton}>
                      <Button variant="contained" size="large">
                        ARCHIWIZUJ
                      </Button>
                    </Box>
                    <Button variant="contained" size="large" color="error">
                      USUŃ
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            <Box className={classes.contentContainer}>
              <Box className={classes.content}>
                <center>
                  <Typography variant="h5" className={classes.category}>
                    Prowadzący
                  </Typography>
                </center>
                <List dense={dense} className={classes.contentList}>
                  {professorsList}
                </List>
                <Box className={classes.addButton}>
                  <Button variant="contained" size="large">
                    Dodaj
                  </Button>
                </Box>
              </Box>
              <Box className={classes.content}>
                <center>
                  <Typography variant="h5" className={classes.category}>
                    Sekcje
                  </Typography>
                </center>
                <List dense={dense} className={classes.contentList}>
                  {sectionsList}
                </List>
                <Box className={classes.addButton}>
                  <Button variant="contained" size="large">
                    Dodaj
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SingleOrganization;
