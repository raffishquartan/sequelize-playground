'use strict';

var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config-pg');
sq_config.options.define.schema = 's11';
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  DeviceType: sq.define('DeviceType', {
    id: {
      type: Sequelize.INTEGER,
      field: 'DeviceID',
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      field: 'DeviceType'
    }
  }, {
    tableName: 'm_DeviceType',
    timestamps: false,
    defaultScope: {
      //order: [['name']] // doesn't work, SQL is invalid: 'ORDER BY "DeviceType"."name"', works if "DeviceType" removed
      order: [['DeviceType']] // works for postgres
    }
  })
};

/**
 * Wrap because sq.sync doesn't return an options object and findAll is appropriately fussy about its parameters
 */
function find_all() {
  return models.DeviceType.findAll({});
}

/**
 * Swallow rejected promises.
 */
function swallow_rejected_promise(result_set, err) {
  console.warn('REJECTED PROMISE: ' + result_set + ' -- ' + err);
  console.warn(err.stack);
  return null;
}

sq.sync({ force: true })
.then(find_all)
.catch(swallow_rejected_promise.bind(null, 'main promise chain'))
.finally(function() {
  sq.close();
})
