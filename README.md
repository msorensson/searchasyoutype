# Search As You type

A customizable search-as-you-type javascript widget.

## Installation
Install with npm (preferred) by typing
```
    npm install searchasyoutype
```
or just download the package and add searchasyoutype.min.js to your project.

## Usage
Basic markup:
```html
    <form class="my-form" data-endpoint="my-json-endpoint.json">
        <input class="sayt__input" name="q" placeholder="Start typing" />
    </form>
```
The javascript:
```javascript
    var SearchAsYouType = require('searchasyoutype');
    var el = document.querySelector('.my-form');

    new SearchAsYouType(el, { // options });
```

## Options
These are the options you can provide to override default behaviour:

* `minStringLength` The minimum length of the typed input that should perform a search (default: 3)
* `inputSelector` The class of the input field (default: '.sayt__input')
* `resultsSelector` The class of the container the results are rendered in (default: '.sayt__result-container')
* `resultClassName` Class of a single result item (default: 'sayt__result')
* `resultTitleClassName` Class of result title (default: 'sayt__result-title')
* `resultBodyClassName` Class of result body (default: 'sayt__result-body')
* `linkClassName` Class of the link that displays number of result and provides link to all results (default: 'sayt__link')
* `endpoint` If you prefer not to privde endpoint through elements data-endpoint attribute
* `onBeforeFetch` Called before ajax call is made. Takes queryString as argument. (default: function(queryString) {})
* `onAfterFetch`: Called after ajax call has been made. Takes queryString and response json data as arguments. (default: function(queryString, data) {})
* `onAfterInsertResults` Called after results are inserted in results element. (default: function() {})

## jQuery plugin
SearchAsYouType does not require jQuery but there is a jQuery plugin if you prefer.

```html
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script src="searchasyoutype.jquery.min.js"></script>
    <script>
        $('.my-element').searchAsYouType({ // options });
    </script>

```

## Licence
Copyright 2016 Martin Sörensson.

Released under MIT License.
