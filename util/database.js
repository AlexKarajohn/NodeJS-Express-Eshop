const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete','root','q12wq12wq!@WQ!@WQ',
{
    dialect: 'mysql',host:'localhost'
});

module.exports = sequelize;