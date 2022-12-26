import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Login";
import AddFromCsv from "./AddFromCsv";
import Archive from "./Archive";
import Organizations from "./Organizations";
import Sections from "./Sections";
import StudentsList from "./StudentsList";
import SingleOrganization from "./SingleOrganization";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/" element={<Organizations />} />
        <Route exact path="/organizations" element={<Organizations />} />
        <Route exact path="/addfromcsv" element={<AddFromCsv />} />
        <Route exact path="/archive" element={<Archive />} />
        <Route exact path="/sections" element={<Sections />} />
        <Route exact path="/studentslist" element={<StudentsList />} />
        <Route
          exact
          path="/organizations/new"
          element={<SingleOrganization />}
        />
        <Route
          exact
          path="/organization/:id"
          element={<SingleOrganization />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
