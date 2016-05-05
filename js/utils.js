(function(window, $) {

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function title(s) {
    return s.split('_').map(capitalize).join(' ');
  }

  function removePrefix(s, p) {
    return s ? s.replace(p, '') : s;
  }

  window.utils = {
    capitalize: capitalize,
    title: title,
    removePrefix: removePrefix
  };

})(window, jQuery);
