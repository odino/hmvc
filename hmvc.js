hmvc = (function(){
    /**
     * An object keeping track of all the components
     * registered within the HMVC object.
     *
     * @type {Object}
     */
    var components  = {};

    /**
     * A list of services available to your
     * components.
     *
     * When declaring a component, you can
     * inject additional services by specifying
     * them in the callback declaration and in
     * the "dependencies" array, for example.
     *
     * hmvc.component('example', function(element, MyService){
     *     ...
     *     ...
     *     ...
     * }, ["MyService"]);
     *
     * Note that you will need to specify the name
     * of the dependency twice (kinda ugly-ish, but for now
     * it's more than enough).
     *
     * @type {Object}
     */
    var services    = {};

    /**
     * Wrapper for the built-in templating engine of
     * lo-dash.
     *
     * By default, we will use curly  brackets rather
     * than the opinionated <%= ;-)
     *
     * This hack is intended to prevent using _.template(...)
     * which screams ugliness, and to use a much more
     * meaningful variant, templating.render(...).
     */
    var templating = (function(){
        engine = _;
        engine.templateSettings = {
            'interpolate': /{{([\s\S]+?)}}/g
        };

        return {
            render: function(content, variables){
                return engine.template(content, variables);
            }
        }
    })();

    var getDependenciesForComponent = function(component, element) {
        var dependencies = [createElement(element)];

        components[component].dependencies.forEach(function(name){
            dependency = services[name];

            if (dependency) {
                dependencies.push(dependency)
            } else {
                throw new Error("HMVC could not find the dependency '{d}' of component '{c}' Are you sure you defined it? Got typo?".replace('{c}', component).replace('{d}', name));
            }
        });

        return dependencies;
    }

    /**
     * Runs the {component} on the specified element,
     * by running the component's function and using
     * the returned object to manipulate the DOM and/or
     * simply executing the run() function.
     *
     * If the component returns a template in form of a
     * string, the templating system will render that
     * string and replace the original element with
     * it.
     *
     * @param {String} component
     * @param {FancyElement} element
     */
    var runComponent = function(component, element) {
        try {
            result = components[component].callback.apply(this, getDependenciesForComponent(component, element));
        }  catch  (err) {
            console.error(err.message)
            console.info("Aborting the execution of the component {c}, have fun!".replace('{c}', component))

            return;
        }

        var viewData = result.run() || {};

        Q.when(viewData).then(function(data) {
            if (result.template && typeof result.template === 'string') {
                element.outerHTML = templating.render(result.template, data);
            }
        });
    }

    /**
     * Usual DOM manipulation stuff that comes with JavaScript.
     *
     * In order not to bundle either Sizzle / jQuery / Zepto with
     * this library, we implemented some basic utilities that
     * resemble angular.element().
     *
     * @credits http://youmightnotneedjquery.com/
     * @param element
     * @returns {Object} {{original: original, text: text, html: html, attr: attr, hasClass: hasClass, addClass: addClass, removeClass: removeClass, parent: parent}}
     */
    var createElement = function(element) {
        return {
            original: function() {
                return element;
            },
            text: function() {
                return element.innerHTML;
            },
            html: function(content) {
                element.innerHTML = content;
            },
            attr: function(name, value) {
                if (typeof value !== 'undefined') {
                    element.setAttribute(name, value);
                }

                return element.getAttribute(name);
            },
            hasClass: function(name) {
                if (element.classList) {
                    return element.classList.contains(name);
                }
                else {
                    return new RegExp('(^| )' + name + '( |$)', 'gi').test(element.className);
                }
            },
            addClass: function(name) {
                if (element.classList)
                    element.classList.add(name);
                else {
                    element.className += ' ' + name;
                }
            },
            removeClass: function(name) {
                if (element.classList) {
                    element.classList.remove(name);
                }
                else {
                    element.className = el.className.replace(new RegExp('(^|\\b)' + name.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                }
            },
            parent: function() {
                return createElement(element.parentNode);
            }
        };
    };

    /**
     * parseUri 1.2.2
     * (c) Steven Levithan <stevenlevithan.com>
     * MIT License
     *
     * @see http://blog.stevenlevithan.com/archives/parseuri
     * @param str
     * @returns {{}}
     */
    function parseUri (str) {
        var	o   = parseUri.options,
            m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
            uri = {},
            i   = 14;

        while (i--) uri[o.key[i]] = m[i] || "";

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) uri[o.q.name][$1] = $2;
        });

        return uri;
    };
    parseUri.options = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
            name:   "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };

    services.uri = parseUri(window.location);

    /**
     * Here starts the fun!
     */
    return {
        /**
         * Runs HMVC: call this function everytime you want
         * HMVC to parse your dom and run your components.
         */
        run: function() {
            for (component in components) {
                var selectors   = [component, "[" + component + "]", "[data-" + component + "]"];
                var elements    = document.querySelectorAll(selectors);

                var i, length = elements.length;
                for (i = 0; i < length; i++) {
                    runComponent(component, elements[i])
                }
            }
        },

        /**
         * Declares a new component.
         *
         * Each component needs to specify it's own
         * unique name and a callback function which
         * has to return an object made of the following
         * properties:
         *
         *  - run, a function that HMVC will run
         *    everytime it parses the component,
         *    and should ideally return an object
         *    that will be passed to the view
         *
         *  - template, a string representing
         *    the template (view), that will
         *    replace the original dom of
         *    your component (ie. <demo>...</demo>)
         *
         * @see runComponent
         * @param {String} name
         * @param {Function} callback
         * @param {Array} dependencies
         */
        component: function(name, callback, dependencies) {
            components[name] = {
                callback:       callback,
                dependencies:   dependencies || []
            };
        },

        /**
         * Takes an HTML element and transforms it into a
         * jQuery-style object, but much more lightweight.
         *
         * This is more of a utility / convenient method.
         *
         * @see createElement
         * @param element
         * @returns {Object}
         */
        createElement: function(element) {
            return createElement(element);
        },

        /**
         * Declares a new service within this hmvc instance.
         *
         * Services can then be injected to your
         * components, by name.
         *
         * Example:
         *
         * hmvc.component('abc', function(element, myServiceName){
         *     console.log(myServiceName) // object
         * })
         *
         * @param {String} name
         * @param {Object} object
         */
        service: function(name, object) {
            services[name] = object;
        }
    };
})();