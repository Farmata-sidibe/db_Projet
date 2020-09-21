module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "notersalon", {
            meilleurSalon: {
                type: Sequelize.DataTypes.TEXT
            },
            salonId: {
                //set data type with max length
                type: Sequelize.DataTypes.INTEGER,
                // setting allowNull to false will add NOT NULL to the column, which means an error will be if you add info in this column
                allowNull: false,
                references: {
                    model: 'salons',
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