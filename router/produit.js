const Express = require("express"),
    router = Express.Router(),
    db = require("../database/db");

router.post("/new", (req, res) => {
    console.log(req.body);
    db.produit
        .findOne({
            where: { ref: req.body.ref },
        })
        .then((produit) => {
            if (!produit) {
                db.produit
                    .create(req.body)
                    .then((produititem) => {
                        db.img
                            .create({
                                Status: 1,
                                Image: req.body.img,
                                produitId: produititem.id,
                            })
                            .then((img) => {
                                res.status(200).json({
                                    produit: produititem,
                                    produit: img,
                                    message: "ok ",
                                });
                            })
                            .catch((err) => {
                                res.json(err);
                            });
                    })
                    .catch((err) => {
                        res.status(400).send("error" + err);
                    });
            } else {
                produit
                    .update({
                        stock: req.body.stock,
                    })
                    .then((rep) => {
                        res.status(200).json({ produit: rep });
                    })
                    .catch((err) => {
                        res.status(403).json("not updated");
                    });
            }
        })
        .catch((err) => {
            res.status(404).json("Not found");
        });
});

router.get("/all", (req, res) => {
    db.produit
        .findAll({
            include: [{
                model: db.img,
            }, ],
        })
        .then((produits) => {
            if (produits) {
                res.status(200).json({
                    produits: produits,
                });
            } else {
                res.status(404).json("il n'a pas de produits");
            }
        })
        .catch((err) => {
            res.json(err);
        });
});

router.delete("/delete/:id", (req, res) => {
    // find the produit and delete
    // findOne veut dire récupérer un élément
    // findAll veut dire recuperer tous les éléments
    db.produit.findOne({
            where: { id: req.params.id }
        }).then(produit => {
            // if produit exist so
            if (produit) {
                produit.destroy().then(() => {
                        res.json("produit supprimer")
                    })
                    .catch(err => {
                        res.json("error" + err)
                    })
            } else {
                res.json({ error: "vous ne pouvez pas supprimer ce produit, elle n'existe pas dans la base" })
            }
        })
        .catch(err => {
            //send back the message error
            res.json("error" + err);
        })
});

router.get("/findBy/:nom", (req, res) => {
    db.produit.findAll({
            where: {
                nom: {
                    [Op.like]: "%" + req.params.nom + "%",
                }
            },
            include: [{
                model: db.image
            }, ]
        })
        .then(produits => {
            res.status(200).json({ produits: produits })
        })
        .catch(err => {
            res.json(err)
        })
})
module.exports = router;