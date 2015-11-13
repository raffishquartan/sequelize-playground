'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config');
sq_config.options.define.schema = 's05';
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  user: sq.define('user', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'user'
  }),

  tag: sq.define('tag', {
    id: {
      type: Sequelize.STRING(50),
      primaryKey: true
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'tag'
  }),

  transaction: sq.define('transaction', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'transaction'
  }),

  user_tx: sq.define('user_tx', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'user_tx'
  })
};

models.user.hasMany(models.tag, {foreignKey: 'owner_id', foreignKeyConstraint: true});
models.tag.belongsTo(models.user, {foreignKey: 'owner_id', foreignKeyConstraint: true});

models.tag.hasMany(models.transaction, {foreignKey: 'tag_id', foreignKeyConstraint: true});
models.transaction.belongsTo(models.tag, {foreignKey: 'tag_id', foreignKeyConstraint: true});

models.user.belongsToMany(models.transaction, {through: {model: models.user_tx, unique: false}, foreignKey: 'user_id'});
models.transaction.belongsToMany(models.user, {through: {model: models.user_tx, unique: false}, foreignKey: 'tx_id'});


/**
 * Creates 3 users and returns a promise for an array of their instances
 */
function add_data_make_user_instances_array() {
  console.log('Making the user instances');
  return Promise.all([
      models.user.create({}),
      models.user.create({}),
      models.user.create({})
    ]);
}

/**
 * Creates 6 tags and returns a promise for an array of their instances. Sets owning user (owner_id) manually.
 * @param {Array} users_array An array of 3 user instances
 */
function add_data_make_tag_instances_array(users_array) {
  console.log('Making the tag instances');
  return Promise.all([
      models.tag.create({ id: 'tag1-user1', owner_id: users_array[0].get('id') }),
      models.tag.create({ id: 'tag2-user2', owner_id: users_array[1].get('id') }),
      models.tag.create({ id: 'tag3-user2', owner_id: users_array[1].get('id') }),
      models.tag.create({ id: 'tag4-user3', owner_id: users_array[2].get('id') }),
      models.tag.create({ id: 'tag5-user3', owner_id: users_array[2].get('id') }),
      models.tag.create({ id: 'tag6-user3', owner_id: users_array[2].get('id') })
    ]);
}

/**
 * Creates 6 transactions and returns a promise for an array of their instances. Sets owning tag after creation.
 * @param {Array} tags_array An array of 6 tag instances
 */
function add_data_make_transaction_instance_array(tags_array) {
  console.log('Making the transaction instances');
  return Promise.all([
      models.transaction.create({ active: true }).then(function(tx) { return tx.setTag(tags_array[0]); }),
      models.transaction.create({ active: true }).then(function(tx) { return tx.setTag(tags_array[1]); }),
      models.transaction.create({ active: true }).then(function(tx) { return tx.setTag(tags_array[2]); }),
      models.transaction.create({ active: false }).then(function(tx) { return tx.setTag(tags_array[3]); }),
      models.transaction.create({ active: false }).then(function(tx) { return tx.setTag(tags_array[4]); }),
      models.transaction.create({ active: false }).then(function(tx) { return tx.setTag(tags_array[5]); }),
    ]);
}

/**
 * Adds a pair of users to each transaction
 * @param {[type]} users_array An array of 3 user instances
 * @param {[type]} tx_array    An array of 6 transaction instances
 */
function add_data_add_users_to_transactions(users_array, tx_array) {
  console.log('Linking users to transactions');
  return Promise.all([
      tx_array[0].setUsers([users_array[0], users_array[1]]),
      tx_array[1].setUsers([users_array[2], users_array[0]]),
      tx_array[2].setUsers([users_array[1], users_array[2]]),
      tx_array[3].setUsers([users_array[0], users_array[1]]),
      tx_array[4].setUsers([users_array[2], users_array[0]]),
      tx_array[5].setUsers([users_array[1], users_array[2]])
    ]);
}

function add_data() {
  return add_data_make_user_instances_array()
    .then(function(users_array) {
      return add_data_make_tag_instances_array(users_array)
        .then(add_data_make_transaction_instance_array)
        .then(add_data_add_users_to_transactions.bind(null, users_array));
    });
}

function find_all_tags_related_to_user(user_id) {

}

function print_result(result_set, data) {
  console.log('');
  console.log('Result set: ' + result_set);
  console.log(JSON.stringify(data, null, 2));
  console.log('');
  return data
}

sq.sync({ force: true })
.then(add_data)
.then(find_all_tags_related_to_user.bind(null, 0))
.then(print_result.bind(null, 'user.id===0'))
.then(find_all_tags_related_to_user.bind(null, 1))
.then(print_result.bind(null, 'user.id===1'))
.then(find_all_tags_related_to_user.bind(null, 2))
.then(print_result.bind(null, 'user.id===2'))
.then(function() {
  sq.close();
})
.catch(function(err) {
  console.warn('REJECTED PROMISE: ' + err);
  console.warn(err.stack);
})
.done();