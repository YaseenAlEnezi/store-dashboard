export const Signout = ({ setUser, navigate }) => {
  setUser({});
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login", { replace: true });
};
