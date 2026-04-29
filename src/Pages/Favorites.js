import React, { useContext } from "react";
import GlobalContext from "../Hooks/GlobalContext";
import Layout from "../Components/Layout";
import Product from "../Components/Product";

const Favorites = () => {
  const { products, itemsInFav } = useContext(GlobalContext);

  const safeProducts = products || [];
  
  // התיקון הקריטי: אנחנו משתמשים ב-Set כדי למחוק כפילויות היסטוריות מהזיכרון
  const safeFavs = [...new Set(itemsInFav || [])];

  const favoriteProducts = safeFavs.map(id => 
    safeProducts.find(p => String(p.id) === String(id))
  ).filter(p => p !== undefined);

  return (
    <Layout>
      <div className="container mt-5" style={{ minHeight: "70vh" }}>
        <h2 className="text-center mb-5" style={{ fontWeight: 'bold' }}>❤️ Your Favorite Items</h2>
        
        <div className="row">
          {favoriteProducts.length > 0 ? (
            favoriteProducts.map((product) => (
              <Product key={product.id} product={product} fromFav={true} />
            ))
          ) : (
            <div className="text-center w-100 mt-5">
              <h1 style={{ fontSize: '4rem', color: '#ccc' }}>🤍</h1>
              <h4 className="text-muted mt-3">You haven't added any favorites yet.</h4>
              <p>Go to the Products page and click the heart icon on items you love!</p>
            </div>
          )}
        </div>
        
      </div>
    </Layout>
  );
};

export default Favorites;