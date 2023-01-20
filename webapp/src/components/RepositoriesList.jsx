import { Box, Divider, Typography } from "@mui/material";
import React from "react";
import LeftBar from "./LeftBar";
import TopBar from "./TopBar";
import classesLayout from "./Layout.module.scss";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

const RepositoriesList = () => {
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;
  const siteName = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <LibraryBooksIcon fontSize="large" sx={{ pr: 1 }} />
      <Typography variant="h5">Lista studentów</Typography>
    </Box>
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
        <Box className={classesLayout.content}></Box>
      </Box>
    </Box>
  );
};

export default RepositoriesList;
