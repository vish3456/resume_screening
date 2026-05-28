const { DataTypes } = require('sequelize');
const sequelize = require('../conn');

const ScreeningSession = sequelize.define('screening_session', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    jobDescription: {
        type: DataTypes.TEXT,
    },
    jdFileName: {
        type: DataTypes.STRING,
    },
    sessionName: {
        type: DataTypes.STRING,
    },
}, {
    timestamps: true,
});

module.exports = ScreeningSession;
