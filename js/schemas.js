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

  var version = 'schemas/v1-dev/';
  var urls = {
    'batch': version + 'batch.json',
    'account': version + 'account.json',
    'account_aggregate': version + 'account_aggregate.json',
    'collateral': version + 'collateral.json',
    'customer': version + 'customer.json',
    'loan': version + 'loan.json',
    'loan_aggregate': version + 'loan_aggregate.json',
    'loan_transaction': version + 'loan_transaction.json',
    'security': version + 'security.json'
  };

  var schemas = {};
  Object.keys(urls).forEach(function(type) {
    schemas[type] = new Schema(type, urls[type]);
  });

  window.schemas = schemas;

})(window, jQuery);
