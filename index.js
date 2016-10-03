'use strict';
var debounce = require('lodash/debounce');
require('es6-promise').polyfill();
require('classlist-polyfill');
require('whatwg-fetch');

var SearchWidget = function(el) {
    var self = this;

    self.el = el;

    self.opts = {
        minStringLength: 3,
        inputSelector: '.search-widget__input',
        resultsSelector: '.search-widget__result-container',
        messageSelector: '.search-widget__submit--message',
        resultClassName: 'search-widget__result',
        resultNewClassName: 'search-widget__result--new',
        resultTitleClassName: 'search-widget__result-title',
        resultBodyClassName: 'search-widget__result-body',
        linkClassName: 'search-widget__link',
        endpoint: el.getAttribute('data-endpoint') || ''
    };

    self.inputElement = self.el.querySelector(self.opts.inputSelector);
    self.resultsElement = self.el.querySelector(self.opts.resultsSelector);
    self.messageElement = self.el.querySelector(self.opts.messageSelector);
    self.queryString = '';

    self.initialize = function() {
        self.addEventListeners();
    };

    self.initialize();
};

SearchWidget.prototype = {

    insertQueryMessage: function(msg) {
        var self = this;
        self.messageElement.innerHTML = msg;
    },

    afterInsertResults: function() {
        var self = this;
        var results = self.resultsElement.getElementsByClassName(self.opts.resultClassName);
        var el;

        var sequence = function(el, idx, cb) {
            setTimeout(function() {
                cb.call(null, el);
            }, 200 * idx - 200);
        };

        for (var i = 0; i < results.length; i++) {
            results[i].classList.add(self.opts.resultNewClassName);

            sequence(results[i], i, function(el) {
                el.classList.remove(self.opts.resultNewClassName);
            });
        }
    },

    insertResults: function(results) {
        var self = this;
        var html = '';

        for (var i =  0; i < results.length; i++) {
            html += '<a href="' + results[i].url + '" class="' + self.opts.resultClassName + '">';
            html += '<h3 class="' + self.opts.resultTitleClassName + '">' + results[i].title + '</h3>';
            html += '<p class="' + self.opts.resultBodyClassName + '">' + results[i].body + '</p>';
            html += '</a>';
        }

        self.resultsElement.innerHTML = html;

        self.afterInsertResults();
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

            // Pushes to GTM start.
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'search as you type',
                queryString: self.queryString,
                total: json.total,
                results: (json.results.length > 0) ? true : false
            });
            // Pushes to GTM end.

            self.insertResults(json.results);
            self.insertQueryMessage(json.link_text);
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