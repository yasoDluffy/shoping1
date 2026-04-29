import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout';

const Login = () => {
  // --- ההגדרה החשובה ביותר למנהל ---
  // יאסו, שים פה את האימייל שאיתו אתה רוצה להתחבר כמנהל!
  const ADMIN_EMAIL = 'admin@gmail.com'; 

  // המצבים שלנו: 'login' (לקוח), 'register' (לקוח חדש), 'admin' (מנהל)
  const [mode, setMode] = useState('login'); 
  
  const [firstName, setFirstName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoint = mode === 'register' ? 'http://localhost:8080/register' : 'http://localhost:8080/login';
    const payload = mode === 'register' ? { firstName, email, password } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        
        // --- בדיקת הרשאות מנהל (VIP) ---
        if (mode === 'admin') {
          if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('userToken', data.token); // מנהל הוא גם משתמש
            localStorage.setItem('displayName', 'Admin ' + data.displayName);
            alert(`Welcome to the Admin Portal, Boss! 👑`);
            navigate('/admin'); // מעיף אותך ישר למשרד!
            window.location.reload();
            return;
          } else {
            alert("Access Denied: This email does not have Admin privileges! 🛑");
            return; // עוצר הכל, לא נותן לו להיכנס כמנהל
          }
        }

        // --- התחברות/הרשמה של לקוח רגיל ---
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('displayName', data.displayName);
        alert(mode === 'register' ? `Welcome to our store, ${data.displayName}! 🎉` : `Welcome back, ${data.displayName}! 👋`);
        navigate('/'); 
        window.location.reload(); 
        
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Invalid credentials 😕');
      }
    } catch (error) {
      alert('Server error. Is the backend running?');
    }
  };

  return (
    <Layout>
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-5 text-center">
                
                {/* --- בורר המצבים (Tabs) - לקוח או מנהל --- */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="btn-group w-100 shadow-sm" role="group">
                    <button 
                      type="button" 
                      className={`btn ${mode !== 'admin' ? 'btn-dark fw-bold' : 'btn-outline-dark'}`} 
                      onClick={() => setMode('login')}
                    >
                      👤 Customer
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${mode === 'admin' ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning text-dark'}`} 
                      onClick={() => setMode('admin')}
                    >
                      👑 Admin Portal
                    </button>
                  </div>
                </div>

                <hr className="mb-4" />
                
                {/* כותרת משתנה לפי המצב */}
                <h3 className="mb-4 fw-bold" style={{ color: mode === 'admin' ? '#d39e00' : 'black' }}>
                  {mode === 'admin' ? 'Authorized Personnel Only' : 
                   mode === 'register' ? 'Create New Account' : 'Login to Your Account'}
                </h3>
                
                <form onSubmit={handleSubmit}>
                  
                  {mode === 'register' && (
                    <div className="mb-3 text-start">
                      <label className="form-label fw-bold">First Name</label>
                      <input type="text" className="form-control" placeholder="John" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                  )}

                  <div className="mb-3 text-start">
                    <label className="form-label fw-bold">Email Address</label>
                    <input type="email" className="form-control" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  
                  <div className="mb-4 text-start">
                    <label className="form-label fw-bold">Password</label>
                    <input type="password" className="form-control" placeholder="Enter your password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`btn w-100 fw-bold fs-5 shadow mb-3 ${mode === 'admin' ? 'btn-warning text-dark' : 'btn-dark'}`} 
                    style={{ padding: '10px' }}
                  >
                    {mode === 'admin' ? 'Enter System 🔐' : mode === 'register' ? 'Register 📝' : 'Login 🚀'}
                  </button>
                </form>

                {/* אפשרות הרשמה מופיעה רק באזור הלקוחות! (למנהלים לא נרשמים ככה סתם) */}
                {mode !== 'admin' && (
                  <>
                    <hr className="mt-4 mb-4" />
                    <button 
                      type="button"
                      className="btn btn-link text-decoration-none fw-bold" 
                      onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                      style={{ color: '#0d6efd', fontSize: '16px' }}
                    >
                      {mode === 'login' ? "Don't have an account? Sign Up here!" : "Already have an account? Login here!"}
                    </button>
                  </>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;