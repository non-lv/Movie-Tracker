const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite'
});

const Movies = sequelize.define('movies', {
    name: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    release_year: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    type: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.STRING
    }
}, {
    timestamps: false
});

exports.movies = Movies;