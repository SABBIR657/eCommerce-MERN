require('dotenv').config();

const serverPort = process.env.SERVER_PORT || 3002;

const mongodbURL = process.env.MONGODB_ATLAS_URL || "mongodb://localhost:27017/ecommerceMernDB";

const defaultImagePath = process.env.DEFAULT_USER_IMAGE_PATH || 'public/images/users/default.jpg';

const jwtactivationKey = process.env.JWT_ACTIVATION_KEY || 'jfioorhbhusfhu_errrr99';

const smtpUsername = process.env.SMTP_USERNAME || '';
const smtpPassword = process.env.SMTP_PASSWORD|| '';

const clientURL = process.env.CLIENT_URL|| '';




module.exports = {serverPort, mongodbURL, defaultImagePath, jwtactivationKey, smtpUsername, smtpPassword, clientURL}
