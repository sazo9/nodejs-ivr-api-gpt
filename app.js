"use strict";

const express = require('express');
const {main} = require('./Funcoes3')
const app = express();

app.use(express.urlencoded({ extended: false }));

app.get('/teste',  async (req, res) => {

    console.log('subiu');
    main(req, res);

});

module.exports = app;


