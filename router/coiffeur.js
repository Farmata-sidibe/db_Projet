var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var db = require("../database/db");

process.env.SECRET_KEY = 'secret';

router.post('/register', (req, res) => {
    db.coiffeur.findOne({
            where: { email: req.body.email }
        })
        .then(coiffeur => {
            if (!coiffeur) {
                const hash = bcrypt.hashSync(req.body.password, 10);
                req.body.password = hash;
                db.coiffeur.create(req.body)
                    .then(itemcoiffeur => {
                        res.status(200).json({
                            message: "vous devez validé votre email",
                            email: itemcoiffeur.email
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
    db.coiffeur.findOne({ where: { email: req.body.email } })
        .then(coiffeur => {
            console.log(coiffeur)
            if (coiffeur.Status === true) {
                if (bcrypt.compareSync(req.body.password, coiffeur.password)) {
                    let coiffeurdata = {
                        nom: coiffeur.nom,
                        prenom: coiffeur.prenom,
                        email: coiffeur.email,
                        image: coiffeur.image
                    };
                    let token = jwt.sign(coiffeurdata, process.env.SECRET_KEY, {
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
    db.coiffeur.findOne({
            where: { email: req.body.email }
        })
        .then(coiffeur => {
            if (coiffeur) {
                coiffeur.update({
                        forget: token
                    }).then(item => {
                        var nodemailer = require("nodemailer");

                        var transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: '587',
                            auth: {
                                coiffeur: "projetsidibe1@gmail.com",
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
                            html: "<a href=http://localhost:3000/coiffeur/pwd/" + item.forget + ">Metter a jour le mot de passe</a>"
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
                res.status(404).json("coiffeur not found");
            }
        })
        .catch(err => {
            res.json(err)
        })
});

router.post("/updatepassword", (req, res) => {
    db.coiffeur.findOne({
            where: { forget: req.body.forget }
        }).then(coiffeur => {
            if (coiffeur) {
                const hash = bcrypt.hashSync(req.body.password, 10);
                req.body.password = hash;
                coiffeur.update({
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
    db.coiffeur.findOne({
            where: { email: req.body.email }
        }).then(coiffeur => {
            if (coiffeur) {
                if (coiffeur.Status !== 1) {
                    coiffeur.update({
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
                res.status(404).json("coiffeur not found !!!")
            }
        })
        .catch(err => {
            res.json(err)
        })
});


router.put('/udapte/:id', (req, res) => {
    db.coiffeur.findOne({
            where: { id: req.params.id }
        })
        .then(coiffeur => {
            if (coiffeur) {

                password = bcrypt.hashSync(req.body.password, 10);
                req.body.password = password;
                coiffeur.update(req.body)
                    .then(coiffeuritem => {
                        console.log(coiffeuritem);
                        db.coiffeur.findOne({
                                where: { id: req.params.id }
                            })
                            .then(coiffeur => {
                                let token = jwt.sign(coiffeur.dataValues,
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
                        res.status(402).send("impossible de mettre à jour le coiffeur" + err);
                    })
            } else {
                res.json("coiffeur n'est pas dans la base de données")
            }
        })
        .catch(err => {
            res.json(err);
        })
})

router.get("/profile/:id", (req, res) => {
    db.coiffeur.findOne({
            where: { id: req.params.id }
        })
        .then(coiffeur => {
            if (coiffeur) {
                let token = jwt.sign(coiffeur.dataValues,
                    process.env.SECRET_KEY, {
                        expiresIn: 1440
                    });
                res.status(200).json({ token: token })
            } else {
                res.json("error le coiffeur n'est pas dans la base !!")
            }
        })
        .catch(err => {
            res.json(err)
        })
});


module.exports = router;