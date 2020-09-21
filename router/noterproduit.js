/*Async est un module utilitaire qui fournit des fonctions simples 
et puissantes pour travailler avec JavaScript asynchrone */
/*Ce module est capable d'analyser et de générer des jetons JWT chiffrés et non chiffrés. */
/*AsyncLib est une bibliothèque asynchrone dans un navigateur basé sur NodeJS ou ES5 */
const Express = require("express"),
    router = Express.Router(),
    db = require("../database/db");
var jwtUtils = require('jwt-utils');
var asyncLib = require('async');
//constants

// route

router.post("/produits/:produitId/vote/like", (req, res) => {
        //l'entête d'authorization
        var headerAuth = req.headers['authorization'];
        var clientId = jwtUtils.getClientId(headerAuth);

        //parametre
        //l'identifient du client qui souhaite donner son avis
        var produitId = parseInt(req.params.produitId);

        if (produitId <= 0) {
            return res.status(400).json({ 'error': 'parametre invalide' });
        }

        asyncLib.waterfall([
            function(done) {
                db.produit.findOne({
                        where: { id: produitId }
                    })
                    .then(function(produitFound) {
                        done(null, produitFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify produit' });
                    });
            },
            //deuxieme etape du waterfall on recupere l'objet client
            function(produitFound, done) {
                if (produitFound) {
                    db.client.findOne({
                            where: { id: clientId }
                        })
                        .then(function(clientFound) {
                            done(null, produitFound, clientFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify client' });
                        });
                } else {
                    res.status(404).json({ 'error': 'post already liked' });
                }
            },
            //troisiéme etape du waterfall verifie si le client a ete retrouver
            function(produitFound, clientFound, done) {
                if (clientFound) {
                    db.noterproduit.findOne({
                            where: {
                                clientId: clientId,
                                produitId: produitId
                            }
                        })
                        .then(function(isClientAlreadyLiked) {
                            done(null, produitFound, clientFound, isClientAlreadyLiked);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is client already liked' });
                        });
                } else {
                    res.status(404).json({ 'error': 'client not exist' });
                }
            },
            //quatriéme etatpe du waterfall si le client n'avait pas deja liker
            function(produitFound, clientFound, isClientAlreadyLiked, done) {
                if (!isClientAlreadyLiked) {
                    produitFound.addClient(clientFound)
                        .then(function(alreadyLikeFound) {
                            done(null, produitFound, clientFound, isClientAlreadyLiked);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to set client reaction' });
                        });
                } else {
                    res.status(409).json({ 'error': 'produit already liked' });
                }
            },
            //cinquiéme etape de notre waterfall permet de mettre à jours le produits et ainsi d'autoincrimenter de 1 le nombre de like
            function(produitFound, clientFound, done) {
                produitFound.update({
                        noterproduit: produitFound.noterproduit + 1,
                    })
                    .then(function() {
                        done(produitFound);
                    })
                    .catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update produit like counter' });
                    });
            },

        ], function(produitFound) {
            if (produitFound) {
                return res.status(201).json(produitFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update produit' });
            }
        });
    }),
    router.post("/produits/:produitId/vote/dislike", (req, res) => {
        //l'entête d'authorization
        var headerAuth = req.headers['authorization'];
        var clientId = jwtUtils.getClientId(headerAuth);

        //parametre
        //l'identifient du client qui souhaite donner son avis
        var produitId = parseInt(req.params.produitId);

        if (produitId <= 0) {
            return res.status(400).json({ 'error': 'parametre invalide' });
        }

        asyncLib.waterfall([
            function(done) {
                db.produit.findOne({
                        where: { id: produitId }
                    })
                    .then(function(produitFound) {
                        done(null, produitFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify produit' });
                    });
            },
            //deuxieme etape du waterfall on recupere l'objet client
            function(produitFound, done) {
                if (produitFound) {
                    db.client.findOne({
                            where: { id: clientId }
                        })
                        .then(function(clientFound) {
                            done(null, produitFound, clientFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify client' });
                        });
                } else {
                    res.status(404).json({ 'error': 'post already liked' });
                }
            },
            //troisiéme etape du waterfall verifie si le client a ete retrouver
            function(produitFound, clientFound, done) {
                if (clientFound) {
                    db.noterproduit.findOne({
                            where: {
                                clientId: clientId,
                                produitId: produitId
                            }
                        })
                        .then(function(isClientAlreadyLiked) {
                            done(null, produitFound, clientFound, isClientAlreadyLiked);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is client already liked' });
                        });
                } else {
                    res.status(404).json({ 'error': 'client not exist' });
                }
            },
            //quatriéme etatpe du waterfall si le client n'avait pas deja liker
            function(produitFound, clientFound, isClientAlreadyLiked, done) {
                if (!isClientAlreadyLiked) {
                    isClientAlreadyLiked.destroy()
                        .then(function() {
                            done(null, produitFound, clientFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'cannot remove already like post' });
                        });
                } else {
                    done(null, produitFound, clientFound);
                }
            },
            //cinquiéme etape de notre waterfall permet de mettre à jours le produits et ainsi d'autoincrimenter de 1 le nombre de like
            function(produitFound, clientFound, done) {
                produitFound.update({
                        noterproduit: produitFound.noterproduit - 1,
                    })
                    .then(function() {
                        done(produitFound);
                    })
                    .catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update produit like counter' });
                    });
            },

        ], function(produitFound) {
            if (produitFound) {
                return res.status(201).json(produitFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update produit' });
            }
        });
    }),



    module.exports = router;