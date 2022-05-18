const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "evgdreacscroot"
  });

const app = express();

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(express.json());

// Retourne toutes les destianations
app.get('/destinations', (req,res) => {

    db.query("SELECT * FROM `destination`;", function (err, result) {
        if (err) throw err;
        res.status(200).json(result)
      });
})

// Retourne une destianation
app.get('/destination/:id', (req,res) => {
    const id = parseInt(req.params.id);

    db.query("SELECT * FROM `destination` WHERE id= ?;", [ id ], function (err, result) {
        if (err) throw err;
        console.log(result[0]);
        res.status(200).json(result[0])
      });
})

// Retourne toutes les activités pour une desti
app.get('/destinationsacti/:id', (req,res) => {
    const id = parseInt(req.params.id);

    db.query("SELECT * FROM `activite` WHERE id_destination = ?;", [ id ], function (err, result) {
        if (err) throw err;
        res.status(200).json(result)
      });
})

// Retourne compte par email
app.get('/getcomptebyemail/:email', (req,res) => {
    const email = req.params.email;

    db.query("SELECT id FROM `comptes` WHERE mail = ?;", [ email ], function (err, result) {
        if (err) throw err;
        res.status(200).json(result[0])
      });
})

// Create compte
app.post('/creationcompte', (req,res) => {
    
    try 
    {
        bcrypt.hash(req.body.password, 12).then(hash => {
            db.query("INSERT INTO `comptes` VALUES (NULL, ?, ?, ?);", 
            [ req.body.email, hash, req.body.telephone ], function (err, result) {
                if (err) throw err;
                console.log(result)
                res.status(200).json(result[0])
            });
        });
    } 
    catch (error) 
    {
        res.status(500).json("ko");
    }      
})

// connexion compte
app.get('/connexioncompte/:email/:password', (req,res) => {
    const email = req.params.email;
    const password = req.params.password;

    db.query("SELECT password FROM `comptes` WHERE mail = ?;", [ email ], function (err, result) {

        let hashPassword = result[0].password;
        bcrypt.compare(password, hashPassword, function(err, result) {
            if (result) {
                db.query("SELECT * FROM `comptes` WHERE mail = ? and password = ?;", 
                [ email, hashPassword ], function (err, result) {
                    if (err) throw err; 
                    res.status(200).json(result[0])
                });
            } else {
                res.status(200).json()
            }
        });
    });
           
})

app.listen(8080, () => {
    console.log('Serveur à lécoute');
  })