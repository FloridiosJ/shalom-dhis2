const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Dispensaire extends Model {}

Dispensaire.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    organisationId: {
        type: DataTypes.UUID,
        references: {
            model: 'organisations',
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Dispensaire',
    timestamps: true,
});

module.exports = Dispensaire;