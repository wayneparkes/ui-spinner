(function () {

    'use strict';

    /*jslint browser:true */
    /*global document, jQuery */

    // Copyright (c) 2014 Wayne Parkes. All rights reserved.
    // MIT License

    var scripts = document.getElementsByTagName('script'),
        thisScriptTag = scripts[scripts.length - 1],
        getAttr = function (dataName) {
            return thisScriptTag.getAttribute('data-' + dataName);
        },
        defaults = {
            'image' : getAttr('image') || '',
            'time' : getAttr('time') || 750,
            'position' : getAttr('position') || ''
        // ,    'position' : { x: getAttr('pos-x') || 'center', y: getAttr('pos-y') || 'center' }
        // ,    'origin' : { x: getAttr('org-x') || 'center', y: getAttr('org-y') || 'center' }
        // ,    'padding' : { w: getAttr('pad-w') || 0, h: getAttr('pad-h') || 0 }
        // ,    'scale' : getAttr('scale') || 1
        };


    function css(domElement, styleProp, value) {
        var styleValue = '',
            vendors = [ '-moz-', '-webkit-', '-o-', '-ms-', '-khtml-', '' ],
            toCamelCase = function (s) {
                return s.toLowerCase().replace(/(\-[a-z])/g, function ($1) {
                    return $1.toUpperCase().replace('-', '');
                });
            },
            i,
            l,
            p;

        if (arguments.length > 2) {
            // Setter
            for (i = 0, l = vendors.length; i < l; i += 1) {
                p = toCamelCase(vendors[i] + styleProp);
                if (domElement.style[p] !== undefined) {
                    domElement.style[p] = value;
                }
            }
        } else {
            // Getter
            if (domElement.currentStyle) {
                /*jslint unparam: true*/
                styleProp = styleProp.replace(/\-(\w)/g, function (match, p1) {
                    return p1.toUpperCase();
                });
                /*jslint unparam: false*/
                styleValue = domElement.currentStyle[styleProp];
            } else if (window.getComputedStyle) {
                styleValue = document.defaultView.getComputedStyle(domElement, null).getPropertyValue(styleProp);
            }
            return styleValue;
        }
    }

    function makeRelative(target) {
        if (!/relative|absolute|fixed/.test(css(target, 'position'))) {
            css(target, 'position', 'relative');
        }
    }


    function Spinner(target, options) {

        this.config = options || {};
        this.config.image = this.config.image || defaults.image;
        this.config.time = this.config.time || defaults.time;
        this.config.position = this.config.position || defaults.position;
        // this.config['origin'] = this.config['origin'] || defaults['origin'];
        // this.config['padding'] = this.config['padding'] || defaults['padding'];
        // this.config['scale'] = this.config['scale'] || defaults['scale'];


        if (!this.config.image) {
            throw new ReferenceError('Spinner is missing an image reference');
        }


        var targetElement = (typeof jQuery === 'function' && target instanceof jQuery) ? target[0] : target;


        if (targetElement.spinner !== undefined) {
            return false;
        }


        this.count = 0;
        this.isSpinning = false;


        this.element = document.createElement('div');
        this.element.className = 'spinner';
        css(this.element, 'transition', 'opacity ' + this.config.time + 'ms ease-in');


        this.spriteElement = document.createElement('div');
        this.spriteElement.className = 'spinner-sprite';


        this.spriteImage = document.createElement('img');
        this.spriteImage.src = this.config.image;


        this.targetElement = targetElement;
        css(this.targetElement, 'transition', 'padding ' + (this.config.time / 2) + 'ms cubic-bezier(.76,-0.39,.32,1.34)');

        makeRelative(this.targetElement);


        this.spriteElement.appendChild(this.spriteImage);
        this.element.appendChild(this.spriteElement);
        this.targetElement.appendChild(this.element);


        this.targetElement.spinner = this;
    }

    Spinner.prototype = {
        spin : function () {
            var self = this;

            this.setPosition();

            this.element.className += ' spin';

            this.loop = setInterval(function () {
                if (self.count === 19) {
                    self.count = 0;
                }
                css(self.spriteImage, 'top', (-self.dimension * self.count) + 'px');
                self.count += 1;
            }, this.interval);
        },
        start : function (interval) {
            if (!this.isSpinning) {

                this.isSpinning = true;

                this.interval = interval || 50;

                if (this.dimension === undefined) {

                    var self = this,
                        setDimensions = function (width) {
                            self.dimension = width;

                            css(self.spriteElement, 'width', self.dimension + 'px');
                            css(self.spriteElement, 'height', self.dimension + 'px');
                            css(self.spriteElement, 'margin-top', '-' + (self.dimension / 2) + 'px');
                            css(self.spriteElement, 'margin-left', '-' + (self.dimension / 2) + 'px');

                            self.spin();
                        },
                        i = new Image();

                    i.onload = function () {
                        setDimensions(i.width);
                    };

                    i.src = this.config.image;
                } else {
                    this.spin();
                }
            }
        },
        stop : function (fn) {
            if (this.isSpinning) {

                var self = this,
                    callback = fn || function () { return; };

                this.element.className = this.element.className.replace(/(?:^|\s)spin(?!\S)/, '');

                setTimeout(function () {
                    clearInterval(self.loop);
                    self.restorePosition(function () {
                        self.isSpinning = false;
                        callback();
                    });
                }, parseInt(this.config.time, 10));
            }
        },
        destroy : function (fn) {

            var self = this,
                callback = fn || function () { return; };

            this.stop(function () {
                self.element.parentNode.removeChild(self.element);
                delete self.targetElement.spinner;
                callback();
            });
        },
        setPosition : function () {

            // Scale spinner if larger than target
            var targetHeight = Math.floor(parseInt(css(this.targetElement, 'height'), 10));
            if (targetHeight && (targetHeight < this.dimension)) {
                css(this.element, 'transform', 'scale(' + (+(targetHeight / this.dimension).toFixed(3)) + ')');
            }

            // Position the spinner
            if (this.config.position) {

                this.cachedTargetPadding = Math.floor(parseInt(css(this.targetElement, 'padding-' + this.config.position), 10));

                css(this.targetElement, 'padding-' + this.config.position, (this.dimension + this.cachedTargetPadding) + 'px');
                css(this.element, this.config.position, (this.cachedTargetPadding / 2) + 'px');

                this.element.className += ' ' + this.config.position;

                if (/left|right/.test(this.config.position)) {
                    css(this.element, 'width', this.dimension + 'px');
                } else {
                    css(this.element, 'height', this.dimension + 'px');
                }
            }
        },
        restorePosition : function (fn) {

            var callback = fn || function () { return; };

            if (this.config.position) {
                css(this.targetElement, 'padding-' + this.config.position, this.cachedTargetPadding + 'px');
                this.element.className = this.element.className.replace(new RegExp('(?:^|\\s)' + this.config.position + '(?!\\S)'), '');
            }

            setTimeout(function () {
                callback();
            }, this.config.time / 2);
        }
    };


    (function () {
        var styleSheets = document.getElementsByTagName('style'),
            stylesCreated = false,
            styles,
            head,
            s,
            i,
            l;

        for (i = 0, l = styleSheets.length; i < l; i += 1) {
            if (styleSheets[i].getAttribute('title') === 'spinner-styles') {
                stylesCreated = true;
                break;
            }
        }

        if (!stylesCreated) {
            styles = '.spinner { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; }.spinner.spin { opacity: 1; }.spinner.top { bottom: auto; }.spinner.right { left: auto; }.spinner.bottom { top: auto; }.spinner.left { right: auto; }.spinner-sprite { position: absolute; top: 50%; left: 50%; overflow: hidden; }.spinner-sprite img { position: absolute; left: 0; }.spinner-sprite img[src$=\'.png\'] { image-rendering: -o-crisp-edges; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; -ms-interpolation-mode: nearest-neighbor; }';
            head = document.head || document.getElementsByTagName('head')[0];
            s = document.createElement('style');

            if ((new RegExp('MSIE [78]')).exec(navigator.userAgent)) {
                styles += '.spinner { visibility: hidden; }.spinner.spin { visibility: visible; }';
            }

            s.setAttribute('type', 'text/css');
            s.setAttribute('title', 'spinner-styles');

            if (s.styleSheet) {
                s.styleSheet.cssText = styles;
            } else if (document.createTextNode !== undefined) {
                s.appendChild(document.createTextNode(styles));
            }

            head.appendChild(s);
        }
    }());


    window.spinner = {
        create : function (target, options) {
            return new Spinner(target, options);
        }
    };
}());