(function ($) {
    // Monkey patch jQuery 1.3.1+ css() method to support CSS 'transform'
    // property uniformly across Safari/Chrome/Webkit, Firefox 3.5+, IE 9+, and Opera 11+.
    // 2009-2011 Zachary Johnson www.zachstronaut.com
    // Updated 2011.05.04 (May the fourth be with you!)
    function getTransformProperty(element)
    {
        // Try transform first for forward compatibility
        // In some versions of IE9, it is critical for msTransform to be in
        // this list before MozTranform.
        var properties = ['transform', 'WebkitTransform', 'msTransform', 'MozTransform', 'OTransform'];
        var p;
        while (p = properties.shift())
        {
            if (typeof element.style[p] != 'undefined')
            {
                return p;
            }
        }
        
        // Default to transform also
        return 'transform';
    }
    
    var _propsObj = null;
    
    var proxied = $.fn.css;
    $.fn.css = function (arg, val)
    {
        // Temporary solution for current 1.6.x incompatibility, while
        // preserving 1.3.x compatibility, until I can rewrite using CSS Hooks
        if (_propsObj === null)
        {
            if (typeof $.cssProps != 'undefined')
            {
                _propsObj = $.cssProps;
            }
            else if (typeof $.props != 'undefined')
            {
                _propsObj = $.props;
            }
            else
            {
                _propsObj = {}
            }
        }
        
        // Find the correct browser specific property and setup the mapping using
        // $.props which is used internally by jQuery.attr() when setting CSS
        // properties via either the css(name, value) or css(properties) method.
        // The problem with doing this once outside of css() method is that you
        // need a DOM node to find the right CSS property, and there is some risk
        // that somebody would call the css() method before body has loaded or any
        // DOM-is-ready events have fired.
        if
        (
            typeof _propsObj['transform'] == 'undefined'
            &&
            (
                arg == 'transform'
                ||
                (
                    typeof arg == 'object'
                    && typeof arg['transform'] != 'undefined'
                )
            )
        )
        {
            _propsObj['transform'] = getTransformProperty(this.get(0));
        }
        
        // We force the property mapping here because jQuery.attr() does
        // property mapping with jQuery.props when setting a CSS property,
        // but curCSS() does *not* do property mapping when *getting* a
        // CSS property.  (It probably should since it manually does it
        // for 'float' now anyway... but that'd require more testing.)
        //
        // But, only do the forced mapping if the correct CSS property
        // is not 'transform' and is something else.
        if (_propsObj['transform'] != 'transform')
        {
            // Call in form of css('transform' ...)
            if (arg == 'transform')
            {
                arg = _propsObj['transform'];
                
                // User wants to GET the transform CSS, and in jQuery 1.4.3
                // calls to css() for transforms return a matrix rather than
                // the actual string specified by the user... avoid that
                // behavior and return the string by calling jQuery.style()
                // directly
                if (typeof val == 'undefined' && jQuery.style)
                {
                    return jQuery.style(this.get(0), arg);
                }
            }

            // Call in form of css({'transform': ...})
            else if
            (
                typeof arg == 'object'
                && typeof arg['transform'] != 'undefined'
            )
            {
                arg[_propsObj['transform']] = arg['transform'];
                delete arg['transform'];
            }
        }
        
        return proxied.apply(this, arguments);
    };
})(jQuery);

