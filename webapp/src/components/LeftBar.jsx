import * as React from "react";
import { Box, Button, Divider } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import GroupIcon from "@mui/icons-material/Group";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import ArchiveIcon from "@mui/icons-material/Archive";
import classes from "./Layout.module.scss";
import { useNavigate } from "react-router-dom";

const iconButton = (icon, isActive) => {
  switch (icon) {
    case "organizations":
      return isActive ? <GroupWorkIcon color="warning" /> : <GroupWorkIcon />;
    case "teachersList":
      return isActive ? <GroupIcon color="primary" /> : <GroupIcon />;
    case "studentsList":
      return isActive ? <PeopleAltIcon color="secondary" /> : <PeopleAltIcon />;
    case "archive":
      return isActive ? <ArchiveIcon color="action" /> : <ArchiveIcon />;
    default:
      break;
  }
};

const LeftBar = (props) => {
  const navigate = useNavigate();
  const chosenItem = props.chosenItem;
  const leftBarItems = [
    {
      id: "organizations",
      name: "Organizacje",
      isActive: chosenItem === "organizations" ? true : false,
      color: "#ed6c02",
    },
    {
      id: "teachersList",
      name: "Lista prowadzących",
      isActive: chosenItem === "teachersList" ? true : false,
      color: "#1976d2",
    },
    {
      id: "studentsList",
      name: "Lista studentów",
      isActive: chosenItem === "studentsList" ? true : false,
      color: "#9c27b0",
    },
    {
      id: "archive",
      name: "Archiwum",
      isActive: chosenItem === "archive" ? true : false,
      color: "#000000",
    },
  ];

  const leftBarItemsList = leftBarItems.map((row) => {
    return (
      <Box key={row.name}>
        {row.id === "archive" && <Divider />}
        <Button
          key={row.id}
          className={classes.leftBarButton}
          size="small"
          style={{
            background: "transparent",
            color: row.isActive ? row.color : "black",
          }}
          onClick={() => navigate(`/${row.id}`)}
          variant="text"
        >
          {iconButton(row.id, row.isActive)}{" "}
          <p className={classes.leftBarRowName}>{row.name}</p>
        </Button>
        <br />
      </Box>
    );
  });
  return <>{leftBarItemsList}</>;
};

export default LeftBar;
