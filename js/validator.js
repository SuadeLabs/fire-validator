(function(window, $) {

  var schemas = window.schemas;
  var utils = window.utils;
  var logger = new window.Logger($('.validation-message'));
  var jsonEl = $('#json');
  var resultsEl = $('#results');
  var results = {};

  function validate() {
    logger.clear();
    $('.lint-table').hide();

    var json = lintJSON(jsonEl.val());
    if(!json) { return; }

    var result = schemas['batch'].validate(json);
    updateResult('batch', result);

    var entry = json.data && json.data.length ? json.data[0] : json;

    $.each(schemas, function(type, schema) {
      if(type === 'batch') { return; }
      updateResult(type, schema.validate(entry));
    });
  };

  function lintJSON(json) {
    if(!json) {
      logger.log('Please provide some JSON to validate against');
      return;
    }

    var results = jslint(json, { white: true });
    if(!results.ok) {
      logger.log('Invalid JSON');
      updateLintWarnings(results.warnings);
      return;
    }

    return JSON.parse(json);
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

  function createLintRow(warning) {
    var el = getTemplate('.lint-row');

    el.find('.lint-row-line').first().html(warning.line);
    el.find('.lint-row-warning').first().html(warning.message);

    return el;
  }

  function updateLintWarnings(warnings) {
    var table = $('.lint-table');
    var rows = warnings.map(createLintRow);

    table.find('.lint-row').not('.template').remove();
    table.find('tbody').append(rows);

    table.show();
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

      var rows = result.errors.map(createErrorRow);

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
