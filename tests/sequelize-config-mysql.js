'use strict';

/**
 * Configuration information for creating a Sequelize object in a mysql-backed test. `options.define.schema` must be
 * assigned per test and database name, username and password must match config.sh, otherwise customise only as needed.
 *
 * To
 *
 * @type {Object}
 */
module.exports = {
  database: null, // must be defined by test
  username: 'sequelize',
  password: 'sequelize',
  options: {
    dialect: 'mysql',
    host: 'localhost',
    port: '5432',
    define: {
      paranoid: true,
      createdAt: 'sq_created_at',
      updatedAt: 'sq_updated_at',
      deletedAt: 'sq_deleted_at',
      underscored: true,
      freezeTableName: true
    },
    sync: {
      match: /null/, // must be defined by test
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
    },
    dialectOptions: {
        socketPath: "/var/run/mysqld/mysqld.sock"
    }
  }
};
