'use strict';
var debounce = require('lodash/debounce');
var assign = require('lodash/assign');
var template = require('lodash/template');
var forEach = require('lodash/forEach');

require('es6-promise').polyfill();
require('classlist-polyfill');
require('whatwg-fetch');

var SearchAsYouType = function(el, opts) {
    var self = this;

    self.el = el;

    self.opts = {
        minStringLength: 3,
        inputSelector: '.sayt__input',
        resultsSelector: '.sayt__result-container',
        messageSelector: '.sayt__submit--message',
        resultClassName: 'sayt__result',
        resultTitleClassName: 'sayt__result-title',
        resultBodyClassName: 'sayt__result-body',
        linkClassName: 'sayt__link',
        endpoint: el.getAttribute('data-endpoint') || '',
        onBeforeFetch: function(queryString) {},
        onAfterFetch: function(queryString, data) {},
        onAfterInsertResults: function() {}
    };

    self.opts.template = '<a href="<%= linkUrl %>" class="sayt__link"><%= linkText %></a>' +
        '<% forEach(results, function(result) { %>' +
        '<a href="<%= result.url %>" class="' + self.opts.resultClassName + '">' +
        '<h3 class="' + self.opts.resultTitleClassName + '"><%= result.title %></h3>' +
        '<p class="' + self.opts.resultBodyClassName + '"><%= result.body %></p>' +
        '</a>' +
        '<% }); %>';

    assign(self.opts, opts);
    self.compiledTemplate = template(self.opts.template, { 'imports': { 'forEach': forEach } });

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

SearchAsYouType.prototype = {

    insertQueryMessage: function(msg) {
        var self = this;
        self.messageElement.innerHTML = msg;
    },

    insertResults: function(data) {
        var self = this;
        self.resultsElement.innerHTML = self.compiledTemplate(data);
    },

    search: function() {
        var self = this;
        var endpoint = self.opts.endpoint + '?q=' + self.queryString;
        self.opts.onBeforeFetch(self.queryString);

        fetch(endpoint, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            self.opts.onAfterFetch(self.queryString, json);
            self.insertResults(json);

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

module.exports = SearchAsYouType;
