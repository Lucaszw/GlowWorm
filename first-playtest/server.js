const express = require('express');
var app = express();
app.use('/assets', express.static(__dirname+'/assets'));
app.use('/', express.static(__dirname+'/dist'));
app.listen(8081);