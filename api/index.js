const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
            db.query("INSERT INTO `comptes` VALUES (NULL, ?, ?, ?, '', '');", 
            [ req.body.email, hash, req.body.telephone ], function (err, result) {
                if (err) throw err;
                res.status(200).json(result.insertId)
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

    db.query("SELECT * FROM `comptes` WHERE mail = ?;", [ email ], function (err, resultquery) {

        let hashPassword = resultquery[0].password;
        bcrypt.compare(password, hashPassword, function(err, result) {
            if (result) {
                res.status(200).json(resultquery[0].id);
                
            } else {
                res.status(200).json();
            }
        });
    });
           
})

app.post('/newpassword', (req,res) => {
    let password = req.body.password;
    let token = req.body.token;

    db.query("SELECT * FROM token_password where token = ?;", [ token ], function (err, result) {

        if (err) throw err;

        if (result.length === 0) {
            res.status(404).json();
        } else {
            let id_personne = result[0].id_compte;
            bcrypt.hash(password, 12).then(hash => {
                db.query("UPDATE comptes set password = ? where id = ?;", [ hash, id_personne ], function (err, result) {
                    if (err) throw err;
                    res.status(200).json(result[0]);
                });
            });
        }
    });
});

app.post('/sendpassword', (req,res) => {
    
    let mail = req.body.mail;
    let token = jwt.sign({mail: mail}, crypto.randomBytes(64).toString('hex'), { expiresIn: '86400s' });

    db.query("SELECT * FROM comptes where mail = ?;", [ mail ], function (err, result) {
        if (err) throw err;

        if (result.length > 0) {
            let id_personne = result[0].id;

            let todayDate = new Date();
            let todayDateSql = getSqlDate(todayDate);

            let tomorrowDate = new Date(todayDate);
            tomorrowDate.setDate(tomorrowDate.getDate() + 1)
            let tomorrowDateSql = getSqlDate(tomorrowDate);

            db.query("INSERT INTO `token_password` VALUES (NULL, ?, ?, ?, ?)", [ id_personne, token, todayDateSql, tomorrowDateSql], function (err, result) {
                
                if (err) throw err;

                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    host: "ssl0.ovh.net",
                    port: 465,
                    secure: true, // true for 465, false for other ports
                    auth: {
                        user: "contact@evgdream.com", // generated ethereal user
                        pass: "Benjipsgemailevgdream00!", // generated ethereal password
                    }
                });

                // point to the template folder
                const handlebarOptions = {
                    viewEngine: {
                        partialsDir: path.resolve('./views/'),
                        defaultLayout: false
                    },
                    viewPath: path.resolve('./views/')
                };

                // use a template file with nodemailer
                transporter.use('compile', hbs(handlebarOptions));

                // send mail with defined transport object
                let mailOptions = {
                    from: '"EVGDREAM" <contact@evgdream.com>', // sender address
                    to: req.body.mail, // list of receivers
                    subject: "Réinitialisation de votre mot de passe",  // Subject line
                    template: 'sendpassword',
                    context: {
                        mail: req.body.mail,
                        token: token
                    }
                };

                transporter.sendMail(mailOptions, function(err, info){
                    if (err) throw err;
                    res.status(200).json(result[0]);
                });
            });
        }
        
        
    });
});

app.post('/validationdevis', (req,res) => {

    db.query("INSERT INTO `devis` VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en cours' ?, ?)", [ req.body.id, req.body.date_depart, req.body.date_retour, req.body.ville_depart, req.body.destination, req.body.nb_participant, req.body.budget, req.body.details, req.body.prix, req.body.date_creation, req.body.date_modification ], function (err, result) {
        if (err) throw err;
        let activites = [];
        
        req.body.activites.forEach( function (activite) {
            activites.push([result.insertId, parseInt(activite.id)]);
        });

        db.query("INSERT INTO `devis_activite` (id_devis, id_activite) VALUES ?;", [activites], function(err, result) {
            if (err) throw err;

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: "ssl0.ovh.net",
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: "contact@evgdream.com", // generated ethereal user
                    pass: "Benjipsgemailevgdream00!", // generated ethereal password
                }
            });

            // point to the template folder
            const handlebarOptions = {
                viewEngine: {
                    partialsDir: path.resolve('./views/'),
                    defaultLayout: false
                },
                viewPath: path.resolve('./views/')
            };

            // use a template file with nodemailer
            transporter.use('compile', hbs(handlebarOptions));

            // send mail with defined transport object
            let mailOptions = {
                from: '"EVGDREAM" <contact@evgdream.com>', // sender address
                to: "jonaslatapie@gmail.com, Sayoso@hotmail.fr, benjamin_bitton@hotmail.com, contact@evgdream.com", // list of receivers
                subject: "Nouvelle Demande de devis de" + req.body.mail,  // Subject line
                template: 'devis',
                context: {
                    mail: req.body.mail,
                    tel: req.body.tel,
                    date_depart: req.body.date_depart,
                    date_retour: req.body.date_retour,
                    ville_depart: req.body.ville_depart,
                    destination: req.body.destination,
                    nb_participant: req.body.nb_participant,
                    activites: req.body.activites,
                    budget: req.body.budget,
                    message: req.body.message
                }
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
                res.status(200).json();
            });
        });
    });
});

// Retourne une destianation
app.get('/devis/:id', (req,res) => {
    const id = parseInt(req.params.id);

    db.query("SELECT * FROM `devis` dev, `destination` dest WHERE dev.`destination` = dest.`id` AND dev.`compte_id` = ?;", [ id ], function (err, result) {
        if (err) throw err;
        console.log(result);
        res.status(200).json(result)
      });
})

var getSqlDate = (date) => {
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = date.getFullYear();
    let time = date.toLocaleTimeString();

    return yyyy + '-' + mm + '-' + dd + ' ' + time;
}



app.listen(8080, () => {
    console.log('Serveur à lécoute');
  })