'use strict';

var Promise = require('bluebird');
var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config-mysql');
sq_config.database = 's13';
sq_config.options.sync.match = /s13/;
sq_config.options.define.paranoid = false;
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  event: sq.define('event', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    state: { type: Sequelize.INTEGER },
    end: {
      type: Sequelize.DATE,
      primaryKey: true,
      defaultValue: Sequelize.NOW
    },
  })
};

function insert_data() {
  return Promise.all([
    models.event.create({ state: 1 }),
    models.event.create({ state: 1 }),
    models.event.create({ state: 2 })
  ]);
}

function wait_a_while() {
  return Promise.delay(2000);
}

function find_data() {
  return models.event.findAll({
    where: {
      state: 1,
      end: {
        $lt: Sequelize.fn('NOW')
      }
    }
  });
}

function print_result(description, result) {
  console.log(description + ':\n' + JSON.stringify(result, null, 2));
  return result;
}

function swallow_rejected_promise(result_set, err) {
  console.warn('REJECTED PROMISE: ' + result_set + ' -- ' + err);
  console.warn(err.stack);
  return null;
}

sq.sync({ force: true })
.then(insert_data)
.then(wait_a_while)
.then(find_data)
.then(print_result.bind(null, 'Result of query'))
.catch(swallow_rejected_promise.bind(null, 'main promise chain'))
.finally(function() {
  return sq.close();
});
