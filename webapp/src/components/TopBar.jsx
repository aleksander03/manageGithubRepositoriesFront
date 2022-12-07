import React from "react";
import { Box } from "@mui/system";
import { IconButton, Typography } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import SettingsIcon from "@mui/icons-material/Settings";
import classes from "./TopBar.module.scss";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const TopBar = (props) => {
  return (
    <Box className={classes.mainContainer}>
      <Typography variant="h5" className={classes.rightText}>
        {props.siteName}
      </Typography>
      <Box className={classes.rightContainer}>
        <Typography variant="h5" className={classes.option}>
          Imię i nazwisko
        </Typography>
        <IconButton size="large" className={classes.option}>
          <LanguageIcon />
        </IconButton>
        <IconButton size="large" className={classes.option}>
          <NotificationsNoneIcon />
        </IconButton>
        <IconButton size="large" className={classes.option}>
          <SettingsIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
export default TopBar;
