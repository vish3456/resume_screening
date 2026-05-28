const { DataTypes } = require('sequelize');
const sequelize = require('../conn');

const Resume = sequelize.define('resume', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    resume_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    job_desc: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    score: {
        type: DataTypes.STRING,
    },
    feedback: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

module.exports = Resume;