import React from "react";
import Organizations from "./Organizations";
import Sections from "./Sections";
import StudentsList from "./StudentsList";
import AddFromCsv from "./AddFromCsv";
import Archive from "./Archive";

const Content = () => {
  const content = localStorage.getItem("content");
  switch (content) {
    //leftBarItems from Layout.jsx
    case "organizations":
      return <Organizations />;
    case "sections":
      return <Sections />;
    case "studentsList":
      return <StudentsList />;
    case "addFromCsv":
      return <AddFromCsv />;
    case "archive":
      return <Archive />;
    default:
      return <Organizations />;
  }
};

export default Content;
