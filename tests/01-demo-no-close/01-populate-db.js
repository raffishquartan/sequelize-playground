'use strict';

var q = require('q');
var Sequelize = require('sequelize');

var sq_config = require('../sequelize-config-pg');
sq_config.options.define.schema = 's01';
var sq = new Sequelize(sq_config.database, sq_config.username, sq_config.password, sq_config.options);

var models = {
  entry: sq.define('entry', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      validate: {
        isUUID: 4
      },
      primaryKey: true
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      }
    },
    body: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    }
  }, {
  }),

  tag: sq.define('tag', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      validate: {
        isUUID: 4
      },
      primaryKey: true
    },
    value: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
      }
    }
  }, {
  })
};

models.tag.belongsToMany(models.entry, { through: 'entry_tag' });
models.entry.belongsToMany(models.tag, { through: 'entry_tag' });

sq.sync({ force: true })
.then(function() {
  var hard_coded_tag_promises = q.all([
    models.tag.create({value: 'foo'}),
    models.tag.create({value: 'bar'}),
    models.tag.create({value: 'baz'})
  ]);

  var hard_coded_entry_promises = q.all([
    models.entry.create({
      body: 'This is entry 0. Here is some text.',
      date: new Date(2015, 2, 10)
    }), models.entry.create({
      body: 'This is entry one. Here is some more text.',
      date: new Date(2015, 2, 10)
    }), models.entry.create({
      body: 'This is entry tertius III. Here is interesting text.',
      date: new Date(2015, 2, 12)
    }), models.entry.create({
      body: 'this is entry iv i dont know punctuation',
      date: new Date(2015, 2, 11)
    }), models.entry.create({
      body: 'This is entry si4 with id 5 and a fullstop.',
      date: new Date(2015, 2, 13)
    }), models.entry.create({
      body: 'This is entry hex. Should I be a magical curse?',
      date: new Date(2015, 2, 14)
    })
  ]);
  return q.all([hard_coded_tag_promises, hard_coded_entry_promises]);
})
.spread(function(hard_coded_tags, hard_coded_entries) {
  return q.all([
    hard_coded_entries[0].setTags([hard_coded_tags[0], hard_coded_tags[1]]),
    hard_coded_entries[1].setTags([hard_coded_tags[2]]),
    hard_coded_entries[2].setTags([hard_coded_tags[1], hard_coded_tags[2]]),
    hard_coded_entries[3].setTags([hard_coded_tags[0]]),
    hard_coded_entries[4].setTags([hard_coded_tags[1]]),
    hard_coded_entries[5].setTags([hard_coded_tags[0], hard_coded_tags[1], hard_coded_tags[2]])
  ]);
})
.then(function() {
  //sq.close();
})
.catch(function(err) {
  console.warn('Rejected promise: ' + err);
  console.warn(err.stack);
})
.done();
