const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const lodash = require('lodash');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/productDB", {useNewUrlParser:true, useUnifiedTopology:true});

const productSchema = new mongoose.Schema({
    title: String,
    img: Array,
    rating: Number,
    price: Number,
    sold_total: Number,
    review_total: Number,
    description: String,
    product_id: Number,
    shop_id: Number,
    item_status: String
});

const Product = mongoose.model('Product', productSchema);
Product.exists({product_id: 123}, (err, res) => console.log(res)); 

const fetchProductDetail = (itemId) => {
    fetch(`https://shopee.co.id/api/v2/item/get?itemid=${itemId}&shopid=278132533`).then(response => response.json()).then(data => {
        Product.exists({product_id:data.item.itemid}, (err,res) => {
            if (!res) {
                const newProduct = new Product({
                    title: data.item.name,
                    img: data.item.images,
                    rating: data.item.item_rating.rating_star,
                    price: data.item.price/100000,
                    sold_total: data.item.historical_sold,
                    review_total: data.item.item_rating.rating_count[0],
                    description: data.item.description,
                    product_id: data.item.itemid,
                    shop_id: data.item.shopid,
                    item_status: data.item.item_status
                });
                newProduct.save((err,res) => console.log(res));
            }
        });
    });
}

fetch('https://shopee.co.id/api/v2/search_items/?by=pop&limit=30&match_id=278132533&newest=0&only_soldout=1&order=desc&page_type=shop&version=2')
.then(response => response.json()).then(data => {
    const productArray = data.items;

    productArray.forEach(x => {
        fetchProductDetail(x.itemid);
    })
});

app.get('/', (req, res) => {
    Product.find({}, (err, value) => {
        res.render('content.ejs', {productImage: value, imgUrl: "https://cf.shopee.co.id/file/"});
    })
});

app.post('/', (req, res) => {

})

app.listen('3000', (req, res) => {
    console.log("running at port 3000");
});