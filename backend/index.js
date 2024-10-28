const express = require('express');
const app = express();

app.use(express.json());

let products = [];

app.post('/new-product', (req, res) => {
    const productsToSave = req.body.products;

    products = products.concat(productsToSave);

    res.json();
});

app.get('/product/:id', (req, res) => {

    const product = products.find(product => product.id == req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
});

app.get('/products/:limit?', (req, res) => {
    const limit = parseInt(req.params.limit);

    console.log(limit);
    if(isNaN(limit)) {
        return res.json(products)
    }
    
    const limitedProducts = products.slice(0, limit);
    res.json(limitedProducts);
})

app.put('/product/:id', (req, res) => {

    products = products.map(product => {
        if (product.id == req.params.id) {
            return req.body;
        }

        return product
    })

    res.json(req.body);
});

app.delete('/product/:id', (req, res) => {
    products = products.filter(product => product.id != req.params.id)
    res.json();
});


// Start the server
app.listen(8080, () => {
    console.log(`Server is running at http://localhost:8080`);
});