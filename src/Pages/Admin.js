import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]); 
  // --- הזיכרון החדש: שומר את ההזמנות מהשרת ---
  const [orders, setOrders] = useState([]); 
  
  const [activeTab, setActiveTab] = useState('products'); 
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);

  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const allCategories = [...new Set(products.map(p => p.category))];

  const filteredProductsForTable = products.filter(product =>
    (product.title || "").toLowerCase().includes(adminSearchQuery.trim().toLowerCase())
  );

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Access Denied: Admin token missing. Redirecting to login...');
      navigate('/login');
      return;
    }

    fetch('http://localhost:8080/users', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json()).then(data => setUsers(data));

    fetch('http://localhost:8080/products/1000', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json()).then(data => setProducts(data));

    fetch('http://localhost:8080/archive', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json()).then(data => setArchivedProducts(data));

    // --- שולפים את ההזמנות החדשות מהשרת ---
    fetch('http://localhost:8080/orders', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json()).then(data => setOrders(data));

  }, [navigate]);

  const handleDeleteProduct = async (productId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this product?");
    if (!isConfirmed) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:8080/product/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const deletedProduct = products.find(p => p.id === productId);
        setProducts(products.filter(product => product.id !== productId));
        if (deletedProduct) setArchivedProducts([...archivedProducts, deletedProduct]);
        alert("Product successfully deleted and moved to archive!");
      }
    } catch (error) {
      alert("Server error during deletion.");
    }
  };

  const handleRestoreProduct = async (productId) => {
    const isConfirmed = window.confirm("Restore this product to the active inventory?");
    if (!isConfirmed) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:8080/restore/${productId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const restoredData = await response.json();
        setArchivedProducts(archivedProducts.filter(p => p.id !== productId));
        setProducts([restoredData.product, ...products]);
        alert("Magic! ✨ The product has been restored to the store.");
      } else {
        alert("Failed to restore the product. It might not exist in the archive.");
      }
    } catch (error) {
      alert("Server communication error during restore.");
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setNewTitle(product.title);
    setNewPrice(product.price);
    setNewImage(product.images ? product.images[0] : product.thumbnail);
    setNewCategory(product.category);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault(); 
    const token = localStorage.getItem('adminToken');

    if (editingProductId) {
      const existingProduct = products.find(p => p.id === editingProductId);
      const updatedProduct = {
        ...existingProduct,
        title: newTitle, 
        price: Number(newPrice),
        thumbnail: newImage,
        category: newCategory,
        discount: existingProduct.discountPercentage || existingProduct.discount || 10,
        rating: existingProduct.rating || 5,
        brand: existingProduct.brand || 'Yasso Boutique'
      };

      try {
        const response = await fetch(`http://localhost:8080/product/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(updatedProduct)
        });

        if (response.ok) {
          setProducts(products.map(p => p.id === editingProductId ? updatedProduct : p));
          alert('Success! Product updated.');
          resetForm();
        } else {
          alert('Server rejected the update. Validation failed.');
        }
      } catch (error) {
        alert('Communication error while updating product.');
      }
    } else {
      const productToAdd = {
        id: Date.now().toString(), 
        title: newTitle,
        price: Number(newPrice),
        thumbnail: newImage || 'https://dummyimage.com/150x150/cccccc/000000&text=New+Product', 
        discount: 10,
        rating: 5,
        brand: 'Yasso Boutique',
        category: newCategory || 'general'
      };

      try {
        const response = await fetch('http://localhost:8080/new-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ products: [productToAdd] }) 
        });

        if (response.ok) {
          setProducts([productToAdd, ...products]);
          alert('Success! Product added.');
          resetForm();
        } else {
          alert('Error: Server refused to save the new product.');
        }
      } catch (error) {
        alert('Communication error while adding product.');
      }
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewPrice('');
    setNewImage('');
    setNewCategory('');
    setEditingProductId(null);
    setShowForm(false);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center' }}>Admin Dashboard 👑</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '30px 0', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('products')} style={{ padding: '10px 20px', fontSize: '18px', backgroundColor: activeTab === 'products' ? 'black' : 'gray', color: 'white', cursor: 'pointer', borderRadius: '5px' }}>Manage Products 📦</button>
        {/* --- הכפתור החדש למסך ההזמנות --- */}
        <button onClick={() => setActiveTab('orders')} style={{ padding: '10px 20px', fontSize: '18px', backgroundColor: activeTab === 'orders' ? '#28a745' : 'gray', color: 'white', cursor: 'pointer', borderRadius: '5px' }}>Customer Orders 📋</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '10px 20px', fontSize: '18px', backgroundColor: activeTab === 'users' ? 'black' : 'gray', color: 'white', cursor: 'pointer', borderRadius: '5px' }}>User List 👥</button>
        <button onClick={() => setActiveTab('archive')} style={{ padding: '10px 20px', fontSize: '18px', backgroundColor: activeTab === 'archive' ? 'darkred' : 'gray', color: 'white', cursor: 'pointer', borderRadius: '5px' }}>Archive 🗑️</button>
      </div>

      <hr />

      <div>
        {/* --- מסך ההזמנות החדש! --- */}
        {activeTab === 'orders' && (
          <div>
            <h3>Recent Orders ({orders.length}):</h3>
            {orders.length === 0 ? <p>No orders have been placed yet.</p> : (
              <table style={{ width: '100%', marginTop: '20px', textAlign: 'left', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Order ID & Date</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Customer Details</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Items Purchased</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Total</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{order.id}</strong><br/>
                        <small className="text-muted">{order.date}</small>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: 'blue' }}>{order.customerDetails.name}</strong><br/>
                        📍 {order.customerDetails.address}<br/>
                        💳 {order.customerDetails.paymentMethod}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '14px' }}>
                          {order.items.map((item, idx) => (
                            <li key={idx}>{item.title} <span style={{ color: 'green' }}>(${item.price})</span></li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '18px' }}>
                        ${order.totalAmount}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: '#ffc107', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* --- שאר המסכים נשארו בדיוק אותו דבר --- */}
        {activeTab === 'users' && (
          <div>
            <h3>Registered Users:</h3>
            <ul>
              {users.map((user) => (
                <li key={user.id} style={{ fontSize: '18px', margin: '10px 0' }}><strong>Username:</strong> {user.username} | <strong>Password:</strong> {user.password}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Store Inventory ({products.length} items):</h3>
              <button onClick={() => { if (showForm) { resetForm(); } else { setShowForm(true); } }} style={{ backgroundColor: showForm ? 'red' : 'green', color: 'white', padding: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                {showForm ? 'Cancel ❌' : '+ Add New Product'}
              </button>
            </div>
            
            {showForm && (
              <form onSubmit={handleSubmitForm} style={{ backgroundColor: editingProductId ? '#e6f7ff' : '#eef8ee', padding: '20px', marginTop: '15px', border: `2px solid ${editingProductId ? 'blue' : 'green'}`, borderRadius: '5px' }}>
                <h4>{editingProductId ? '✏️ Edit Existing Product:' : '✨ Enter New Product Details:'}</h4>
                <input type="text" placeholder="Product Name" required value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ margin: '5px', padding: '8px' }} />
                <input type="number" placeholder="Price (ILS)" required value={newPrice} onChange={e => setNewPrice(e.target.value)} style={{ margin: '5px', padding: '8px' }} />
                <input type="text" placeholder="Image URL (Optional)" value={newImage} onChange={e => setNewImage(e.target.value)} style={{ margin: '5px', padding: '8px', width: '250px' }} />
                <input type="text" list="category-list" placeholder="🔍 Search or type category..." required value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ margin: '5px', padding: '8px', width: '220px' }} />
                <datalist id="category-list">{allCategories.map(cat => (<option key={cat} value={cat} />))}</datalist>
                <button type="submit" style={{ backgroundColor: 'black', color: 'white', padding: '8px 15px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}>
                  {editingProductId ? 'Update Server 💾' : 'Save to Server 💾'}
                </button>
              </form>
            )}
            
            <div style={{ marginTop: '30px', marginBottom: '10px' }}>
              <input type="text" placeholder="🔍 Search products in inventory to edit or delete..." value={adminSearchQuery} onChange={(e) => setAdminSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid #ccc', borderRadius: '5px' }} />
            </div>

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Image</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Product Name</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Price</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductsForTable.map((product) => (
                  <tr key={product.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}><img src={product.thumbnail || (product.images && product.images[0])} alt={product.title} style={{ width: '50px' }} /></td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{product.title}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>${product.price.toFixed(2)}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <button onClick={() => handleEditClick(product)} style={{ color: 'blue', marginRight: '10px', cursor: 'pointer', fontWeight: 'bold', border: 'none', background: 'none' }}>Edit ✏️</button>
                      <button onClick={() => handleDeleteProduct(product.id)} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', border: 'none', background: 'none' }}>Delete 🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'archive' && (
          <div>
            <h3>Deleted Products ({archivedProducts.length}):</h3>
            {archivedProducts.length === 0 ? <p>The archive is currently empty.</p> : (
              <table style={{ width: '100%', marginTop: '20px', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9e6e6' }}>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Image</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Product Name</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedProducts.map((product, index) => (
                    <tr key={index}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}><img src={product.thumbnail || (product.images && product.images[0])} alt={product.title} style={{ width: '50px', filter: 'grayscale(100%)' }} /></td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd', textDecoration: 'line-through' }}>{product.title}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                        <button onClick={() => handleRestoreProduct(product.id)} style={{ color: 'green', cursor: 'pointer', fontWeight: 'bold', border: 'none', background: 'none', fontSize: '16px' }}>
                          Restore ♻️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;