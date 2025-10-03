const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class DataEntry extends Model {}

DataEntry.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    dispensaireId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'dispensaires',
            key: 'id',
        },
    },
    indicator: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'data_entry',
    timestamps: true,
});

module.exports = DataEntry;