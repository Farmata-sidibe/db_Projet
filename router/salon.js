const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var db = require("../database/db");
const { salon } = require("../database/db");

process.env.SECRET_KEY = 'secret';


router.post('/register', (req, res) => {
    db.salon.findOne({
            where: { email: req.body.email }
        })
        .then(salon => {
            if (!salon) {
                const hash = bcrypt.hashSync(req.body.password, 10);
                req.body.password = hash;
                db.salon.create(req.body)
                    .then(itemsalon => {
                        res.status(200).json({
                            message: "vous devez validé votre email",
                            email: itemsalon.email
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
    db.salon.findOne({ where: { email: req.body.email } })
        .then(salon => {
            console.log(salon)
            if (salon.Status === true) {
                if (bcrypt.compareSync(req.body.password, salon.password)) {
                    let salondata = {
                        nom: salon.nom,
                        prenom: salon.prenom,
                        email: salon.email,
                        image: salon.image
                    };
                    let token = jwt.sign(salondata, process.env.SECRET_KEY, {
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
    db.salon.findOne({
            where: { email: req.body.email }
        })
        .then(salon => {
            if (salon) {
                salon.update({
                        forget: token
                    }).then(item => {
                        var nodemailer = require("nodemailer");

                        var transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: '587',
                            auth: {
                                salon: "projetsidibe1@gmail.com",
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
                            html: "<a href=http://localhost:3000/salon/pwd/" + item.forget + ">Metter a jour le mot de passe</a>"
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
                res.status(404).json("salon not found");
            }
        })
        .catch(err => {
            res.json(err)
        })
});

router.post("/updatepassword", (req, res) => {
    db.salon.findOne({
            where: { forget: req.body.forget }
        }).then(salon => {
            if (salon) {
                const hash = bcrypt.hashSync(req.body.password, 10);
                req.body.password = hash;
                salon.update({
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
    db.salon.findOne({
            where: { email: req.body.email }
        }).then(salon => {
            if (salon) {
                if (salon.Status !== 1) {
                    salon.update({
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
                res.status(404).json("salon not found !!!")
            }
        })
        .catch(err => {
            res.json(err)
        })
});


router.put('/udapte/:id', (req, res) => {
    db.salon.findOne({
            where: { id: req.params.id }
        })
        .then(salon => {
            if (salon) {

                password = bcrypt.hashSync(req.body.password, 10);
                req.body.password = password;
                salon.update(req.body)
                    .then(salonitem => {
                        console.log(salonitem);
                        db.salon.findOne({
                                where: { id: req.params.id }
                            })
                            .then(salon => {
                                let token = jwt.sign(salon.dataValues,
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
                        res.status(402).send("impossible de mettre à jour le salon" + err);
                    })
            } else {
                res.json("salon n'est pas dans la base de données")
            }
        })
        .catch(err => {
            res.json(err);
        })
})

router.get("/profile/:id", (req, res) => {
    db.salon.findOne({
            where: { id: req.params.id }
        })
        .then(salon => {
            if (salon) {
                let token = jwt.sign(salon.dataValues,
                    process.env.SECRET_KEY, {
                        expiresIn: 1440
                    });
                res.status(200).json({ token: token })
            } else {
                res.json("error le salon n'est pas dans la base !!")
            }
        })
        .catch(err => {
            res.json(err)
        })
});


//.......recherche........

router.post("/new", (req, res) => {
    console.log(req.body);
    // on va chercher video dans body
    var video = req.body.video;
    var image = req.body.image;

    db.salon.findOne({
            where: { nom: req.body.nom }
        })
        .then(salon => {
            if (!salon) {
                db.salon.create(req.body)
                    .then(itemsalon => {
                        db.image.create({
                                image: image,
                                salonId: itemsalon.id
                            })
                            .then(() => {
                                db.video.create({
                                        video: video,
                                        salonId: itemsalon.id
                                    })
                                    .then(() => {
                                        db.salon.findOne({
                                                where: { id: itemsalon.id },
                                                include: [{
                                                        model: db.image
                                                    },
                                                    {
                                                        model: db.video
                                                    }
                                                ]
                                            })
                                            .then(salon => {
                                                res.status(200).json({ salon: salon })
                                            })
                                            .catch(err => {
                                                res.status(502).json(err);
                                            })

                                    })
                                    .catch(err => {
                                        res.status(502).json(err);
                                    })
                            })
                            .catch(err => {
                                res.status(502).json(err);
                            })


                    })
                    .catch(err => {
                        res.status(502).json(err);
                    })
            } else {
                res.json("salon déja dans la base");
            }
        })
        .catch(err => {
            res.status(502).json(err);
        })

});

router.get("/All", (req, res) => {
    db.salon.findAll({
            include: [
                { model: db.image },
                { model: db.video }
            ]
        })
        .then(salon => {

            if (salon !== []) {
                res.status(200).json({ salons: salon })

            } else {
                res.status(404).json("pas de liste de salon dans la base ")
            }
        })
        .catch(err => {
            res.status(400).json(err)
        })
});


router.get("/limit/:limit", (req, res) => {
    db.salon.findAll({
            include: [{
                    model: db.image,
                },
                {
                    model: db.video,
                },
            ],
            limit: parseInt(req.params.limit),
        })
        .then(salons => {
            res.status(200).json({ salons: salons })
        })
        .catch(err => {
            res.status(502).json("bad req" + err);
        })
});


router.get("/all/:limit/:offset", (req, res) => {
    db.salon.findAll({
            include: [{
                    model: db.image,
                },
                {
                    model: db.video,
                },
            ],
            limit: parseInt(req.params.limit),
            offset: parseInt(req.params.offset),

        })
        .then(salons => {
            res.status(200).json({ salons: salons })
        })
        .catch(err => {
            res.status(502).json("bad req" + err);
        })
});


router.post("/addvideo", (req, res) => {
    db.video.create({
            video: req.body.video,
            salonId: req.body.id
        })
        .then(() => {
            db.salon.findOne({
                    where: { id: req.body.id },
                    include: [{
                            model: db.image
                        },
                        {
                            model: db.video
                        }
                    ]
                })
                .then(salon => {
                    res.status(200).json({
                        salon: salon
                    })
                })
                .catch(err => {
                    res.json(err)
                })
        })
        .catch(err => {
            res.json(err)
        })
});


router.post("/addimage", (req, res) => {
    db.image.create({
            image: req.body.image,
            salonId: req.body.id
        })
        .then(() => {
            db.salon.findOne({
                    where: { id: req.body.id },
                    include: [{
                            model: db.image
                        },
                        {
                            model: db.video
                        }
                    ]
                })
                .then(salon => {
                    res.status(200).json({
                        salon: salon
                    })
                })
                .catch(err => {
                    res.json(err)
                })
        })
        .catch(err => {
            res.json(err)
        })
});


router.get("/findBy/:nom", (req, res) => {
    db.salon.findAll({
            where: {
                nom: {
                    [Op.like]: "%" + req.params.nom + "%",
                }
            },
            include: [{
                    model: db.image
                },
                {
                    model: db.video
                },
            ]
        })
        .then(salons => {
            res.status(200).json({ salons: salons })
        })
        .catch(err => {
            res.json(err)
        })
})

module.exports = router;