const { DataTypes } = require('sequelize');
const sequelize = require('../conn');

const ScreeningCandidate = sequelize.define('screening_candidate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'screening_sessions',
            key: 'id',
        },
    },
    originalName: {
        type: DataTypes.STRING,
    },
    extractedName: {
        type: DataTypes.STRING,
    },
    resumeText: {
        type: DataTypes.TEXT,
    },
    matchScore: {
        type: DataTypes.INTEGER,
    },
    rank: {
        type: DataTypes.INTEGER,
    },
    matchingSkills: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('matchingSkills');
            try {
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('matchingSkills', JSON.stringify(value));
        },
    },
    missingSkills: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('missingSkills');
            try {
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('missingSkills', JSON.stringify(value));
        },
    },
    experienceRelevance: {
        type: DataTypes.STRING(500),
    },
    educationAlignment: {
        type: DataTypes.STRING(500),
    },
    summary: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

module.exports = ScreeningCandidate;
