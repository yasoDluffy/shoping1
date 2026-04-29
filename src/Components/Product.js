import React, { useContext } from "react";
import GlobalContext from "../Hooks/GlobalContext";
import { NavLink } from "react-router-dom";

const Product = ({ product, fromCart, fromFav }) => {
  const { itemsInCart, setItemsInCart, itemsInFav, setItemsInFav } = useContext(GlobalContext);

  // --- מחיקה טוטאלית מהעגלה ---
  const deleteFromCart = (id) => {
    setItemsInCart(itemsInCart.filter(item => String(item.id) !== String(id)));
  };

  // --- הורדת כמות ב-1 (ואם זה 0, למחוק) ---
  const decreaseQuantity = (id) => {
    const existingItem = itemsInCart.find(item => String(item.id) === String(id));
    if (existingItem && existingItem.quantity > 1) {
      setItemsInCart(itemsInCart.map(item => 
        String(item.id) === String(id) ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      deleteFromCart(id); // אם הכמות ירדה מתחת ל-1, פשוט נמחק את המוצר
    }
  };

  // --- הוספה לעגלה או העלאת כמות ב-1 ---
  const addToCart = (id) => {
    const existingItem = itemsInCart.find(item => String(item.id) === String(id));
    if (existingItem) {
      setItemsInCart(itemsInCart.map(item => 
        String(item.id) === String(id) ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setItemsInCart([...itemsInCart, { id: id, quantity: 1 }]);
    }
  };

  const addToFav = (id) => {
    if (!itemsInFav.includes(id)) setItemsInFav([...itemsInFav, id]);
  };

  const deleteFromFav = (id) => {
    setItemsInFav(itemsInFav.filter(itemId => String(itemId) !== String(id)));
  };

  const discountValue = product.discountPercentage || product.discount || 0;
  const salePrice = (product.price - (product.price * discountValue) / 100).toFixed(2);

  return (
    <div className="col-lg-4 col-md-6 col-sm-12 text-center">
      <div className="card mb-5 shadow-sm" style={{ width: 300, margin: '0 auto', borderRadius: '15px' }}>
        <NavLink to={{ pathname: `/product/${product.id}` }}>
          <img
            src={product.images ? product.images[0] : product.thumbnail}
            className="card-img-top p-3"
            style={{ height: 250, objectFit: "contain" }}
            alt={product.title}
          />
        </NavLink>

        <div className="card-body">
          <h5 className="card-title text-truncate" title={product.title}>{product.title}</h5>
          <h6 className="card-text text-muted mb-3" style={{ fontSize: '14px', height: '40px', overflow: 'hidden' }}>{product.description}</h6>
          
          <div className="mb-3">
            <span className="text-decoration-line-through text-danger me-2">{product.price.toFixed(2)} ILS</span>
            <span className="fw-bold text-success fs-5">{salePrice} ILS</span>
          </div>
          
          {/* --- אזור הכפתורים החכם --- */}
          <div className="d-flex justify-content-center align-items-center gap-2">
            
            {!fromCart ? (
              // אם אנחנו בחנות הרגילה - כפתור "הוסף לעגלה" רגיל
              <button className="btn btn-success fw-bold" onClick={() => addToCart(product.id)}>🛒 Add</button>
            ) : (
              // אם אנחנו בעגלה - פאנל של כמויות!
              <div className="d-flex align-items-center bg-light rounded border p-1">
                <button className="btn btn-sm btn-secondary fw-bold px-2" onClick={() => decreaseQuantity(product.id)}>-</button>
                
                {/* מציגים את הכמות שהוזרקה מהעגלה */}
                <span className="mx-3 fw-bold fs-5" style={{ minWidth: '20px' }}>{product.quantity}</span>
                
                <button className="btn btn-sm btn-success fw-bold px-2" onClick={() => addToCart(product.id)}>+</button>
                
                {/* כפתור פח אשפה למחיקה מהירה של כל הכמות */}
                <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => deleteFromCart(product.id)} title="Remove item">🗑️</button>
              </div>
            )}
            {!fromFav ? (
  // אם אנחנו בחנות הרגילה: מציגים לב ריק להוספה
  <button className="btn btn-outline-danger" onClick={() => addToFav(product.id)} title="Add to Favorites">🤍</button>
) : (
  // אם אנחנו כבר בתוך דף המועדפים: מציגים כפתור פח אשפה/הסרה ברור במקום הלב
  <button className="btn btn-outline-secondary" onClick={() => deleteFromFav(product.id)} title="Remove from Favorites">
    🗑️ Remove
  </button>
)}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;