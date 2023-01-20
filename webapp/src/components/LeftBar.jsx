import * as React from "react";
import { Box, Button, Divider } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import GroupIcon from "@mui/icons-material/Group";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import ArchiveIcon from "@mui/icons-material/Archive";
import classes from "./Layout.module.scss";
import { useNavigate } from "react-router-dom";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

export const leftBarItems = [
  { id: "organizations", name: "Organizacje" },
  { id: "teachersList", name: "Lista prowadzących" },
  { id: "studentsList", name: "Lista studentów" },
  { id: "repositoriesList", name: "Lista repozytoriów" },
  { id: "archive", name: "Archiwum" },
];

const iconButton = (icon) => {
  switch (icon) {
    case "organizations":
      return <GroupWorkIcon />;
    case "teachersList":
      return <GroupIcon />;
    case "studentsList":
      return <PeopleAltIcon />;
    case "archive":
      return <ArchiveIcon />;
    case "repositoriesList":
      return <LibraryBooksIcon />;
    default:
      break;
  }
};

const LeftBar = () => {
  const navigate = useNavigate();
  const leftBarItemsList = leftBarItems.map((row) => {
    return (
      <Box key={row.name}>
        {row.id === "archive" && <Divider />}
        <Button
          key={row.id}
          className={classes.leftBarButton}
          size="small"
          style={{ background: "transparent", color: "black" }}
          onClick={() => navigate(`/${row.id}`)}
        >
          {iconButton(row.id)}{" "}
          <p className={classes.leftBarRowName}>{row.name}</p>
        </Button>
        <br />
      </Box>
    );
  });
  return <>{leftBarItemsList}</>;
};

export default LeftBar;
