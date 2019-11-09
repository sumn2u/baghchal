var fs = require('fs');
var dbFile = "./.data/sqlite.db";
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);


// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function () {
    if (!exists) {

        db.run('CREATE TABLE Matches (context TEXT, data TEXT, socketId TEXT, friendSocketId TEXT)', console.log);
        // insert default matches
        // db.serialize(function () {
        //db.run('INSERT INTO Matches (context, data) VALUES ("123", "{\'lives\': 3}")', console.log);
        //});
    }
});

module.exports = function (app) {
    app.db = db;
}
