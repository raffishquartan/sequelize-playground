'use strict';

var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config-mysql');
sq_config.database = 's07';
sq_config.options.sync.match = /s07/;
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  User: sq.define('User', {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      field:'first_name'
    },
    lastName: {
      type: Sequelize.STRING,
      field:'last_name'
    },
    phone: {
      type: Sequelize.STRING
    }
  }),

  Category: sq.define('Category', {
    name: {
      type: Sequelize.STRING,
      allowNull:false,
      unique:true,
    },
    description: {
      type: Sequelize.STRING
    }
  })
};

models.Category.belongsToMany(models.User, {
  through: 'UsersCategory',
  foreignKey: {
    name:'categoryId',
    field:'category_id'
  }
});

models.User.belongsToMany(models.Category, {
  through: 'UsersCategory',
  foreignKey: {
    name:'userId',
    field:'user_id'
  }
});


function find_all() {
  return models.User.findAll({
    include: [
      {all: true}
    ]
  })
}

/**
 * Swallow rejected promises. There'll be at least one from a failed find, this allows other find attempts to proceed
 * in the Promise.all
 */
function swallow_rejected_promise(location_description, err) {
  console.log();
  console.warn('REJECTED PROMISE: ' + location_description + ' -- ' + err);
  console.warn(err.stack);
  console.log();
  return undefined;
}

sq.sync({ force: true })
.then(find_all)
.catch(swallow_rejected_promise.bind(null, 'main promise chain'))
.finally(function() {
  sq.close();
})
