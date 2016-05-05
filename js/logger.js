(function(window, $) {

  function Logger(el) {
    this.el = el;
  }

  Logger.prototype.log = function(msg) {
    this.el.html(msg);
  }

  Logger.prototype.clear = function() {
    this.el.empty();
  }

  window.Logger = Logger;

})(window, jQuery);
