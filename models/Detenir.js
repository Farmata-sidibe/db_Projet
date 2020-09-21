module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "Detenir", {
            quantité: {
                type: Sequelize.DataTypes.INTEGER(2)
            }
        });
}