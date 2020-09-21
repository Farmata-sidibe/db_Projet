module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "Contenir", {
            quantite: {
                type: Sequelize.DataTypes.INTEGER(2)
            }
        });
}