module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "Impliquer", {
            meilleurProduit: {
                type: Sequelize.DataTypes.TEXT
            }
        });
}