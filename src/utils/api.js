// export const URL = "http://localhost:3100/api/v1/admin/";
export const URL = "https://car5x.com/api/v1/admin/";

export const fetcher = async ({ pathname, method, data, auth }) => {
  const res = await fetch(`${URL + pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth && { Authorization: `${localStorage.getItem("token")}` }),
    },
    ...(data && method !== "GET" && { body: JSON.stringify(data) }),
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};
