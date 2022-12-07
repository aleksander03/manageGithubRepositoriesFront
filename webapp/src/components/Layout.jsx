import * as React from "react";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import Box from "@mui/material/Box";
import classes from "./Layout.module.scss";
import { Divider } from "@mui/material";
import TopBar from "./TopBar";
import Content from "./Content";
import LeftBar, { leftBarItems } from "./LeftBar";

const Layout = () => {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("loggedIn"));
  const [content, setContent] = useState(
    localStorage.getItem("content")
      ? localStorage.getItem("content")
      : "organisations"
  );

  if (!loggedIn) return <Navigate to="/login" />;

  const changeContent = (newContent) => {
    localStorage.setItem("content", newContent);
    setContent(newContent);
  };

  const siteName = leftBarItems.find((item) => {
    return item.id === content;
  });

  return (
    <Box className={classes.mainContainer}>
      <Box className={classes.topBar}>
        <TopBar siteName={siteName.name} />
      </Box>
      <Divider />
      <Box className={classes.contentContainer}>
        <Box className={classes.leftBar}>
          <LeftBar setContent={changeContent} />
        </Box>
        <Box className={classes.content}>
          <Content content={content} />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
