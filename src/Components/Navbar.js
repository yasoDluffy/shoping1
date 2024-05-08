import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="container-fluid ">
      <nav className="navbar navbar-expand-lg bg-secondary ">
        <div className="container-fluid ">
          <NavLink to="/" className="nav-link navbar-brand" style={{fontSize:"22px", fontWeight:"bold"}}>
            My Store
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink to="/" className="nav-link text-white" style={{fontSize:"18px", fontWeight:"bold"}}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/products" className="nav-link text-white" style={{fontSize:"18px", fontWeight:"bold"}}>
                  Products
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/categories" className="nav-link text-white" style={{fontSize:"18px", fontWeight:"bold"}}>
                  Categories
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/cart" className="nav-link text-white" style={{fontSize:"18px", fontWeight:"bold"}}>
                  Cart
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/fav" className="nav-link text-white" style={{fontSize:"18px", fontWeight:"bold"}}>
                  Favorites
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about" className="nav-link text-white" style={{fontSize:"18px", fontWeight:"bold"}}>
                  About Us
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
