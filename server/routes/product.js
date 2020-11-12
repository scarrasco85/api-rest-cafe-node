const express = require('express');
const { verifyToken } = require('../middlewares/authentication');
let Product = require('../models/product');

let app = express();

//=================================================================
//  /produtcs: Obener todos los productos
//=================================================================
// populate: usuario, categoria
// paginado


//=================================================================
//  /produtcs: Get a product by ID
//=================================================================
// populate: usuario, categoria


//=================================================================
//  /produtcs: Create a product
//=================================================================
// grabar usuario
//grabar categoria: del listado de categorías


//=================================================================
//  /produtcs: Update a product by ID
//=================================================================
// populate: usuario, categoria

//===============================================================================================================
//  /produtcs: Delete a product by ID - It does not delete from the database, it modifies the disabled property
//===============================================================================================================
// populate: usuario, categoria
module.exports = app;