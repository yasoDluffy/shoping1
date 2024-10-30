const express = require('express');
const StorageService = require('./storage-service');
const LogsService = require('./logs-service');

const storageService = new StorageService();
const logsService = new LogsService();

const app = express();

app.use(express.json());

app.post('/new-product', async (req, res) => {
    const productsToSave = req.body.products;

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
})

app.put('/product/:id', async (req, res) => {

    const products = (await storageService.readData('db.json')).products;

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

app.delete('/product/:id', async (req, res) => {

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