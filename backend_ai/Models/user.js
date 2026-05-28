const { DataTypes } = require('sequelize');
const sequelize = require('../conn');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user',
    },
    photoUrl: {
        type: DataTypes.STRING,
    },
}, {
    timestamps: true,
});

module.exports = User;