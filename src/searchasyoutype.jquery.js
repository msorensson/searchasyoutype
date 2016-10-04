(function($) {
    var SearchAsYouType = require('./index');

    $.fn.searchAsYouType = function(options) {
        return this.each(function() {
            new SearchAsYouType(this, options);
        });
    };
})(jQuery);
