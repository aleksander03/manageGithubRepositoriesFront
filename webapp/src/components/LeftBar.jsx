import * as React from "react";
import { Box, Button, Divider } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import GroupIcon from "@mui/icons-material/Group";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import ArchiveIcon from "@mui/icons-material/Archive";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import classes from "./Layout.module.scss";

export const leftBarItems = [
  { id: "organisations", name: "Organizacje" },
  { id: "sections", name: "Sekcje" },
  { id: "studentsList", name: "Lista studentów" },
  { id: "addFromCsv", name: "Dodaj z CSV" },
  { id: "archive", name: "Archiwum" },
];

const iconButton = (icon) => {
  switch (icon) {
    case "organisations":
      return <GroupWorkIcon />;
    case "sections":
      return <GroupIcon />;
    case "studentsList":
      return <PeopleAltIcon />;
    case "archive":
      return <ArchiveIcon />;
    case "addFromCsv":
      return <GroupAddIcon />;
    default:
      break;
  }
};

const LeftBar = (props) => {
  const setContent = props.setContent;
  const leftBarItemsList = leftBarItems.map((row) => {
    return (
      <Box key={row.name}>
        {row.id === "archive" && <Divider />}
        <Button
          key={row.id}
          className={classes.leftBarButton}
          size="small"
          style={{ background: "transparent", color: "black" }}
          onClick={() => setContent(row.id)}
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
