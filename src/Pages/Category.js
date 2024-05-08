import React, { useContext } from "react";
import Layout from "../Components/Layout";
import { useParams } from "react-router-dom";
import GlobalContext from "../Hooks/GlobalContext";
import Product from "../Components/Product";
const Category = () => {
  const { id } = useParams();   //לוקחים את ID עם PARMS שנמצא ב App.js

  const {
      products,
      categories,
    } = useContext(GlobalContext);

 /*אם product שווה ל לאידקס של categories[id ]
אם כן תציג לי את product.category אחרת על תציג כלום*/

    console.log(id);
  return (
    <div>
       
      <Layout>
      <div className="container mt-5">
        
      <h4>{categories[id*1].name}</h4>
          <div className="row">
          {products.map((product) =>
          product.category === categories[id*1].name ? (                          
          <Product product= {product} />
          ) : (
            ""
          )
        )}
        </div>
      </div>
      </Layout>
  </div>
  );
};

export default Category;