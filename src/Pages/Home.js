import React, { useContext } from "react";
import Layout from "../Components/Layout";
import Carousel from "react-grid-carousel";
import GlobalContext from "../Hooks/GlobalContext";
import { NavLink } from "react-router-dom";
import Product from "../Components/Product";

const Home = () => {
  const { randomProducts, categories, products } = useContext(GlobalContext);
  return (
    <div>
      <Layout>
        <div className="container mt-5" style={{ minHeight: "72vh" }}>
          <h4 className="text-white bg-success py-3 ps-2" style={{borderRadius: '5px'}}>Products</h4>
      {/*Products carousel*/}
          <Carousel
            cols={5}
            rows={1}
            gap={2}
            showDots
            loop
            autoplay={3000}
            responsiveLayout={[
              { breakpoint: 1200, cols: 4 },
              { breakpoint: 992, cols: 3 },
              { breakpoint: 768, cols: 2 },
              { breakpoint: 576, cols: 1 },
            ]}
          >
            {randomProducts.map((product, index) => (
              <Carousel.Item key={index}>
                <NavLink
                  to={{
                    pathname: `/product/${product.id}`,
                  }}
                >
                  <img
                    src={product.thumbnail}
                    key={index}
                    alt={product.title}
                    style={{ width: "200px", height: "200px" }}
                  />
                </NavLink>
              </Carousel.Item>
            ))}
          </Carousel>
            {/*Categories carousel*/}


          <h4 className= "mt-5 text-white bg-success py-3 ps-2" style={{borderRadius: '5px'}}>Categories</h4>
          <Carousel
            cols={5}//עמודות
            rows={1}//שורות
            gap={2}//מרווח בין העמודות
            showDots//נקודות מתחת לקרוסלה
            loop //סיבוב
            autoplay={3000} //מחכה 3 שניות ואז מסתובב
            responsiveLayout={[//רספונסיביות של הקרוסלה שתתאים למסכים שונים
              { breakpoint: 1200, cols: 4 },
              { breakpoint: 992, cols: 3 },
              { breakpoint: 768, cols: 2 },
              { breakpoint: 576, cols: 1 },
            ]}
          >
            {categories.map((category, index) => (
              <Carousel.Item key={index}>
                <NavLink
                  to={{
                    pathname: `/category/${index}`,
                  }}
                >
                
                  <img
                    src={category.thumbnail}
                    key={index}
                    alt={category.name}
                    style={{ width: "200px", height: "200px" }}
                  />
                  </NavLink>
                  <h5>{category.name}</h5>
              </Carousel.Item>
            ))}
          </Carousel>
          <h4 className="mt-5 text-white bg-success py-3 ps-2" style={{borderRadius: '5px'}}>Featured </h4>
          <div className="row">
            {
              products.map((product)=>
                product.discountPercentage >= 15 &&
                <Product product={product}/> //תמיד true

              )
            }
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Home;
