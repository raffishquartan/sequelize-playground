'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config');
sq_config.options.define.schema = 's04';
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  row: sq.define('row', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    groupnum: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  }, {
  })
};

function add_data() {
  return Promise.all([
    models.row.create({ name: 'One',   groupnum: 2 }),
    models.row.create({ name: 'Two',   groupnum: 1 }),
    models.row.create({ name: 'Three', groupnum: 2 }),
    models.row.create({ name: 'Four',  groupnum: 3 }),
    models.row.create({ name: 'Five',  groupnum: 1 })
  ]);
}

function get_one_instance_per_group() {
  var sql = 'SELECT r.id, ' +
            '       r.name, ' +
            '       r.groupnum ' +
            '  FROM s04.row r ' +
            '  JOIN ' +
            '    (SELECT min(id) AS id, ' +
            '            groupnum ' +
            '     FROM s04.row ' +
            '     GROUP BY groupnum) s ON r.id = s.id';

  return sq.query(sql, { type: sq.QueryTypes.SELECT})
    .then(function(data_array) {
      return _.map(data_array, function(data) {
        return models.row.build(data, { isNewRecord: false });;
      });
    })
    .catch(function(err) {
      console.error(err);
      console.error(err.stack);
      return err;
    });
}

function update_the_values(instance_array) {
  return Promise.all(_.map(instance_array, function(instance) {
    return instance.update({ 'name': instance.get('name') + '-updated' });
  }));
}

function print_result(method, data) {
  console.log('');
  console.log('Result set:' + method);
  console.log(JSON.stringify(data, null, 2));
  console.log('');
  return data
}

sq.sync({ force: true })
.then(add_data)
.then(get_one_instance_per_group)
.then(print_result.bind(this, 'Built instances before update'))
.then(update_the_values)
.then(print_result.bind(this, 'Built instances after update'))
.then(function() {
  sq.close();
})
.catch(function(err) {
  console.warn('REJECTED PROMISE: ' + err);
  console.warn(err.stack);
})
.done();
