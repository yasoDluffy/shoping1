import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = (props) => {
  return (
    <div>
      
      <div style={{backgroundColor: "#ECECEC"}}>
      <Navbar />
      {props.children}
      <Footer />
      </div>
    </div>
  );
};

export default Layout;
