'use strict';

var Promise = require('bluebird');
var Sequelize = require('sequelize');
var _ = require('lodash');

var sq_config = require('../sequelize-config-pg');
sq_config.options.define.schema = 's14';
sq_config.options.define.paranoid = false;
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  User: sq.define('User', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING
    }
  }),
  Thing: sq.define('Thing', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    }
  })
};

models.Thing.belongsTo(models.User);
//models.User.hasOne(models.Thing);

function print_result(description, result) {
  console.log(description + ':\n' + JSON.stringify(result, null, 2));
  return result;
}

function swallow_rejected_promise(result_set, err) {
  console.warn('REJECTED PROMISE: ' + result_set + ' -- ' + err);
  console.warn(err.stack);
  return null;
}

/*
// Do it using include with alias
sq.sync({ force: true })
.then(function () {
  return models.User.create({email: 'asdf@example.org'});
})
.then(function(user) {
  return models.Thing.create({ // fails while trying to save included User instance - it is treated as a new record
    name: 'thingthing',
    User: user
  }, {
    include: [{
      model: models.User
    }],
    fields: ['name'] // seems nec to specify all non-included fields because of line 277 in instance.js - bug?
  });
})
.then(print_result.bind(null, 'Thing with User...'))
.catch(swallow_rejected_promise.bind(null, 'main promise chain'))
.finally(function() {
  return sq.close();
});
*/

// Uses setters but Thing exists without associated User inside transaction
sq.sync({ force: true })
.then(function() {
  return sq.transaction(function(tr) {
    return Promise.all([
      models.User.create({email: 'asdf@example.org'}),
      models.Thing.create({name: 'A thing'})
    ])
    .spread(function(user, thing) {
      return thing.setUser(user);
    })
    .then(print_result.bind(null, 'Thing with User...'));
  });
})
.catch(swallow_rejected_promise.bind(null, 'main promise chain'))
.finally(function() {
  return sq.close();
});
