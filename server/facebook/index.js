var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());
app.use(cors());

app.get("/", function (request, response) {
    response.json("Welcome to bagchal server");
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

require('dotenv').config();
require('./db.js')(app);
require('./matches.js')(app);