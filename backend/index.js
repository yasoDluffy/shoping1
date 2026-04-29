
const express = require('express');
const cors = require('cors'); // הוספנו!
const jwt = require('jsonwebtoken');

const StorageService = require('./storage-service');
const LogsService = require('./logs-service');

const authenticateJWT = require('./authentication/middlewares');
const initPassport = require('./authentication/passport-init');

require('dotenv').config()

const storageService = new StorageService();
const logsService = new LogsService();

const app = express();
app.use(cors()); // הוספנו!
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET

app.use(initPassport());

app.post('/login', async (req, res) => {
    const users = (await storageService.readData('users-db.json')).users;
    
    // התיקון: מחפשים לפי אימייל (ולא רגיש לאותיות גדולות/קטנות)
    const user = users.find(u => 
        (u.email || "").toLowerCase() === req.body.email.toLowerCase() && 
        u.password === req.body.password
    );

    if (user) {
        // שומרים בטוקן את האימייל במקום את שם המשתמש
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        logsService.writeLogs('POST', 'user-login');
        
        // בונוס: שולחים חזרה לחזית את השם של המשתמש (או את האימייל אם אין לו שם מוגדר)
        const displayName = user.firstName || user.username || user.email.split('@')[0];
        
        res.json({ message: 'User logged in successfully', token: token, displayName: displayName });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});

app.post('/login', async (req, res) => {
    // ... הקוד ששלחת לי עכשיו ...
});

// 👇 כאן מדביקים את ההרשמה החדשה 👇

app.post('/register', async (req, res) => {
    // ... הקוד של ה-register ששלחתי לך בהודעה הקודמת ...
});

// עדכון עגלת קניות למשתמש מחובר
app.patch('/user/cart', authenticateJWT, async (req, res) => {
    try {
        const data = await storageService.readData('db.json');
        const userId = req.user.id; // מחלצים את ה-ID מהטוקן של המשתמש המחובר
        
        const userIndex = data.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
        
        // מעדכנים את העגלה של המשתמש הספציפי
        data.users[userIndex].cart = req.body.cart;
        
        await storageService.writeData('db.json', data);
        res.json({ message: 'Cart synced with server', cart: data.users[userIndex].cart });
    } catch (error) {
        res.status(500).json({ error: 'Failed to sync cart' });
    }
});


//endpoints to manage products
//all endpoints are protected with JWT token with midleware 
app.post('/new-products', authenticateJWT, async (req, res) => {
    const productsToSave = req.body.products;

    if(!productsToSave.every(product => validateProductData(product))) {
        return res.status(400).json({ error: 'Product Data Not Valid' });
    }

    const products = (await storageService.readData('db.json')).products;

    const updatedProducts = products.concat(productsToSave);

    await storageService.writeData('db.json', { products: updatedProducts });

    logsService.writeLogs('POST', 'new-product');

    res.json();
});

app.get('/product/:id', async (req, res) => {
    const products = (await storageService.readData('db.json')).products;
    const product = products.find(product => product.id == req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    logsService.writeLogs('GET', 'get-product-by-id');
    res.json(product);
});

app.get('/products/:limit?', async (req, res) => {
    logsService.writeLogs('GET', 'get-products-by-limit');
    const products = (await storageService.readData('db.json')).products;
    
    const limit = parseInt(req.params.limit);
    if(isNaN(limit)) {
        return res.json(products)
    }
    
    const limitedProducts = products.slice(0, limit);
    res.json(limitedProducts);
});

app.put('/product/:id', authenticateJWT, async (req, res) => {
    const products = (await storageService.readData('db.json')).products;

    if(!products.some(p => p.id == req.params.id) || !validateProductData(req.body)) {
        return res.status(404).json({ error: 'Product Data Not Valid' });
    }

    const updatedProducts = products.map(product => {
        if (product.id == req.params.id) {
            return req.body;
        }

        return product
    })

    await storageService.writeData('db.json', { products: updatedProducts });

    logsService.writeLogs('PUT', 'update-product-by-id');

    res.json(req.body);
});

// --- פקודת מחיקה חכמה (מעבירה לארכיון במקום להשמיד) ---
app.delete('/product/:id', authenticateJWT, async (req, res) => {
    try {
        const data = await storageService.readData('db.json');
        
        // מוצאים את המוצר
        const productIndex = data.products.findIndex(p => String(p.id) === String(req.params.id));
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // מוציאים אותו מרשימת המוצרים הפעילים
        const deletedProduct = data.products.splice(productIndex, 1)[0];
        
        // --- התיקון הקריטי: שומרים אותו בארכיון! ---
        if (!data.archive) {
            data.archive = [];
        }
        data.archive.push(deletedProduct);
        // ------------------------------------------

        await storageService.writeData('db.json', data);
        logsService.writeLogs('DELETE', `delete-product-${req.params.id}`);
        
        res.json({ message: 'Product successfully moved to archive', product: deletedProduct });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: 'Internal server error during deletion' });
    }
});
// --- פקודת שחזור מהארכיון למלאי (גרסה חסינת-כדורים) ---
app.post('/restore/:id', authenticateJWT, async (req, res) => {
    try {
        const data = await storageService.readData('db.json');
        
        // הגנה 1: אם בטעות נמחק הארכיון ממסד הנתונים, ניצור אותו מחדש
        if (!data.archive) {
            data.archive = [];
        }
        
        // הגנה 2: ממירים את שני ה-ID לטקסט כדי שהשוואה תמיד תצליח
        const archiveIndex = data.archive.findIndex(p => String(p.id) === String(req.params.id));
        
        if (archiveIndex === -1) {
            return res.status(404).json({ error: 'Product not found in archive' });
        }
        
        // גוזרים אותו מהארכיון ושומרים בצד
        const productToRestore = data.archive.splice(archiveIndex, 1)[0];
        
        // הגנה 3: מוודאים שיש מערך מוצרים, ומדביקים אותו למעלה
        if (!data.products) data.products = [];
        data.products.unshift(productToRestore);
        
        // שומרים את מסד הנתונים
        await storageService.writeData('db.json', data);
        logsService.writeLogs('POST', `restore-product-${req.params.id}`);
        
        res.json({ message: 'Product restored successfully', product: productToRestore });
    } catch (error) {
        console.error("Restore Error:", error);
        res.status(500).json({ error: 'Internal server error during restore' });
    }
});

