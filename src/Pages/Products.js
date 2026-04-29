import React, { useContext, useState } from "react";
import Product from "../Components/Product";
import GlobalContext from "../Hooks/GlobalContext";
import Layout from "../Components/Layout";

const Products = () => {
  const { products, numOfProducts, IncreaseNumOfProducts } = useContext(GlobalContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const allCategories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter((product) => {
    // מנגנון חיפוש חסין כדורים
    const matchesSearch = (product.title || "").toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Layout>
        <div className="container mt-5">
          
          <div className="row mb-5 justify-content-center">
            <div className="col-md-5 mb-3">
              <input 
                type="text" 
                className="form-control border-success shadow-sm" 
                placeholder="🔍 Search products by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '18px', padding: '10px' }}
              />
            </div>
            <div className="col-md-5 mb-3">
              <select 
                className="form-control border-success shadow-sm" 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ fontSize: '18px', padding: '10px' }}
              >
                <option value="">🛒 All Categories</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((el, index) =>
                index + 1 <= numOfProducts ? <Product key={el.id} product={el} /> : null
              )
            ) : (
              <div className="text-center w-100 mt-5">
                <h2>No products matched your search 😕</h2>
                <p>Try searching with different keywords or changing the category.</p>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-center mt-4 mb-5">
            {numOfProducts < filteredProducts.length ? (
              <button className="btn btn-success fw-bold" onClick={IncreaseNumOfProducts} style={{ padding: '10px 30px' }}>
                Load More Products ⬇️
              </button>
            ) : (
              <span className="text-muted fw-bold">End of Products 🏁</span>
            )}
          </div>

        </div>
      </Layout>
    </div>
  );
};

export default Products;