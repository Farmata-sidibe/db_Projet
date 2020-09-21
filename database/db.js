const Sequelize = require("sequelize");

const db = {};

const dbinfo = new Sequelize("db_Projet", "root", "", {
    host: "localhost",
    dialect: "mysql",
    port: 3308,
    pool: {
        max: 5,
        min: 0,
    },
});

dbinfo
    .authenticate()
    .then(() => {
        console.log("connection sur mon db");
    })
    .catch((err) => {
        console.error("unable to connect to the database:" + err);
    });




db.client = require("../models/Client")(dbinfo, Sequelize);
db.salon = require("../models/Salon")(dbinfo, Sequelize);
db.avis = require("../models/Avis")(dbinfo, Sequelize);
db.blog = require("../models/Blog")(dbinfo, Sequelize);
db.carteMenu = require("../models/CarteMenu")(dbinfo, Sequelize);
db.categorie = require("../models/Categorie")(dbinfo, Sequelize);
db.coiffeur = require("../models/Coiffeur")(dbinfo, Sequelize);
db.commande = require("../models/Commande")(dbinfo, Sequelize);
db.facture = require("../models/Facture")(dbinfo, Sequelize);
db.fournisseur = require("../models/Fournisseur")(dbinfo, Sequelize);
db.gestionPlanning = require("../models/GestionPlanning")(dbinfo, Sequelize);
db.livraison = require("../models/Livraison")(dbinfo, Sequelize);
db.marque = require("../models/Marque")(dbinfo, Sequelize);
db.paiement = require("../models/Paiement")(dbinfo, Sequelize);
db.produit = require("../models/Produit")(dbinfo, Sequelize);
db.sousCategorie = require("../models/SousCategorie")(dbinfo, Sequelize);
db.statistique = require("../models/Statistique")(dbinfo, Sequelize);
db.typeDePaiement = require("../models/TypeDePaiement")(dbinfo, Sequelize);
db.ville = require("../models/Ville")(dbinfo, Sequelize);
db.video = require("../models/Video")(dbinfo, Sequelize);
db.image = require("../models/Image")(dbinfo, Sequelize);



db.concerner = require("../models/Concerner")(dbinfo, Sequelize);
db.notersalon = require("../models/Notersalon")(dbinfo, Sequelize);
db.impliquer = require("../models/Impliquer")(dbinfo, Sequelize);
db.contenir = require("../models/Contenir")(dbinfo, Sequelize);
db.noterproduit = require("../models/noterproduit")(dbinfo, Sequelize);
db.fournir = require("../models/Fournir")(dbinfo, Sequelize);
db.detenir = require("../models/Detenir")(dbinfo, Sequelize);

db.salon.hasMany(db.carteMenu, { foreignKey: "salonId" });
db.salon.hasMany(db.gestionPlanning, { foreignKey: "salonId" });
db.ville.hasMany(db.salon, { foreignKey: "villeId" });
db.salon.hasMany(db.coiffeur, { foreignKey: "salonId" });
db.salon.hasMany(db.client, { foreignKey: "salonId" });
db.blog.hasMany(db.client, { foreignKey: "blogId" });
db.client.hasMany(db.avis, { foreignKey: "clientId" });
db.client.hasMany(db.commande, { foreignKey: "clientId" });
db.livraison.hasMany(db.commande, { foreignKey: "livraisonId" });
db.paiement.hasMany(db.commande, { foreignKey: "paiementId" });
db.typeDePaiement.hasMany(db.paiement, { foreignKey: "typeDePaiementId" });
db.marque.hasMany(db.produit, { foreignKey: "marqueId" });
db.categorie.hasMany(db.sousCategorie, { foreignKey: "categorieId" });
db.coiffeur.hasMany(db.client, { foreignKey: "coiffeurId" });
db.paiement.hasOne(db.facture, { foreignKey: "factureId" });


db.salon.belongsToMany(db.statistique, { through: "Concerner", foreignKey: "salonId" });
db.statistique.belongsToMany(db.salon, { through: "Concerner", foreignKey: "statistiqueId" });

db.salon.belongsToMany(db.avis, { through: "notersalon", foreignKey: "salonId" });
db.avis.belongsToMany(db.salon, { through: "notersalon", foreignKey: "avisId" });

db.produit.belongsToMany(db.statistique, { through: "Impliquer", foreignKey: "produitId" });
db.statistique.belongsToMany(db.produit, { through: "Impliquer", foreignKey: "statistiqueId" });

db.commande.belongsToMany(db.produit, { through: "Contenir", foreignKey: "commandeId" });
db.produit.belongsToMany(db.commande, { through: "Contenir", foreignKey: "produitId" });

db.produit.belongsToMany(db.avis, { through: "noterproduit", foreignKey: "produitId" });
db.avis.belongsToMany(db.produit, { through: "noterproduit", foreignKey: "avisId" });

db.produit.belongsToMany(db.fournisseur, { through: "Fournir", foreignKey: "produitId" });
db.fournisseur.belongsToMany(db.produit, { through: "Fournir", foreignKey: "fournisseurId" });

db.produit.belongsToMany(db.sousCategorie, { through: "Detenir", foreignKey: "produitId" });
db.sousCategorie.belongsToMany(db.produit, { through: "Detenir", foreignKey: "sousCategorieId" });

//lien entre la clé étrangére et la table de référence
db.noterproduit.belongsTo(db.produit, { foreignKey: 'produitId', as: 'produit', });
db.noterproduit.belongsTo(db.client, { foreignKey: 'clientId', as: 'client', });

db.notersalon.belongsTo(db.salon, { foreignKey: 'salonId', as: 'salon', });
db.notersalon.belongsTo(db.client, { foreignKey: 'clientId', as: 'client', });



db.dbinfo = dbinfo;
db.Sequelize = Sequelize;

//dbinfo.sync({ force: true });

module.exports = db;