(function ($) {
    // rotate3Di v0.9 - 2009.03.11 Zachary Johnson www.zachstronaut.com
    // "3D" isometric rotation and animation using CSS3 transformations
    // currently supported in Safari/Chrome/Webkit, Firefox 3.5+, IE 9+,
    // and Opera 11+. Tested with jQuery 1.3.x through 1.6.
    
    
    var calcRotate3Di = {
        direction: function (now) {return (now < 0 ? -1 : 1);},
        degrees: function (now) {return (Math.floor(Math.abs(now))) % 360;},
        scale: function (degrees) {return (1 - (degrees % 180) / 90)
                                            * (degrees >= 180 ? -1 : 1);}
    }
    
    // Custom animator
    $.fx.step.rotate3Di = function (fx) {
        direction = calcRotate3Di.direction(fx.now);
        degrees = calcRotate3Di.degrees(fx.now);
        scale = calcRotate3Di.scale(degrees);

        if (fx.options && typeof fx.options['sideChange'] != 'undefined') {
            if (fx.options['sideChange']) {
                var prevScale = $(fx.elem).data('rotate3Di.prevScale');
                
                // negative scale means back side
                // positive scale means front side
                // if one is pos and one is neg then we have changed sides
                // (but one could actually be zero).
                if (scale * prevScale <= 0) {
                    // if one was zero, deduce from the other which way we are
                    // flipping: to the front (pos) or to the back (neg)?
                    fx.options['sideChange'].call(
                        fx.elem,
                        (scale > 0 || prevScale < 0)
                    );
                    // this was commented out to prevent calling it more than
                    // once, but then that broke legitimate need to call it
                    // more than once for rotations of 270+ degrees!
                    //fx.options['sideChange'] = null;
                    
                    // this is my answer to commenting the above thing out...
                    // if we just flipped sides, flip-flop the old previous
                    // scale so that we can fire the sideChange event correctly
                    // if we flip sides again.
                    $(fx.elem).data(
                        'rotate3Di.prevScale',
                        $(fx.elem).data('rotate3Di.prevScale') * -1
                    );
                }
            }

            // Making scale positive before setting it prevents flip-side
            // content from showing up mirrored/reversed.
            scale = Math.abs(scale);
        }

        // Since knowing the current degrees is important for detecting side
        // change, and since Firefox 3.0.x seems to not be able to reliably get
        // a value for css('transform') the first time after the page is loaded
        // with my flipbox demo... I am storing degrees someplace where I know
        // I can get them.
        $(fx.elem).data('rotate3Di.degrees', direction * degrees);
        $(fx.elem).css(
            'transform',
            'skew(0deg, ' + direction * degrees + 'deg)'
                + ' scale(' + scale + ', 1)'
        );
    }
    
    // fx.cur() must be monkey patched because otherwise it would always
    // return 0 for current rotate3Di value
    var proxied = $.fx.prototype.cur;
    $.fx.prototype.cur = function () {
        if(this.prop == 'rotate3Di') {
            var style = $(this.elem).css('transform');
            if (style) {
                var m = style.match(/, (-?[0-9]+)deg\)/);
                if (m && m[1]) {
                    return parseInt(m[1]);
                } else {
                    return 0;
                }
            }
        }
        
        return proxied.apply(this, arguments);
    }
    
    $.fn.rotate3Di = function (degrees, duration, options) {
        if (typeof duration == 'undefined') {
            duration = 0;
        }
        
        if (typeof options == 'object') {
            $.extend(options, {duration: duration});
        } else {
            options = {duration: duration};
        }
        
        if (degrees == 'toggle') {
            // Yes, jQuery has the toggle() event but that's only good for
            // clicks, and likewise hover() is only good for mouse in/out.
            // What if you want to toggle based on a timer or something else?
            if ($(this).data('rotate3Di.flipped')) {
                degrees = 'unflip';
                
            } else {
                degrees = 'flip';
            }
        }
        
        if (degrees == 'flip') {
            $(this).data('rotate3Di.flipped', true);

            var direction = -1;
            if (
                typeof options == 'object'
                && options['direction']
                && options['direction'] == 'clockwise'
            ) {
                direction = 1;
            }
            
            degrees = direction * 180;
            
        } else if (degrees == 'unflip') {
            $(this).data('rotate3Di.flipped', false);
            
            degrees = 0;
        }
        
        var d = $(this).data('rotate3Di.degrees') || 0;
        $(this).data(
            'rotate3Di.prevScale',
            calcRotate3Di.scale(calcRotate3Di.degrees(d))
        );
        $(this).animate({rotate3Di: degrees}, options);
    }
})(jQuery);