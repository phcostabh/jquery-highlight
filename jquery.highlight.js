/*
 * jQuery Highlight plugin
 *
 * Based on highlight v3 by Johann Burkard
 * http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
 *
 * Code a little bit refactored and cleaned (in my humble opinion).
 * Most important changes:
 *  - has an option to highlight only entire words (wordsOnly - false by default),
 *  - has an option to be case sensitive (caseSensitive - false by default)
 *  - highlight element tag and class names can be specified in options
 *
 * Usage:
 *   // wrap every occurrance of text 'lorem' in content
 *   // with <span class='highlight'> (default options)
 *   $('#content').highlight('lorem');
 *
 *   // search for and highlight more terms at once
 *   // so you can save some time on traversing DOM
 *   $('#content').highlight(['lorem', 'ipsum']);
 *   $('#content').highlight('lorem ipsum');
 *
 *   // search only for entire word 'lorem'
 *   $('#content').highlight('lorem', { wordsOnly: true });
 *
 *   // don't ignore case during search of term 'lorem'
 *   $('#content').highlight('lorem', { caseSensitive: true });
 *
 *   // wrap every occurrance of term 'ipsum' in content
 *   // with <em class='important'>
 *   $('#content').highlight('ipsum', { element: 'em', className: 'important' });
 *
 *   // remove default highlight
 *   $('#content').unhighlight();
 *
 *   // remove custom highlight
 *   $('#content').unhighlight({ element: 'em', className: 'important' });
 *
 *
 * Copyright (c) 2009 Bartek Szopka
 *
 * Licensed under MIT license.
 *
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function (jQuery) {
    jQuery.extend({
        highlight: function (node, re, nodeName, className, ignoreDiacritics) {
            if (node.nodeType === 3) {
                var subject = ignoreDiacritics ? jQuery.removeDiacritcs(node.data) : node.data;
                var match = subject.match(re);
                if (match) {
                    var highlight = document.createElement(nodeName || 'span');
                    highlight.className = className || 'highlight';
                    var wordNode = node.splitText(match.index);
                    wordNode.splitText(match[0].length);
                    var wordClone = wordNode.cloneNode(true);
                    highlight.appendChild(wordClone);
                    wordNode.parentNode.replaceChild(highlight, wordNode);
                    return 1; //skip added node in parent
                }
            } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
                    !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
                    !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
                for (var i = 0; i < node.childNodes.length; i++) {
                    i += jQuery.highlight(node.childNodes[i], re, nodeName, className, ignoreDiacritics);
                }
            }
            return 0;
        },

        removeDiacritcs: function (word) {
			return word
				.replace(/[\u00c0-\u00c6]/g, 'A')
				.replace(/[\u00e0-\u00e6]/g, 'a')
				.replace(/[\u00c7]/g, 'C')
				.replace(/[\u00e7]/g, 'c')
				.replace(/[\u00c8-\u00cb]/g, 'E')
				.replace(/[\u00e8-\u00eb]/g, 'e')
				.replace(/[\u00cc-\u00cf]/g, 'I')
				.replace(/[\u00ec-\u00ef]/g, 'i')
				.replace(/[\u00d1|\u0147]/g, 'N')
				.replace(/[\u00f1|\u0148]/g, 'n')
				.replace(/[\u00d2-\u00d8|\u0150]/g, 'O')
				.replace(/[\u00f2-\u00f8|\u0151]/g, 'o')
				.replace(/[\u0160]/g, 'S')
				.replace(/[\u0161]/g, 's')
				.replace(/[\u00d9-\u00dc]/g, 'U')
				.replace(/[\u00f9-\u00fc]/g, 'u')
				.replace(/[\u00dd]/g, 'Y')
				.replace(/[\u00fd]/g, 'y');
        }
    });

    jQuery.fn.unhighlight = function (options) {
        var settings = { className: 'highlight', element: 'span' };
        jQuery.extend(settings, options);

        return this.find(settings.element + '.' + settings.className).each(function () {
            var parent = this.parentNode;
            parent.replaceChild(this.firstChild, this);
            parent.normalize();
        }).end();
    };

    jQuery.fn.highlight = function (words, options) {
        var settings = {
            className: 'highlight',
            element: 'span',
            caseSensitive: false,
            wordsOnly: false,
            ignoreDiacritics: false,
        };

        jQuery.extend(settings, options);

        if (words.constructor === String) {
            words = [words];
        }

        words = jQuery.grep(words, function(word) {
          return word !== '';
        });

        words = jQuery.map(words, function(word) {
          if (settings.ignoreDiacritics) {
              word = jQuery.removeDiacritcs(word);
          }

          return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        });

        if (words.length === 0) { return this; }

        var flag = settings.caseSensitive ? '' : 'i';
        var pattern = '(' + words.join('|') + ')';

        if (settings.wordsOnly) {
            pattern = '\\b' + pattern + '\\b';
        }

        var re = new RegExp(pattern, flag);

        return this.each(function () {
            jQuery.highlight(this, re, settings.element, settings.className, settings.ignoreDiacritics);
        });
    };
}));