'use strict';

/**
 * Configuration information for creating a Sequelize object in a test. `options.define.schema` just be assigned per
 * test and database name, username and password must match config.sh, otherwise customise only as needed.
 *
 * @type {Object}
 */
module.exports = {
  database: 'sqpg',
  username: 'sequelize',
  password: 'sequelize',
  options: {
    dialect: 'postgres',
    host: 'localhost',
    port: '5432',
    define: {
      paranoid: true,
      createdAt: 'sq_created_at',
      updatedAt: 'sq_updated_at',
      deletedAt: 'sq_deleted_at',
      underscored: true,
      schema: null, // must be defined by test
      freezeTableName: true
    },
    sync: {
      match: /sqpg/, // match regex against DB name before sync'ing, for safety
      logging: function logging(msg) {
        console.log('sq:sync -- ' + msg);
      }
    },
    logging: function logging(msg) {
      console.log('sq -- ' + msg);
    },
    pool: {
      maxConnections: 10,
      minConnections: 3,
      maxIdleTime: 30000
    }
  }
};
