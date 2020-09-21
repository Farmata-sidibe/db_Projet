module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "Concerner", {
            statistique: {
                type: Sequelize.DataTypes.TEXT
            }
        });
}