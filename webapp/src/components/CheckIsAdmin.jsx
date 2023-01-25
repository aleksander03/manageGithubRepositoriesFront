export const isAdmin = async (userId) => {
  const serverSite = process.env.REACT_APP_REDIRECT_SERVER_URL;

  const response = await fetch(`${serverSite}/api/isAdmin?userId=${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (response.status === 200) return true;
  else return false;
};
