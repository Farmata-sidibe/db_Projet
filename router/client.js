var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var db = require("../database/db");

process.env.SECRET_KEY = 'secret';

router.post('/register', (req, res) => {
    db.client.findOne({
            where: { email: req.body.email }
        })
        .then(client => {
            if (!client) {
                const hash = bcrypt.hashSync(req.body.password, 10);
                req.body.password = hash;
                db.client.create(req.body)
                    .then(itemclient => {
                        res.status(200).json({
                            message: "vous devez validé votre email",
                            email: itemclient.email
                        })
                    })
                    .catch((err) => {
                        res.json(err);
                    });
            } else {
                res.json("cette adresse email est déja utilisé");
            }
        })
        .catch((err) => {
            res.json(err);
        });
});

router.post("/login", (req, res) => {
    db.client.findOne({ where: { email: req.body.email } })
        .then(client => {
            console.log(client)
            if (client.Status === true) {
                if (bcrypt.compareSync(req.body.password, client.password)) {
                    let clientdata = {
                        nom: client.nom,
                        prenom: client.prenom,
                        email: client.email,
                        image: client.image
                    };
                    let token = jwt.sign(clientdata, process.env.SECRET_KEY, {
                        expiresIn: 1440,
                    })
                    res.status(200).json({ token: token })
                } else {
                    res.json("error mail or error password")

                }
            } else {
                res.json({ message: "Vous devez valider votre mail" })
            }
        })
        .catch(err => {
            res.json(err);
        })
})

//on appelle route générique parce que on peut l'utiliser dans plusieurs cas

router.post("/forgetpassword", (req, res) => {
    // ça nous permet de generer le token
    var randtoken = require('rand-token');
    var token = randtoken.generate(16);
    db.client.findOne({
            where: { email: req.body.email }
        })
        .then(client => {
            if (client) {
                client.update({
                        forget: token
                    }).then(item => {
                        var nodemailer = require("nodemailer");

                        var transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: '587',
                            auth: {
                                client: "projetsidibe1@gmail.com",
                                pass: "Projetsidibe@"
                            },
                            secureConnection: 'false',
                            tls: {
                                ciphers: 'SSLv3',
                                rejectUnauthorized: false
                            }

                        });

                        var mailOptions = {
                            from: "projetsidibe1@gmail.com",
                            to: item.email,
                            subject: "Sending Email using Node.js",
                            html: "<a href=http://localhost:3000/client/pwd/" + item.forget + ">Metter a jour le mot de passe</a>"
                        };

                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                res.json(error);
                                console.log(error);
                            } else {
                                console.log("email sent" + info.response);
                                res.json("email sent" + info.response);
                            }
                        });
                    })
                    .catch(err => {
                        res.json(err)
                    })
            } else {
                res.status(404).json("client not found");
            }
        })
        .catch(err => {
            res.json(err)
        })
});

router.post("/updatepassword", (req, res) => {
    db.client.findOne({
            where: { forget: req.body.forget }
        }).then(client => {
            if (client) {
                const hash = bcrypt.hashSync(req.body.password, 10);
                req.body.password = hash;
                client.update({
                        password: req.body.password,
                        forget: null

                    })
                    .then(() => {
                        res.json({
                            message: "votre mot de passe est mis a jour"
                        })
                    })
                    .catch(err => {
                        res.json(err);
                    })
            } else {
                res.json("link not validé");
            }
        })
        .catch(err => {
            res.json(err)
        })
});

router.post("/validemail", (req, res) => {
    db.client.findOne({
            where: { email: req.body.email }
        }).then(client => {
            if (client) {
                if (client.Status !== 1) {
                    client.update({
                            Status: 1
                        })
                        .then(() => {
                            res.json({
                                message: "votre email est validé"
                            })
                        })
                        .catch(err => {
                            res.json(err);
                        })
                } else {
                    res.json("votre mail est déja validé")
                }
            } else {
                res.status(404).json("client not found !!!")
            }
        })
        .catch(err => {
            res.json(err)
        })
});


router.put('/udapte/:id', (req, res) => {
    db.client.findOne({
            where: { id: req.params.id }
        })
        .then(client => {
            if (client) {

                password = bcrypt.hashSync(req.body.password, 10);
                req.body.password = password;
                client.update(req.body)
                    .then(clientitem => {
                        console.log(clientitem);
                        db.client.findOne({
                                where: { id: req.params.id }
                            })
                            .then(client => {
                                let token = jwt.sign(client.dataValues,
                                    process.env.SECRET_KEY, {
                                        expiresIn: 1440
                                    });
                                res.status(200).json({ token: token })
                            })

                        .catch(err => {
                            res.status(402).send(err + 'bad request')
                        })
                    })
                    .catch(err => {
                        res.status(402).send("impossible de mettre à jour le client" + err);
                    })
            } else {
                res.json("client n'est pas dans la base de données")
            }
        })
        .catch(err => {
            res.json(err);
        })
})

router.get("/profile/:id", (req, res) => {
    db.client.findOne({
            where: { id: req.params.id }
        })
        .then(client => {
            if (client) {
                let token = jwt.sign(client.dataValues,
                    process.env.SECRET_KEY, {
                        expiresIn: 1440
                    });
                res.status(200).json({ token: token })
            } else {
                res.json("error le client n'est pas dans la base !!")
            }
        })
        .catch(err => {
            res.json(err)
        })
});


module.exports = router;