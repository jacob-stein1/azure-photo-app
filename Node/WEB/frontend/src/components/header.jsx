import React from "react";

function Header() {
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "black",
    color: "white",
    padding: "10px 30px",
  };

  return (
    <div style={headerStyle}>
      <h1>Jacob's Photo App</h1>
    </div>
  );
}

export default Header;
