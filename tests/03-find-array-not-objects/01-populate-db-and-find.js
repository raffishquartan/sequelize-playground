'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config-pg');
sq_config.options.define.schema = 's03';
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  account: sq.define('account', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      validate: {
        isUUID: 4
      },
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    age: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    }
  }, {
  })
};

function add_data() {
  return Promise.all([
    models.account.create({ name: 'Sample 1', age: 19 }),
    models.account.create({ name: 'Sample 2', age: 27 }),
    models.account.create({ name: 'Sample 3', age: 16 })
  ]);
}

function find_over18_accounts_with_raw() {
  return models.account.findAll({
    where: { age: { $gt : 18 } },
    attributes: ['name'],
    raw : true
  });
}

function find_over18_accounts_without_raw() {
  return models.account.findAll({
    where: { age: { $gt : 18 } },
    attributes: ['name']
  });
}

function map_to_string_array(accounts) {
  return _.map(accounts, function(account) { return account.name; });
}


function print_result(method, accounts) {
  console.log('');
  console.log('Using a ' + method + ' method:');
  console.log(JSON.stringify(accounts));
  console.log('');
}

sq.sync({ force: true })
.then(add_data)
.then(find_over18_accounts_with_raw)
.then(print_result.bind(this, 'findAll with raw '))
.then(find_over18_accounts_without_raw)
.then(print_result.bind(this, 'findAll without raw'))
.then(find_over18_accounts_without_raw)
.then(map_to_string_array)
.then(print_result.bind(this, 'findAll then mapping function'))
.then(function() {
  sq.close();
})
.catch(function(err) {
  console.warn('Rejected promise: ' + err);
  console.warn(err.stack);
})
.done();
