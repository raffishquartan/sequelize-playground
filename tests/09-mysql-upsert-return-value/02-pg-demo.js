'use strict';

var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config-pg');
sq_config.options.define.schema = 's09';
sq_config.options.define.paranoid = false;
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var common_execution = require('./common');
common_execution(sq, Sequelize);
