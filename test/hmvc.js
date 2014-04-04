casper.test.begin("Page without components", 2, function(test) {
    casper.start('http://localhost:8945/test/pages/nothing.html', function() {
        this.wait(200, function() {
            console.log(this.getPageContent())
            test.assertExists("greet", "the greet component isnt being rendered");
            test.assertNotExists("h1", "the <h1>...</h1> tag disappears from the dom");
            test.done();
        });
    });
});

casper.test.begin("Simple component", 2, function(test) {
    casper.start('http://localhost:8945/test/pages/greet.html', function() {
        this.wait(200, function() {
            console.log(this.getPageContent())
            test.assertExists("h1", "the greet component is being rendered");
            test.assertNotExists("greet", "the <greet>...</greet> tag disappears from the dom");
            test.done();
        });
    });
});

casper.test.begin("Simple component  declared by attribute", 2, function(test) {
    casper.start('http://localhost:8945/test/pages/greet-attribute.html', function() {
        this.wait(200, function() {
            console.log(this.getPageContent())
            test.assertExists("h1", "the greet component is being rendered");
            test.assertNotExists("div", "the <div greet>...</div> tag disappears from the dom");
            test.done();
        });
    });
});

casper.test.begin("Simple component  declared by data-* attribute", 2, function(test) {
    casper.start('http://localhost:8945/test/pages/greet-data-attribute.html', function() {
        this.wait(200, function() {
            console.log(this.getPageContent())
            test.assertExists("h1", "the greet component is being rendered");
            test.assertNotExists("div", "the <div data-greet>...</div> tag disappears from the dom");
            test.done();
        });
    });
});

casper.test.begin("Simple component with a dash in the name", 2, function(test) {
    casper.start('http://localhost:8945/test/pages/greet-me.html', function() {
        this.wait(200, function() {
            console.log(this.getPageContent())
            test.assertExists("h1", "the greet-me component is being rendered");
            test.assertNotExists("greet-me", "the <greet-me>...</greet-me> tag disappears from the dom");
            test.done();
        });
    });
});

casper.test.begin("Dependency injection", 3, function(test) {
    casper.start('http://localhost:8945/test/pages/dependency-injection.html', function() {
        this.wait(200, function() {
            console.log(this.getPageContent())
            test.assertExists("h1", "the greet component is being rendered");
            test.assertNotExists("greet", "the <greet>...</greet> tag disappears from the dom");
            test.assert(this.fetchText('h1') == 'localhost', "You can use the 'uri' service in your components");
            test.done();
        });
    });
});

casper.test.begin("Dependency injection of a custom service", 3, function(test) {
    casper.start('http://localhost:8945/test/pages/custom-dependency-injection.html', function() {
        console.log(this.getPageContent())
        test.assertExists("h1", "the greet component is being rendered");
        test.assertNotExists("greet", "the <greet>...</greet> tag disappears from the dom");
        test.assert(this.fetchText('h1') == 'test-service', "A custom service is used to render a string in the template");
        test.done();
    });
});

casper.run();