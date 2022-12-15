import React, { useEffect, useState } from "react";

const Organizations = () => {
  const [data, setData] = useState();

  const fetchOrganizations = async () => {
    await fetch("http://localhost:5000/api/addExistingOrganization", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("accessToken"),
        organization: "OrganizacjaProbna",
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((body) => {
        console.log(body);
        return body;
      });
  };

  useEffect(() => {
    setData(fetchOrganizations());
  }, []);
  return <p>Organizacje</p>;
};

export default Organizations;
