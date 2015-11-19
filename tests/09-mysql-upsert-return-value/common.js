module.exports = function(sq, Sequelize) {
  var models = {
    site: sq.define('site', {
      name: { type: Sequelize.STRING(50) },
      domain: {
        type: Sequelize.STRING(50),
        primaryKey: true
      },
    })
  };

  function upsert_data_1() {
    return models.site.upsert({
      name: 'foo',
      domain: 'foo',
    });
  }

  function upsert_data_2() {
    return models.site.upsert({
      name: 'bar',
      domain: 'foo'
    })
  }

  function print_result(description, result) {
    console.log(description + ': ' + result);
    return result;
  }

  function swallow_rejected_promise(result_set, err) {
    console.warn('REJECTED PROMISE: ' + result_set + ' -- ' + err);
    console.warn(err.stack);
    return null;
  }

  sq.sync({ force: true })
  .then(upsert_data_1)
  .then(print_result.bind(null, 'Return value of upsert_data_1 - should be true'))
  .then(upsert_data_1)
  .then(print_result.bind(null, 'Return value of upsert_data_1 - should be false'))
  .then(upsert_data_2)
  .then(print_result.bind(null, 'Return value of upsert_data_2 - should be false'))
  .then(upsert_data_1)
  .then(print_result.bind(null, 'Return value of upsert_data_1 - should be false'))
  .catch(swallow_rejected_promise.bind(null, 'main promise chain'))
  .finally(function() {
    return sq.close();
  });
}
