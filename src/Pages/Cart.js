import React, { useContext, useState } from "react";
import GlobalContext from "../Hooks/GlobalContext";
import Layout from "../Components/Layout";
import Product from "../Components/Product";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { itemsInCart, setItemsInCart, products } = useContext(GlobalContext);
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const safeProducts = products || [];
  const safeCart = itemsInCart || [];

  // --- התיקון ה-1: שולפים את המוצרים ומצמידים להם את הכמות (Quantity) ---
  const cartProducts = safeCart.map(cartItem => {
    // מזהים את המוצר לפי ה-ID ששמור באובייקט
    const product = safeProducts.find(p => String(p.id) === String(cartItem.id));
    // אם מצאנו אותו, נחזיר אותו ביחד עם הכמות שלו בעגלה
    return product ? { ...product, quantity: cartItem.quantity } : null;
  }).filter(p => p !== null);

  // --- התיקון ה-2: חישוב סכום כולל שלוקח בחשבון את הכמות! ---
  const totalAmount = cartProducts.reduce((sum, product) => {
    const discountValue = product.discountPercentage || product.discount || 0;
    const salePrice = product.price - (product.price * discountValue) / 100;
    // מכפילים את המחיר הסופי בכמות שהלקוח בחר
    return sum + (salePrice * product.quantity);
  }, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (safeCart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderData = {
      customerDetails: {
        name: customerName,
        address: address,
        paymentMethod: 'Credit Card ending in ' + cardNumber.slice(-4)
      },
      // --- התיקון ה-3: מוסיפים את הכמות לפירוט ההזמנה של המנהל ---
      items: cartProducts.map(p => ({ 
        id: p.id, 
        title: p.title, 
        price: p.price, 
        quantity: p.quantity // <--- המנהל יראה כמה קנו!
      })),
      totalAmount: totalAmount.toFixed(2)
    };

    try {
      const response = await fetch('http://localhost:8080/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`🎉 Success! Your order has been placed.\nOrder ID: ${data.orderId}`);
        setItemsInCart([]); 
        setShowCheckout(false);
        navigate('/products'); 
      } else {
        alert("Server error. Could not place the order.");
      }
    } catch (error) {
      alert("Connection error. Is the server running?");
    }
  };

  return (
    <div>
      <Layout>
        <div className="container mt-5" style={{ minHeight: "70vh" }}>
          <h2 className="text-center mb-5" style={{ fontWeight: 'bold' }}>🛒 Your Shopping Cart</h2>
          
          <div className="row">
            <div className={showCheckout ? "col-md-7" : "col-md-12"}>
              <div className="row">
                {cartProducts.length > 0 ? (
                  cartProducts.map((currProduct, index) => (
                    // ה-currProduct עכשיו מכיל בתוכו גם את currProduct.quantity
                    <Product key={`${currProduct.id}-${index}`} product={currProduct} fromCart={true} />
                  ))
                ) : (
                  <div className="text-center w-100 mt-4">
                    <h4 className="text-muted">Your cart is completely empty.</h4>
                    <p>Go to the Products page to add some amazing items!</p>
                  </div>
                )}
              </div>
            </div>

            {showCheckout && (
              <div className="col-md-5">
                <div className="card shadow-lg p-4" style={{ backgroundColor: '#fcfcfc', border: '2px solid #28a745', borderRadius: '15px' }}>
                  <h3 className="mb-4" style={{ color: '#28a745' }}>Secure Checkout 🔒</h3>
                  <h4 className="mb-3">Total to Pay: <strong>${totalAmount.toFixed(2)}</strong></h4>
                  
                  <form onSubmit={handleCheckout}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Full Name:</label>
                      <input type="text" className="form-control" required placeholder="John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Shipping Address:</label>
                      <input type="text" className="form-control" required placeholder="123 Main St, NY" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-bold">Credit Card Number:</label>
                      <input type="text" className="form-control" required placeholder="1234 5678 9101 1121" minLength="16" maxLength="16" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                    </div>
                    
                    <button type="submit" className="btn btn-success w-100 fw-bold" style={{ fontSize: '18px', padding: '10px' }}>
                      Pay Now 💵
                    </button>
                    <button type="button" className="btn btn-outline-danger w-100 mt-2" onClick={() => setShowCheckout(false)}>
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {!showCheckout && cartProducts.length > 0 && (
            <div className="text-center mt-5 mb-5 p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              <h2 className="mb-3">Total: <strong>${totalAmount.toFixed(2)}</strong></h2>
              <button 
                className="btn btn-success btn-lg fw-bold shadow" 
                onClick={() => setShowCheckout(true)}
                style={{ padding: '15px 40px', fontSize: '20px' }}
              >
                Proceed to Checkout 💳
              </button>
            </div>
          )}

        </div>
      </Layout>
    </div>
  );
};

export default Cart;