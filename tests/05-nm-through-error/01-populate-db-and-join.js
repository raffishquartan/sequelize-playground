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

/**
 * Method: Sequelize findAll from StackOverflow
 * Goal: Find all tags associated with a user (as owner or when they are party to a transaction associated with a tag).
 * Result: Error
 *
 * @param  {Any}     user_id Any value that can be coerced to a numerical ID for a user
 * @return {Promise}         A promise for the result of the findAll
 */
function find_all_tags_related_to_user_erroring(user_id) {
  return models.tag.findAll({
    where: { owner_id: user_id }, // missing OR user_transaction.user_id = user_id
    include: [{
      model: models.transaction,
      attributes: ['id'],
      through: {model: models.user_tx, where: {user_id: user_id}, attributes: ['user_id', 'tx_id']},
      where: {
        active: true
      },
      required: false, // include tags that do not have an associated Transaction
    }]
  })
}

/**
 * Method: Sequelize raw query from StackOverflow
 * Goal: Find all tags associated with a user (as owner or when they are party to a transaction associated with a tag).
 * Result - exact id's returned sometimes change depending on promise resolution order for setTag calls
 * [
 *  {
 *    "id": "1",
 *    "owner_id": "1"
 *  },
 *  {
 *    "id": "2",
 *   "owner_id": "1"
 *  },
 *  {
 *    "id": "4",
 *    "owner_id": "2"
 *  },
 *  {
 *    "id": "7",
 *    "owner_id": "3"
 *  },
 *  {
 *    "id": "10",
 *    "owner_id": "3"
 *  }
 * ]
 *
 * @param  {Any}     user_id Any value that can be coerced to a numerical ID for a user
 * @return {Promise}         A promise for the result of the query
 */
function find_all_tags_related_to_user_raw_so(user_id) {
  var sql = 'select * from s05.tag ' +
            'left outer join s05.transaction on s05.tag.id = s05.transaction.tag_id ' +
            'left outer join s05.user_tx on s05.transaction.id = s05.user_tx.tx_id ' +
            'where s05.tag.owner_id = ' + user_id + ' or s05.user_tx.user_id = ' + user_id;

  return sq.query(sql, { type: sq.QueryTypes.SELECT})
    .then(function(data_array) {
      return _.map(data_array, function(data) {
        return models.tag.build(data, { isNewRecord: false });;
      });
    })
    .catch(function(err) {
      console.warn('REJECTED PROMISE: ' + err);
      console.error(err);
      console.error(err.stack);
      return err;
    });
}

/**
 * Method: Sequelize raw query that returns all tags in the set:
 *   {owned by user_id U {all tags associated with a transaction associated with user_id}}
 * Goal: Find all tags associated with a user (as owner or when they are party to a transaction associated with a tag).
 * Result - exact id's returned sometimes change depending on promise resolution order for setTag calls
 * [
 *  {
 *    "id": "tag4-user3",
 *    "owner_id": "3"
 *  },
 *  {
 *    "id": "tag2-user2",
 *    "owner_id": "2"
 *  },
 *  {
 *    "id": "tag1-user1",
 *    "owner_id": "1"
 *  },
 *  {
 *    "id": "tag5-user3",
 *    "owner_id": "3"
 *  }
 * ]
 *
 * @param  {Any}     user_id Any value that can be coerced to a numerical ID for a user
 * @return {Promise}         A promise for the result of the query
 */
function find_all_tags_related_to_user_raw_alt(user_id) {
  var sql = 'select s05.tag.id, s05.tag.owner_id from s05.tag ' +
            'where s05.tag.owner_id = 1 ' +
            'union ' +
            'select s05.tag.id, s05.tag.owner_id from s05.tag, s05.transaction, s05.user_tx ' +
            'where s05.tag.id = s05.transaction.tag_id and s05.user_tx.tx_id = s05.transaction.id and ' +
            's05.user_tx.user_id = 1';

  return sq.query(sql, { type: sq.QueryTypes.SELECT})
    .then(function(data_array) {
      return _.map(data_array, function(data) {
        return models.tag.build(data, { isNewRecord: false });;
      });
    })
    .catch(function(err) {
      console.error(err);
      console.error(err.stack);
      return err;
    });
}

function print_result(result_set, data) {
  console.log();
  console.log('RESULT SET:        ' + result_set);
  console.log(JSON.stringify(data, null, 2));
  console.log();
  return data
}

/**
 * Swallow rejected promises. There'll be at least one from a failed find, this allows other find attempts to proceed.
 */
function swallow_rejected_promise(result_set, err) {
  console.log();
  console.warn('REJECTED PROMISE: ' + result_set + ' -- ' + err);
  console.warn(err.stack);
  console.log();
  return undefined;
}

sq.sync({ force: true })
.then(add_data)
.then(function() {
  return Promise.all([
    find_all_tags_related_to_user_erroring(1)
    .then(print_result.bind(null, 'user.id===1, erroring findAll from StackOverflow')) // isn't called
    .catch(swallow_rejected_promise.bind(null, 'user.id===1, erroring findAll from StackOverflow')),

    find_all_tags_related_to_user_raw_so(1)
    .then(print_result.bind(null, 'user.id===1, raw SQL from StackOverflow')),

    find_all_tags_related_to_user_raw_alt(1)
    .then(print_result.bind(null, 'user.id===1, alternate raw SQL'))
  ]);
})
.catch(swallow_rejected_promise.bind(null, 'main promise chain'))
.finally(function() {
  sq.close();
})
