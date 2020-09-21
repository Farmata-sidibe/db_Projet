module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "noterproduit", {
            avis: {
                type: Sequelize.DataTypes.INTEGER(2)
            },
            produitId: {
                //set data type with max length
                type: Sequelize.DataTypes.INTEGER,
                // setting allowNull to false will add NOT NULL to the column, which means an error will be if you add info in this column
                allowNull: false,
                references: {
                    model: 'produits',
                    key: 'id'
                }
            },

            clientId: {
                //set data type with max length
                type: Sequelize.DataTypes.INTEGER,
                // setting allowNull to false will add NOT NULL to the column, which means an error will be if you add info in this column
                allowNull: false,
                references: {
                    model: 'clients',
                    key: 'id'
                }
            },
        });
}