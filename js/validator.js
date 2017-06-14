(function(window, $) {

  var schemas = window.schemas;
  var utils = window.utils;
  var logger = new window.Logger($('.validation-message'));
  var jsonEl = $('#json');
  var resultsEl = $('#results');
  var results = {};

  function validate() {
    logger.clear();

    var json = lintJSON(jsonEl.val());
    if(!json) { return; }

    var result = schemas['batch'].validate(json);
    updateResult('batch', result);

    if(json.data && json.data.length) {
      $.each(json.data, function (i, entry) {
        $.each(schemas, function(type, schema) {
          if(type === 'batch') { return; }
          updateResult(type, schema.validate(entry));
        });
      });
    }
  };

  function lintJSON(json) {
    if(!json) {
      logger.log('Please provide some JSON to validate against');
      return;
    }

    try {
      json = JSON.parse(json);
    } catch(e) {
      logger.log('Invalid JSON');
      return;
    }

    return json;
  }

  function prettifyJSON() {
    logger.clear();

    var json = lintJSON(jsonEl.val());
    if(!json) { return; }

    jsonEl.val(JSON.stringify(json, null, "  "));
  }

  function getTemplate(name) {
    return $('.template' + name)
      .first()
      .clone()
      .removeClass('template');
  }

  function createErrorRow(error) {
    var el = getTemplate('.error-row');

    el.find('.error-row-type').first().html(error.keyword);
    el.find('.error-row-field').first().html(utils.removePrefix(error.dataPath, '.'));
    el.find('.error-row-description').first().html(error.message);

    return el;
  }

  function createResult(type, schema) {
    var el = getTemplate('.result')
      .attr('id', type);

    el.find('.name').first().html(utils.title(type));
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

  Object.keys(schemas).forEach(function(type) {
    var el = createResult(type, schemas[type]);
    results[type] = el;
    resultsEl.append(el);
  });

  window.prettify = prettifyJSON;
  window.validate = validate;

})(window, jQuery);
