const sequelize = require('../conn');
const User = require('./user');
const Resume = require('./resume');
const ScreeningSession = require('./ScreeningSession');
const ScreeningCandidate = require('./ScreeningCandidate');

// Associations
User.hasMany(Resume, { foreignKey: 'userId', onDelete: 'CASCADE' });
Resume.belongsTo(User, { foreignKey: 'userId' });

ScreeningSession.hasMany(ScreeningCandidate, { foreignKey: 'sessionId', as: 'candidates', onDelete: 'CASCADE' });
ScreeningCandidate.belongsTo(ScreeningSession, { foreignKey: 'sessionId' });

// Sync database
sequelize.sync({ alter: true })
    .then(() => {
        console.log("All models synced successfully");
    })
    .catch((err) => {
        console.log("Error syncing models", err);
    });

module.exports = { sequelize, User, Resume, ScreeningSession, ScreeningCandidate };
