import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // מושכים את פרטי המשתמש מהזיכרון (השינוי שלנו: משתמשים ב-displayName)
  const displayName = localStorage.getItem('displayName');
  const userToken = localStorage.getItem('userToken');

  const handleLogout = () => {
    // מוחקים את פרטי המשתמש וזורקים אותו החוצה
    localStorage.removeItem('displayName'); // גם כאן עודכן!
    localStorage.removeItem('userToken');
    navigate('/');
    window.location.reload();
  };

  return (
    // תפריט Bootstrap מתקדם - הופך להמבורגר במסכים קטנים (navbar-expand-lg)
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
      <div className="container">
        
        {/* לוגו החנות */}
        <NavLink className="navbar-brand fw-bold fs-3 text-warning" to="/">My Store</NavLink>
        
        {/* כפתור ההמבורגר שמופיע רק במובייל */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* התוכן של התפריט שמתכווץ ונפתח */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-bold">
            <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/products">Products</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/categories">Categories</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/cart">Cart 🛒</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/favorites">Favorites ❤️</NavLink></li>
          </ul>
          
          {/* אזור אזור ההתחברות והמנהל בצד ימין */}
          <div className="d-flex align-items-center">
            {/* אם המשתמש מחובר, נציג לו שלום וכפתור יציאה (עם displayName במקום username) */}
            {userToken && displayName ? (
              <div className="d-flex align-items-center me-3">
                <span className="text-white me-3 fw-bold">Hello, {displayName}! 👋</span>
                <button className="btn btn-outline-danger btn-sm fw-bold" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              /* אם הוא לא מחובר, נציג כפתור התחברות צהוב יפה */
              <NavLink className="btn btn-warning btn-sm fw-bold text-dark me-3" to="/login">Login 🔐</NavLink>
            )}
            
            <NavLink className="nav-link text-warning fw-bold border border-warning rounded px-2" to="/admin">Admin 👑</NavLink>
          </div>
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;