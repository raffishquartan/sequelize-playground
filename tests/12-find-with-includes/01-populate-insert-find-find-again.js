'use strict';

var Promise = require('bluebird');
var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config-pg');
sq_config.options.define.schema = 's12';
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  item: sq.define('item', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  }),

  detail: sq.define('detail', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  }),
};

models.item.hasMany(models.detail);
models.detail.belongsTo(models.item);

function add_data_create_items() {
  return Promise.all([
    models.item.create({}),
    models.item.create({}),
    models.item.create({})
  ]);
}

function add_data_create_details(items_array) {
  return Promise.all([
    models.detail.create({}).then(function(tx) { return tx.setItem(items_array[0]); }),
    models.detail.create({}).then(function(tx) { return tx.setItem(items_array[0]); }),
    models.detail.create({}).then(function(tx) { return tx.setItem(items_array[0]); }),
    models.detail.create({}).then(function(tx) { return tx.setItem(items_array[1]); }),
    models.detail.create({}).then(function(tx) { return tx.setItem(items_array[1]); }),
    models.detail.create({}).then(function(tx) { return tx.setItem(items_array[2]); }),
  ]);
}

function find_one_item() {
  return models.item.findById(1);
}

function add_associations_to_instance(instance) {
  return models.item.findOne({
    where: instance.where(),
    include: [{
      model: models.detail,
    }]
  });
}

function print_result_instance_array(result_set, data) {
  console.log();
  console.log('RESULT SET: ' + result_set);
  console.log(JSON.stringify(data, null, 2));
  console.log();
  return data;
}

function swallow_rejected_promise(result_set, err) {
  console.log();
  console.warn('REJECTED PROMISE: ' + result_set + ' -- ' + err);
  console.warn(err.stack);
  console.log();
  return undefined;
}

sq.sync({ force: true })
.then(add_data_create_items)
.then(add_data_create_details)
.then(find_one_item)
.then(add_associations_to_instance)
.then(print_result_instance_array.bind(null, 'Result of include in find'))
.catch(swallow_rejected_promise.bind(null, 'main promise chain'))
.finally(function() {
  sq.close();
})
