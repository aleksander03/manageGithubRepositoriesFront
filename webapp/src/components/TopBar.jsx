import React from "react";
import { Box } from "@mui/system";
import { Navigate, useNavigate } from "react-router-dom";
import { IconButton, Typography } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import SettingsIcon from "@mui/icons-material/Settings";
import classes from "./TopBar.module.scss";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "./GlobalCssMenu.css";

const TopBar = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn !== "true") return <Navigate to="/login" />;

  const logout = () => {
    localStorage.setItem("loggedIn", false);
    localStorage.setItem("userId", null);
    localStorage.setItem("accessToken", null);
    handleClose();
    navigate("/login");
  };

  const profile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const name = localStorage.getItem("name")
    ? localStorage.getItem("name")
    : "Imię";

  const surname = localStorage.getItem("surname")
    ? localStorage.getItem("surname")
    : "Nazwisko";

  return (
    <Box className={classes.mainContainer}>
      <Typography variant="h5" className={classes.rightText}>
        {props.siteName}
      </Typography>
      <Box className={classes.rightContainer}>
        <Typography variant="h5" className={classes.option}>
          {name} {surname}
        </Typography>
        <IconButton
          size="large"
          className={classes.option}
          style={{ background: "transparent" }}
          onClick={handleMenu}
        >
          <SettingsIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={profile}>Profil</MenuItem>
          <MenuItem onClick={logout}>Wyloguj się</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};
export default TopBar;
