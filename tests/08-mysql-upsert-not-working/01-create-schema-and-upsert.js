'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config-mysql');
sq_config.database = 's08';
sq_config.options.sync.match = /s08/;
sq_config.options.define.paranoid = false;
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var filler_column = {
  type: Sequelize.STRING(50)
}

var models = {
  site: sq.define('site', {
    name: { type: Sequelize.STRING(50) },
    domain: {
      type: Sequelize.STRING(50),
      primaryKey: true
    },
  })
};

var upsert_workarounds = {
  find_mutate: function find_mutate(id, data) {
    return models.site.findById(id)
    .then(function insert_or_update_instance(instance) {
      if(instance !== null) {
        return instance.update(data);
      }
      else {
        return models.site.create(data);
      }
    });
  },

  count_mutate: function upsert_using_count_mutate(id, data) {
    return models.site.count({ where: { domain: id } })
    .then(function insert_or_update_instance(count) {
      if(count !== 0) {
        return models.site.update(data, { where: { domain: id } });
      }
      else {
        return models.site.create(data);
      }
    });
  }
};

// Functions for promise chain
function upsert_instance_1() {
  return models.site.upsert({ name: 'name1', domain: 'instance1', });
}

function upsert_instance_1_modified() {
  return models.site.upsert({ name: 'name1--new', domain: 'instance1' });
}

function find_mutate_instance_2_insert() {
  return upsert_workarounds.find_mutate('instance2', { name: 'name2', domain: 'instance2' });
}

function find_mutate_instance_2_update() {
 return upsert_workarounds.find_mutate('instance2', { name: 'name2--new', domain: 'instance2' });
}

function count_mutate_instance_3_insert() {
  return upsert_workarounds.count_mutate('instance3', { name: 'name3', domain: 'instance3' });
}

function count_mutate_instance_3_update() {
  return upsert_workarounds.count_mutate('instance3', { name: 'name3--new', domain: 'instance3' });
}

function raw_instance_4_insert() {
  return upsert_workarounds.raw_query('instance4', { name: 'name4', domain: 'instance4' });
}

function raw_instance_4_update() {
  return upsert_workarounds.raw_query('instance4', { name: 'name4--new', domain: 'instance4' });
}

function find_all() {
  return models.site.findAll();
}

/**
 * Log some data to the console
 * @param  {String} result_set A string describing the data to be logged
 * @param  {Object} data       The data to be logged
 * @return {Object}            The data to be logged, unmodified (to allow any promise chain to be continued)
 */
function print_upsert_result(description, result) {
  console.log(description + ': ' + result);
  console.log();
  return result;
}

function print_find_result(result) {
  console.log();
  console.log(JSON.stringify(result, null, 2));
  console.log();
}

/**
 * Log and swallow rejected promises.
 */
function swallow_rejected_promise(result_set, err) {
  console.warn('REJECTED PROMISE: ' + result_set + ' -- ' + err);
  console.warn(err.stack);
  console.log();
  return undefined;
}

sq.sync({ force: true })
.then(function() { console.log('################ Demo\'ing upsert behavior and no-changes issue ################'); })
.then(upsert_instance_1)
.then(print_upsert_result.bind(null, 'Upsert inserting, result should be true'))
.then(upsert_instance_1)
.then(print_upsert_result.bind(null, 'ISSUE: Upsert making no changes, result should be false'))
.then(upsert_instance_1_modified)
.then(print_upsert_result.bind(null, 'Upsert updating, result should be false'))
.then(upsert_instance_1)
.then(print_upsert_result.bind(null, 'Upsert updating, result should be false'))
.then(function() { console.log('################ Demonstrating work around 1 ################'); })
.then(find_mutate_instance_2_insert)
.then(find_mutate_instance_2_update)
.then(count_mutate_instance_3_insert)
.then(count_mutate_instance_3_update)
.then(function() { console.log('##################### Printing findAll  #####################'); })
.then(find_all)
.then(print_find_result)
.catch(swallow_rejected_promise.bind(null, 'main promise chain'))
.finally(function() {
  sq.close();
});
