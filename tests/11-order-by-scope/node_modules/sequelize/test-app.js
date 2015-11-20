/*jshint quotmark: false */
"use strict";
var Sequelize = require('./index');
var DataTypes = Sequelize;
var inflection = require('inflection');
var cls = require('continuation-local-storage');
var ns = cls.createNamespace('sequelize');
var _ = require('lodash');
//Sequelize.cls = ns;
var Promise = Sequelize.Promise;
var db, sequelize;
Promise.longStackTraces();


  //db = sequelize = new Sequelize('sequelize-test-43', 'sequelize', 'nEGkLma26gXVHFUAHJxcmsrK', {
 //    dialect: 'mssql',
 //    host: 'mssql.sequelizejs.com',
 //    port: 11433,
db = sequelize = new Sequelize('sequelize_test', 'postgres', 'postgres', {
  replication: {
    write: {
      host: 'localhost',
      username: 'postgres',
      password: 'postgres'
    },
    read: [
      {
        host: 'localhost',
        username: 'postgres',
        password: 'postgres'
      }
    ]
  },
    dialect: 'postgres',
 //db = sequelize = new Sequelize('sequelize_test', 'root', null, {
 //    dialect: 'sqlite'  ,
     //dialect: 'mariadb',
    // omitNull: true,
    // timezone: '+02:00',
    // host: '127.0.0.1',
  // "timezone": "Europe/London",

  dialectOptions: {
        requestTimeout: 20000000
    },
    define: {
        paranoid: false,
        // freezeTableName:true,
        //underscoredAll: true,
        // underscored: true
        timestamps: false
    },
    pool: {
        max: 100
    },
    typeValidation: true
});

var Product = sequelize.define('product', {
  updated: Sequelize.DATE
}) ;

sequelize.sync({
  logging: console.log,
  //force: true
}).bind({}).then(function() {
  return Product.find({
    where:{updated:{$gte:new Date()}}
  }).then(function(my_products){
    console.log(my_products);
  },function(err){
    console.log(err);
  });
}).then(function () {
  return Product.create()
}).then(function (row) {

}).then(function(rows) {
  console.log(rows)
}).then(function(users) {
}).then(function(row) {

 }).catch(function(err) {
 console.log(err);
  console.log(err.stack);
}).finally(function() {
    return sequelize.close();
}).done();
