var express = require('express')
    , http = require('http')
    , path = require('path')
    , mongoose = require('mongoose')
    , request = require('request');

var db = mongoose.createConnection('localhost', 'qtasks');

var taskSchema = mongoose.Schema({description: 'String', body: 'String', project: 'String', context: 'String', thisweek: 'Bool', fbid: 'String'});
var taskModel = db.model('Task', taskSchema);

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use('/public', express.static(path.join(__dirname, '/public')));
    app.use('/templates', express.static(path.join(__dirname, '/templates')));

});

app.configure('development', function () {
    app.use(express.errorHandler());
});

//app.get('/', routes.index);
app.get('/', function (req, res) {
    res.sendfile('index.html');
});

var getFacebookId = function (oAuthToken, callback) {
    console.log("token: "+oAuthToken);
    request("https://graph.facebook.com/me?fields=id&access_token=" + oAuthToken, function (error, response, body) {
        console.log(body);
        callback(JSON.parse(body).id);
    });
}

/* list tasks */
app.get('/api/tasks', function (req, res) {
    getFacebookId(req.headers['authorization'].substring(7), function (fbid) {
        return taskModel.find({"fbid": fbid}, function (err, tasks) {
            if (!err) {
                return res.send(tasks);
            }
            else {
                return console.log(err);
            }
        });
    });
});

/* list task by id*/
app.get('/api/tasks/:id', function (req, res) {
    return taskModel.findById(req.params.id, function (err, task) {
        if (!err) {
            return res.send(task);
        }
        else {
            return console.log(err);
        }
    });
});

/* list registrations by task id */
//app.get('/api/tournaments/:id/registrations', function (req, res) {
//    return registrationModel.find({ "tournament_id" : req.params.id }, function (err, registrations) {
//        if (!err) {
//            return res.send(registrations);
//        }
//        else {
//            return console.log(err);
//        }
//    });
//});

/* create */
app.post('/api/tasks', function (req, res) {
    getFacebookId(req.headers['authorization'].substring(7), function (fbid) {
        console.log("POST: ");
        console.log(req.body);
        var task = new taskModel({
            description: req.body.description,
            body: req.body.body,
            project: req.body.project,
            context: req.body.context,
            thisweek: req.body.thisweek,
            fbid: fbid
        });
        task.save(function (err) {
            if (!err) {
                return console.log("created");
            } else {
                return console.log(err);
            }
        });
        return res.send(task);
    });
});

/* update */
app.put('/api/tasks/:id', function (req, res) {
    getFacebookId(req.headers['authorization'].substring(7), function (fbid) {
        return taskModel.findOne({_id: req.params.id, fbid: fbid}, function (err, task) {
            task.description = req.body.description;
            task.body = req.body.body;
            task.project = req.body.project;
            task.context = req.body.context;
            task.thisweek = req.body.thisweek;
            task.fbid = fbid;

            return task.save(function (err) {
                if (!err) {
                    console.log("updated");
                } else {
                    console.log(err);
                }
                return res.send(task);
            });
        });
    });
});

/* delete */
app.delete('/api/tasks/:id', function (req, res) {
    getFacebookId(req.headers['authorization'].substring(7), function (fbid) {
        return taskModel.findOne({_id: req.params.id, fbid: fbid}, function (err, task) {
            return task.remove(function (err) {
                if (!err) {
                    console.log("removed");
                    return res.send('');
                } else {
                    console.log(err);
                }
            });
        });
    });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
