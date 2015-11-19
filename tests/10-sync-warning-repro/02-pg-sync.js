'use strict';

var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config-pg');
sq_config.options.define.schema = 's10';
sq_config.options.define.paranoid = false;
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  site: sq.define('site', {
    name: { type: Sequelize.STRING(50) },
    domain: {
      type: Sequelize.STRING(50),
      primaryKey: true
    },
  })
};

sq.sync({ force: true })
.finally(function() {
  sq.close();
});
