const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET

const StorageService = require('../storage-service');
const storageService = new StorageService();

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
};


passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {

    const users = (await storageService.readData('users-db.json')).users;
    const user = users.find(u => u.id === jwtPayload.id);
    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}));

const initPassport = () => {
    return passport.initialize();
}

module.exports = initPassport;