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

router.post("/salons/:salonId/vote/like", (req, res) => {
        //l'entête d'authorization
        var headerAuth = req.headers['authorization'];
        var clientId = jwtUtils.getClientId(headerAuth);

        //parametre
        //l'identifient du client qui souhaite donner son avis
        var salonId = parseInt(req.params.salonId);

        if (salonId <= 0) {
            return res.status(400).json({ 'error': 'parametre invalide' });
        }

        asyncLib.waterfall([
            function(done) {
                db.salon.findOne({
                        where: { id: salonId }
                    })
                    .then(function(salonFound) {
                        done(null, salonFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify salon' });
                    });
            },
            //deuxieme etape du waterfall on recupere l'objet client
            function(salonFound, done) {
                if (salonFound) {
                    db.client.findOne({
                            where: { id: clientId }
                        })
                        .then(function(clientFound) {
                            done(null, salonFound, clientFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify client' });
                        });
                } else {
                    res.status(404).json({ 'error': 'post already liked' });
                }
            },
            //troisiéme etape du waterfall verifie si le client a ete retrouver
            function(salonFound, clientFound, done) {
                if (clientFound) {
                    db.notersalon.findOne({
                            where: {
                                clientId: clientId,
                                salonId: salonId
                            }
                        })
                        .then(function(isClientAlreadyLiked) {
                            done(null, salonFound, clientFound, isClientAlreadyLiked);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is client already liked' });
                        });
                } else {
                    res.status(404).json({ 'error': 'client not exist' });
                }
            },
            //quatriéme etatpe du waterfall si le client n'avait pas deja liker
            function(salonFound, clientFound, isClientAlreadyLiked, done) {
                if (!isClientAlreadyLiked) {
                    salonFound.addClient(clientFound)
                        .then(function(alreadyLikeFound) {
                            done(null, salonFound, clientFound, isClientAlreadyLiked);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to set client reaction' });
                        });
                } else {
                    res.status(409).json({ 'error': 'salon already liked' });
                }
            },
            //cinquiéme etape de notre waterfall permet de mettre à jours le salons et ainsi d'autoincrimenter de 1 le nombre de like
            function(salonFound, clientFound, done) {
                salonFound.update({
                        notersalon: salonFound.notersalon + 1,
                    })
                    .then(function() {
                        done(salonFound);
                    })
                    .catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update salon like counter' });
                    });
            },

        ], function(salonFound) {
            if (salonFound) {
                return res.status(201).json(salonFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update salon' });
            }
        });
    }),
    router.post("/salons/:salonId/vote/dislike", (req, res) => {
        //l'entête d'authorization
        var headerAuth = req.headers['authorization'];
        var clientId = jwtUtils.getClientId(headerAuth);

        //parametre
        //l'identifient du client qui souhaite donner son avis
        var salonId = parseInt(req.params.salonId);

        if (salonId <= 0) {
            return res.status(400).json({ 'error': 'parametre invalide' });
        }

        asyncLib.waterfall([
            function(done) {
                db.salon.findOne({
                        where: { id: salonId }
                    })
                    .then(function(salonFound) {
                        done(null, salonFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify salon' });
                    });
            },
            //deuxieme etape du waterfall on recupere l'objet client
            function(salonFound, done) {
                if (salonFound) {
                    db.client.findOne({
                            where: { id: clientId }
                        })
                        .then(function(clientFound) {
                            done(null, salonFound, clientFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify client' });
                        });
                } else {
                    res.status(404).json({ 'error': 'post already liked' });
                }
            },
            //troisiéme etape du waterfall verifie si le client a ete retrouver
            function(salonFound, clientFound, done) {
                if (clientFound) {
                    db.notersalon.findOne({
                            where: {
                                clientId: clientId,
                                salonId: salonId
                            }
                        })
                        .then(function(isClientAlreadyLiked) {
                            done(null, salonFound, clientFound, isClientAlreadyLiked);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is client already liked' });
                        });
                } else {
                    res.status(404).json({ 'error': 'client not exist' });
                }
            },
            //quatriéme etatpe du waterfall si le client n'avait pas deja liker
            function(salonFound, clientFound, isClientAlreadyLiked, done) {
                if (!isClientAlreadyLiked) {
                    isClientAlreadyLiked.destroy()
                        .then(function() {
                            done(null, salonFound, clientFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'cannot remove already like post' });
                        });
                } else {
                    done(null, salonFound, clientFound);
                }
            },
            //cinquiéme etape de notre waterfall permet de mettre à jours le salons et ainsi d'autoincrimenter de 1 le nombre de like
            function(salonFound, clientFound, done) {
                salontFound.update({
                        notersalon: salonFound.notersalon - 1,
                    })
                    .then(function() {
                        done(salonFound);
                    })
                    .catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update salon like counter' });
                    });
            },

        ], function(salonFound) {
            if (salonFound) {
                return res.status(201).json(salonFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update salon' });
            }
        });
    }),



    module.exports = router;