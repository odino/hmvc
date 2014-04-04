# HMVC.js

HMVC is a JavaScript library that lets you isolate and decouple
your code, which took inspiration from the hierarchical MVC
pattern and AngularJS directives.

HMVC is mostly suitable for apps that need to modify parts of the
DOM to generate user-specific content on the client-side, and will
let them scale better: with HMVC, you can keep client-related
informations on the client and customize views on the client, rather
then the server, where you will be able to cache contents more
aggressively and live a - definitely - happier life.

``` html
<html>
    <body>
        <scream>
            This test needs to scream!
        </scream>

        <script src="my-minified-scripts.js" ></script>
        <script type="text/javascript">
            hmvc.component('scream', function(element){
                return {
                    template: '<h1>{{ text }}</h1>',
                    run: function() {
                        return {
                            text: element.text()
                        };
                    }
                };
            });

            hmvc.run();
        </script>
    </body>
</html>
```

The example above will transform all the "scream" DOM
elements in `H1`s.

HMVC can be used **with or without** a frontend JS framework
(like Angular / Ember / BackBone) as its target is to be able
to provide a way to shift tasks on the frontend, by creating
decoupled and clean components: therefore, no  matter what
you are using, HMVC will be completely separate from your
"main" framework (which can even be Rails, Express or Symfony2...)

## Installation

You can simply include the component via [bower](http://bower.io).

## Creating your first component

After you included hmvc, you will then have the `hmvc`
variable available in the global JS scope, so that you
can play and start with your first component.

Components basically need to return an object with 2
simple properties, a `run` function and a `template`:

``` javascript
hmvc.component('greet', function(element){
    var username = myAwesomeCookieLibrary.getCookieCoontent('username');

    return {
        run: function() {
            return {
                username: username
            }
        },
        template: "<h3>Hello {{ username }},</h3>"
    }
});
```

Now you simply have to add to your DOM:

``` html
<greet />
```

and upon calling `hmvc.run()` your DOM will now look like:

``` html
<h3>Hello Barack,</h3>
```

## Specifying components

Components can be specified exactly like AngularJS directives,
so you can use:

* new HTML tags (`<greet />`)
* HTML attributes (`<div greet />`)
* HTML5's  `data-*` attributes (`<div data-greet />`)

The recommended way to write your own components
is by using the `data-*` style.

In any case, all of the following markups are identical
to HMVC:

``` html
<greet />

<p greet />

<header data-greet />
```

## Dependency injection

HMVC has a very simple DI implementation that works
well when you want things to be as classy as possible,
without declaring too many global JS variables.

You can declare your own services with:

``` javascript
myAwesomeService = {
    doSomething: function() {
        alert("THAT'S HELLA COOL!");
    }
}

hmvc.service('myAwesomeService', myAwesomeService);
```

and then reuse the service in a component:

``` javascript
hmvc.component('something', function(element, myAwesomeService){
    myAwesomeService.doSomething();

    // ...
}, ["myAwesomeService"]);
```

**Please note you'll have to declare the service "twice"**

Yes, I know.

## Templating

HMVC components *usually* have templates, which means that if you
return objects with a `template` property from your component:

``` javascript
hmvc.component('greet', function(element){
    var username = myAwesomeCookieLibrary.getCookieCoontent('username');

    return {
        run: function() {
            return {
                username: username
            }
        },
        template: "<h3>Hello {{ username }},</h3>"
    }
});
```

HMVC will try to render that template using the return value of
the `run` function.

You can run components without templates (so that there will be no
output but you will only run the `run` function), even though this
might not be a very popular use case for HMVC.

Templates are plain old JavaScript strings, so you can simply declare
them elsewhere (maybe even using Jade and so on) and then pass them to
the component:

``` javascript
hmvc.component('greet', function(element){
    var username = myAwesomeCookieLibrary.getCookieCoontent('username');

    return {
        run: function() {
            return {
                username: username
            }
        },
        template: templates.get('greet.html') // custom templating engine stuff!
    }
});
```

## Say "NO" to jQuery!

Upon creating HMVC, we tried to downsize it and avoid unnecessary
dependencies, inspired by [this](http://youmightnotneedjquery.com/).

*Not that jQuery is shit - because it's not - it's more to keep
things as lightweight and lean as possible*.

You might have noticed that when you declare a component, it takes
an `element` as first argument:

``` javascript
hmvc.component('greet', function(element){
    // ...
});
```

This `element` is the "HMVC representation" of the HTML element
on which the component is running (ie. `<div data-greet />`).

Even though you can use jQuery to do DOM manipulation and stuff,
you might want to look at the [native methods that HMVC offers](https://github.com/odino/hmvc/blob/master/hmvc.js#L115-L160)
on top of "its" elements, which are pretty self-explanatory:

* `original` (returns the original HTML element)
* `text`
* `html`
* `attr` (acts as both setter and getter)
* `hasClass`
* `addClass`
* `removeClass`
* `parent`

## About the HMVC pattern

HMVC is an [established pattern](http://en.wikipedia.org/wiki/Hierarchical_model%E2%80%93view%E2%80%93controller)
in most server-side frameworks: it consists into defining
small sub-MVC cycles in your application.

If you, for example, need to render a webpage with a main content
and a sidebar, your controller would look like:

``` ruby
class ArticleController
    def renderArticle(id, articleRepository)
        return templating.render('article/detail', {
            article: articleRepository.get(id)
        });
    end
end
```

and in your view you will have something like:

``` html
<div class="main">
    <h1>
        {{ article.title }}
    </h1>
    <div>
        {{ article.content }}
    </div>
</div>
{{ app.renderComponent('sidebar/render', { context: 'article/detail' }) }}
```

As you might understand, the `renderComponent` function will
then boot a new controller that will return the view to be
included as a sidebar:

``` ruby
class SidebarController
    def render(context)
        return templating.render('sidebar/' + context);
    end
end
```

I was quite surprised that the JS ecosystem didn't  have
**anything** on HMVC until the rise of angular directives
:-) and after playing with AngularJS for a few months and
seeing how you can't really mix it with a server-side
framework in an easy way, I decided to give it a shot.

Simple as that!

## Note

I love Angular and yes, you can use it coupled wiith Rails
or another SS framework, but it wasn't meant for this -- ie.
[try using the `history.pushState()` in your app](http://stackoverflow.com/questions/20659470/using-history-pushstate-in-angular-results-in-10-digest-iterations-reached).

## License

For those who care, this software is licensed under the MIT license.

