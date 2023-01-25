import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Archive from "./Archive";
import Organizations from "./Organizations";
import TeachersList from "./TeachersList";
import StudentsList from "./StudentsList";
import SingleOrganization from "./SingleOrganization";
import SingleSection from "./SingleSection";
import SingUpPage from "./SignUpPage";
import Profile from "./Profile";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/" element={<Organizations />} />
        <Route exact path="/organizations" element={<Organizations />} />
        <Route path="/archive" element={<Archive />} />
        <Route exact path="/teachersList" element={<TeachersList />} />
        <Route exact path="/studentslist" element={<StudentsList />} />
        <Route
          exact
          path="/organization/:id"
          element={<SingleOrganization />}
        />
        <Route exact path="/section/:id" element={<SingleSection />} />
        <Route exact path="/section/form/:code" element={<SingUpPage />} />
        <Route exact path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
