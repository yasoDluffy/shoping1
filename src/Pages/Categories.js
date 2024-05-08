import React from 'react'
import Layout from '../Components/Layout'
import GlobalContext from "../Hooks/GlobalContext";
import { useContext } from "react";
import { NavLink } from 'react-router-dom';

const Categories = () => {
  const { categories} = useContext(GlobalContext);

  return (
    <div>
      <Layout>
      <div class= "container mt-5">
        <div class= "row">
          {categories.map((category, index)=>{
            return(
              <div className="col">
                <NavLink 
                to={{
                  pathname: `/category/${index}`,
                }}
                >
                <img 
                  src={category.thumbnail}
                  alt={category.name}
                  style={{ width: "250px" }}
                />
                </NavLink>
                  <h5>{category.name}</h5>
              </div>
                
            );
          })}
        </div>
      </div>
      </Layout>
    </div>
  );
};

export default Categories