// --- פקודת שחזור מהארכיון למלאי ---
app.post('/restore/:id', authenticateJWT, async (req, res) => {
    try {
        const data = await storageService.readData('db.json');
        
        // מחפשים את המוצר בארכיון
        const archiveIndex = data.archive.findIndex(p => p.id == req.params.id);
        if (archiveIndex === -1) {
            return res.status(404).json({ error: 'Product not found in archive' });
        }
        
        // גוזרים אותו מהארכיון ושומרים בצד
        const productToRestore = data.archive.splice(archiveIndex, 1)[0];
        
        // מדביקים אותו חזרה בראש רשימת המוצרים הפעילים
        data.products.unshift(productToRestore);
        
        // שומרים את מסד הנתונים
        await storageService.writeData('db.json', data);
        logsService.writeLogs('POST', `restore-product-${req.params.id}`);
        
        res.json({ message: 'Product restored successfully', product: productToRestore });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error during restore' });
    }
});

// -------- פקודות חדשות למנהל (יאסו) --------

// 1. פקודה: להביא את רשימת המשתמשים
app.get('/users', authenticateJWT, async (req, res) => {
    const users = (await storageService.readData('users-db.json')).users;
    res.json(users);
});

// 2. פקודה: להביא את רשימת המוצרים שנמחקו מהארכיון
app.get('/archive', authenticateJWT, async (req, res) => {
    const archiveData = await storageService.readData('archives.json');
    res.json(archiveData.deletedProducts || []);
});

// --------------------------------------------

// ==========================================
// --- מערכת קופה והזמנות (Checkout System) ---
// ==========================================

// 1. פקודה ללקוחות: קבלת הזמנה חדשה ושמירתה במסד הנתונים
app.post('/orders', async (req, res) => {
    try {
        const data = await storageService.readData('db.json');
        
        // הגנה: אם אין עדיין טבלת הזמנות במסד הנתונים, ניצור אותה
        if (!data.orders) {
            data.orders = [];
        }
        
        // מייצרים את התבנית של ההזמנה החדשה
        const newOrder = {
            id: 'ORD-' + Date.now(), // יוצר מספר הזמנה ייחודי, למשל: ORD-168439201
            date: new Date().toLocaleString('en-GB'), // תאריך ושעה מדויקים
            customerDetails: req.body.customerDetails, // שם, כתובת, אמצעי תשלום
            items: req.body.items, // מערך המוצרים שהוא קנה
            totalAmount: req.body.totalAmount, // סך הכל לתשלום
            status: 'Pending' // סטטוס התחלתי: ממתין לאישור מנהל
        };
        
        // דוחפים את ההזמנה החדשה לראש הרשימה
        data.orders.unshift(newOrder);
        
        // שומרים את מסד הנתונים
        await storageService.writeData('db.json', data);
        logsService.writeLogs('POST', `new-order-${newOrder.id}`);
        
        res.json({ message: 'Order placed successfully!', orderId: newOrder.id });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ error: 'Internal server error while placing order' });
    }
});

// 2. פקודה למנהל: משיכת כל ההזמנות כדי להציג בלוח הבקרה
app.get('/orders', authenticateJWT, async (req, res) => {
    try {
        const data = await storageService.readData('db.json');
        // אם אין הזמנות נחזיר רשימה ריקה, אחרת נחזיר את כל ההזמנות
        res.json(data.orders || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Start the server
app.listen(8080, () => {
    console.log(`Server is running at http://localhost:8080`);
});



 //check that the product being updated is valid
 function validateProductData(product) {
    if (!product?.id || !product?.title || !product?.discount || !product?.price || !product?.rating || !product?.brand || !product?.category) {
        return false
    }

    return true
}