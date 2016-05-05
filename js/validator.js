(function(window, $) {

  var schemas = window.schemas;

  function validate(json) {
    json = $('#json').val();

    if(!json) {
      // TODO proper messaging to UI
      console.warn('Please provide some JSON to validate against');
      return;
    }

    try {
      json = JSON.parse(json);
    } catch(e) {
      console.error('Invalid JSON');
    }

    var result = schemas['batch'].validate(json);
    updateResult('batch', result);

    if(json.data && json.data.length) {
      var entry = json.data[0];
      $.each(schemas, function(type, schema) {
        if(type === 'batch') { return; }
        updateResult(type, schema.validate(entry));
      });
    }
  };

  function getTemplate(name) {
    return $('.template' + name)
      .first()
      .clone()
      .removeClass('template');
  }

  function createErrorRow(error) {
    var el = getTemplate('.error-row');

    el.find('.error-row-type').first().html(error.keyword);
    el.find('.error-row-description').first().html(error.message);

    return el;
  }

  function createResult(type, schema) {
    var el = getTemplate('.result')
      .attr('id', type);

    el.find('.name').first().html(window.utils.title(type));
    el.find('.schema-link').first().attr('href', schema.url);
    el.find('.error-table').hide();

    return el;
  }

  function updateResult(type, result) {
    var el = results[type];
    var table = el.find('.error-table');
    var noneMessage = el.find('.error-none-message');

    el.find('.status')
      .first()
      .removeClass('red green')
      .addClass(result.status ? 'green' : 'red');

    if(result.errors) {
      table.show();
      noneMessage.hide();

      var rows = result.errors.map(function(error) {
        return createErrorRow(error);
      });

      table.find('.error-row').not('.template').remove();
      table.find('tbody').append(rows);
    } else {
      table.hide();
      noneMessage.show();
    }
  }

  var results = {};
  var resultsContainer = $('#results');
  Object.keys(schemas).forEach(function(type) {
    var el = createResult(type, schemas[type]);
    results[type] = el;
    resultsContainer.append(el);
  });

  window.validate = validate;

})(window, jQuery);
