const exphbs = require('express-handlebars'),
    path = require('path'),
    fs = require('fs');

module.exports = function (app) {
    const helpers = {
        'asset': function (type, uri) {
            switch (type) {
            case "script":
                return '<script type="text/javascript" src="' + app.locals.basePath + '/js/' + uri + '"></script>';
            case "stylesheet":
                return '<link rel="stylesheet" href="' + app.locals.basePath + '/css/' + uri + '"></script>';
            case "controller":
                return '<script type="text/javascript" src="' + app.locals.basePath + '/controllers/' + uri + '"></script>';
            case "image":
                return '<img src="' + app.locals.basePath + '/images/' + uri + '" />';
            }
        },
        'toJson': function (val) {
            if (val) {
                return JSON.stringify(val);
            }

            return "''";
        },
        'require': function (controller, block) {
            let accum = '';

            try {
                let requiredControllers = JSON.parse(require('fs').readFileSync(path.join(__dirname, "/../views/" + controller + ".require.json")));

                requiredControllers.forEach((controller) => {
                    accum += helpers.asset('script', '../controllers/' + controller + '.js');
                });
            } catch (e) {
                console.error(e);
            }

            return accum;
        },
        'addRequires': function(a) {
            let accum = "";
            let rootPath = this.settings.views;
            let fileName = a.data._parent.exphbs.view + ".require.json";
            try {
                
                let filePath = path.join(rootPath,fileName);
                if(fs.existsSync(filePath)) {
                    let content = JSON.parse(fs.readFileSync(filePath, "utf8"));
                    content.forEach(file => {
                        accum += helpers.asset('script','tools/' + file + ".js");
                    });
                }
            } catch (e) {
                console.error(e);
            }
            return accum;
        }
    };

    return exphbs({
        extname: '.hbs',
        defaultLayout: 'main',
        partialsDir: __dirname + "/../views/_components",
        layoutsDir: __dirname + "/../views/_layouts",
        helpers: helpers
    });
};