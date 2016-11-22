(function(window, $) {

  var ajv = window.Ajv({
    allErrors: true,
    loadSchema: loadSchema
  });

  function Schema(name, url) {
    this.name = name;
    this.url = url;
    this.schema = null;
    this.validator = null;

    this.load(url);
  }

  Schema.prototype.load = function load(url) {
    var self = this;

    $.getJSON(url)
      .done(function(schema) {
        self.schema = schema;
        self.process();
      })
      .fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.error( "Request Failed: " + err );
      });

    return self;
  };

  Schema.prototype.process = function process() {
    var self = this;

    ajv.compileAsync(self.schema, function(err, validate) {
      if(err) {
        console.error('Failed to compile validator for', self.name, '-', err);
        return;
      };
      self.validator = validate;
    });

    return self;
  };

  Schema.prototype.validate = function validate(json) {
    if(!this.validator) {
      console.warn('Validator for', this.name, 'has not loaded yet. Please try again.');
      return;
    }

    var valid = this.validator(json);

    return {
      type: this.name,
      status: valid,
      errors: this.validator.errors
    };
  };

  function loadSchema(uri, callback) {
    var type = uri.match(/\/(\w+).json$/)[1];

    if(schemas[type] && schemas[type].schema) {
      callback(null, schemas[type].schema);
    } else {
      $.getJSON(urls[type])
        .done(function(schema) {
          callback(null, schema);
        })
        .fail(function(jqxhr, textStatus, error) {
          var err = textStatus + ", " + error;
          console.error( "Request failed:", uri, err );
        });
    }
  }

  var urls = {
    'batch': 'batch_schema.json',
    'types': 'schemas/v1-dev/types.json',
    'entity': 'schemas/v1-dev/entity.json',
    'account': 'schemas/v1-dev/account.json',
    'collateral': 'schemas/v1-dev/collateral.json',
    'derivative': 'schemas/v1-dev/derivative.json',
    'derivative_cash_flow': 'schemas/v1-dev/derivative_cash_flow.json',
    'customer': 'schemas/v1-dev/customer.json',
    'loan': 'schemas/v1-dev/loan.json',
    'loan_transaction': 'schemas/v1-dev/loan_transaction.json'
  };

  var schemas = {};
  Object.keys(urls).forEach(function(type) {
    schemas[type] = new Schema(type, urls[type]);
  });

  window.schemas = schemas;

})(window, jQuery);
