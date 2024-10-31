
const express = require('express');
const jwt = require('jsonwebtoken');

const StorageService = require('./storage-service');
const LogsService = require('./logs-service');

const authenticateJWT = require('./authentication/middlewares');
const initPassport = require('./authentication/passport-init');

require('dotenv').config()

const storageService = new StorageService();
const logsService = new LogsService();

const app = express();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET

app.use(initPassport());

//endpoint to authenticate user and send a JWT token if the user is valid
app.post('/login', async (req, res) => {
    const users = (await storageService.readData('users-db.json')).users;
    const user = users.find(u => u.username === req.body.username && u.password === req.body.password);

    if (user) {
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        logsService.writeLogs('POST', 'user-login');
        res.json({ message: 'User logged in successfully', token: token });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
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

app.get('/product/:id', authenticateJWT, async (req, res) => {

    const products = (await storageService.readData('db.json')).products;

    const product = products.find(product => product.id == req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    logsService.writeLogs('GET', 'get-product-by-id');

    res.json(product);
});

app.get('/products/:limit?', authenticateJWT, async (req, res) => {

    logsService.writeLogs('GET', 'get-products-by-limit');

    const products = (await storageService.readData('db.json')).products;

    const limit = parseInt(req.params.limit);

    if(isNaN(limit)) {
        return res.json(products)
    }
    
    const limitedProducts = products.slice(0, limit);

    res.json(limitedProducts);
})

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

app.delete('/product/:id',authenticateJWT, async (req, res) => {

    const products = (await storageService.readData('db.json')).products;

    const productToDelete = products.find(product => product.id == req.params.id);

    if (!productToDelete) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    updatedProducts = products.filter(product => product.id != req.params.id)

    await storageService.writeData('db.json', { products: updatedProducts });
    
    const archivedProducts = (await storageService.readData('archives.json')).deletedProducts;
    const updatedArchivedProducts = [...archivedProducts, productToDelete];

    await storageService.writeData('archives.json', { deletedProducts: updatedArchivedProducts });

    logsService.writeLogs('DELETE', 'delete-product-by-id-add-to-archive');
    
    res.json();
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