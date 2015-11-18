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
    templateId: { type: Sequelize.STRING(50) },
    siteName: { type: Sequelize.STRING(50) },
    domain: {
      type: Sequelize.STRING(50),
      primaryKey: true
    },
    mainEmail: { type: Sequelize.STRING(50) },
    mainPhone: { type: Sequelize.STRING(50) },
    mainExt: { type: Sequelize.STRING(50) }
  })
};

function upsert_data() {
  return models.site.upsert({
    name: 'data.name',
    templateId: 'data.templateId',
    siteName: 'data.siteName',
    domain: 'utils.formatDomain(data.domain)',
    mainEmail: 'data.mainEmail',
    mainPhone: 'utils.removePhoneNumberFormat(data.mainPhone)',
    mainExt: ''
  }, {
    where: {
      domain: 'data.domain'
    }
  });
}

function find_all_from_table() {
  return models.site.findAll({});
}

/**
 * Log some data to the console
 * @param  {String} result_set A string describing the data to be logged
 * @param  {Object} data       The data to be logged
 * @return {Object}            The data to be logged, unmodified (to allow any promise chain to be continued)
 */
function print_result(result_set, data) {
  console.log('RESULT SET:        ' + result_set);
  console.log(JSON.stringify(data, null, 2));
  console.log();
  return data;
}

/**
 * Swallow rejected promises. There'll be at least one from a failed find, this allows other find attempts to proceed
 * in the Promise.all
 */
function swallow_rejected_promise(result_set, err) {
  console.warn('REJECTED PROMISE: ' + result_set + ' -- ' + err);
  console.warn(err.stack);
  console.log();
  return undefined;
}

sq.sync({ force: true })
.then(upsert_data)
.then(print_result.bind(null, 'Return value of upsert - should be true'))
.then(find_all_from_table)
.then(print_result.bind(null, 'Result of findAll'))
.then(upsert_data)
.then(print_result.bind(null, 'Return value of upsert - should be false'))
.catch(swallow_rejected_promise.bind(null, 'main promise chain'))
.finally(function() {
  sq.close();
})
