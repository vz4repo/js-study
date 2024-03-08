const express = require("express");
const path = require("path");
// const logger = require("morgan");
const mysql = require("mysql");
const exp = require("constants");
const PORT = process.env.PORT || 5050;

const app = express();
// const path_src = path.join(__dirname + "/src");

app.use(express.static(path.join(__dirname,"src")))

app.listen(PORT, () => console.log(`[ PORT ]${PORT} + [ DIR ]${__dirname}`))

app.get('/', function(req, res){
    console.log('GET : /');
});

app.get('/test', function(req, res){
    console.log('GET : /test');

    res.send(`THIS IS TEST PAGE | ${express}`);
});

const connection = mysql.createConnection({
    host:'localhost'
    ,user:'root'
    ,password:'root'
    ,database:'dev'
});

// const connectionPool = mysql.createPool({
//     host:'localhost'
//     ,user:'root'
//     ,password:'root'
//     ,database:'dev'
//     ,waitForConnections: true
//     ,connectionLimit: 15
//     ,queueLimit:0
// });

connection.connect((err)=> {
    if(err) throw err;
    console.log('[SUCCESS] Connection ');
})

function fetchData(){
    const query = 'select * from dev.cardgame_record';

    connection.query(query, (err, results) => {
        if(err) throw err;
        console.log('Data fetched', results);
    })
}

fetchData();