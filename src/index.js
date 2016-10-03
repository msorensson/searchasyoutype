'use strict';
var debounce = require('lodash/debounce');
var assign = require('lodash/assign');
var TemplateEngine = require('./templateEngine');

require('es6-promise').polyfill();
require('classlist-polyfill');
require('whatwg-fetch');

var SearchWidget = function(el, opts) {
    var self = this;

    self.el = el;

    self.opts = {
        minStringLength: 3,
        inputSelector: '.sayt__input',
        resultsSelector: '.sayt__result-container',
        messageSelector: '.sayt__submit--message',
        resultClassName: 'sayt__result',
        resultNewClassName: 'search-widget__result--new',
        resultTitleClassName: 'search-widget__result-title',
        resultBodyClassName: 'search-widget__result-body',
        linkClassName: 'search-widget__link',
        endpoint: el.getAttribute('data-endpoint') || '',
        onAfterFetch: function(queryString, data) {},
        onAfterInsertResults: function() {}
    };

    self.opts.resultsTemplate = '<a href="<%this.url%> class="' + self.opts.resultClassName + '">' +
        '<h3 class="' + self.opts.resultTitleClassName + '"><%this.title%></h3>' +
        '<p class="' + self.opts.resultBodyClassName + '"><%this.body%></p>' +
        '</a>';

    assign(self.opts, opts);

    self.inputElement = self.el.querySelector(self.opts.inputSelector);
    self.messageElement = self.el.querySelector(self.opts.messageSelector);
    self.queryString = '';

    self.initialize = function() {
        if (!self.el.querySelector(self.opts.resultsSelector)) {
            self.inputElement.insertAdjacentHTML('afterend', '<div class="' + self.opts.resultsSelector.replace('.', '') + '"></div>');
        }

        self.resultsElement = self.el.querySelector(self.opts.resultsSelector);
        self.addEventListeners();
    };

    self.initialize();
};

SearchWidget.prototype = {

    insertQueryMessage: function(msg) {
        var self = this;
        self.messageElement.innerHTML = msg;
    },

    insertResults: function(results) {
        var self = this;
        var html = '';

        for (var i =  0; i < results.length; i++) {
            html += TemplateEngine(self.opts.resultsTemplate, results[i]);
        }

        self.resultsElement.innerHTML = html;

        self.opts.onAfterInsertResults();
    },

    search: function() {
        var self = this;
        var endpoint = self.opts.endpoint + '?q=' + self.queryString;

        fetch(endpoint, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            self.opts.onAfterFetch(self.queryString, json);
            self.insertResults(json.results);

            if (json.link_text) {
                self.insertQueryMessage(json.link_text);
            }

            self.opts.onAfterInsertResults();
        }).catch(function(err) {
            // @todo implement error handling
            console.error(err);
        });
    },

    onKeyup: function() {
        var self = this;
        var currentQueryString = self.inputElement.value;

        if (currentQueryString.length < self.opts.minStringLength) {
            self.resultsElement.innerHTML = '';
            self.messageElement.innerHTML = '';
        }

        if (currentQueryString.length >= self.opts.minStringLength &&
           currentQueryString !== self.queryString) {
            self.queryString = self.inputElement.value;
            self.search();
        }

        self.queryString = currentQueryString;
    },

    addEventListeners: function() {
        var self = this;
        self.inputElement.addEventListener('keyup', debounce(self.onKeyup.bind(this), 300));
    }
};

module.exports = SearchWidget;
