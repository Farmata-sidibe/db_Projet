module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "Fournir", {
            quantite: {
                type: Sequelize.DataTypes.INTEGER(2)
            }
        });
}