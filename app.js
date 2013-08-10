var express = require('express')
    , http = require('http')
    , path = require('path')
    , mongoose = require('mongoose')
    , request = require('request')
    , url = require('url');

var db = mongoose.createConnection('localhost', 'qtasks');

var fb_appid = "530788920290681";
var fb_appsecret = "028aeeb8614e458a23043a2dfd8bef52";

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

app.get('/api/utils/tokenexchange/:token', function (req, res) {
    getLongLivedToken(req.params.token, function (llToken) {
        res.send(llToken);
    })
});

function getParameterByName(bodytext, name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(bodytext);
    return results == null ? "null" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getLongLivedToken(oAuthToken, callback) {
    console.log("obtaining long lived token for " + oAuthToken);
    request("https://graph.facebook.com/oauth/access_token?client_id=" + fb_appid + "&client_secret=" + fb_appsecret + "&grant_type=fb_exchange_token&fb_exchange_token=" + oAuthToken, function (error, response, body) {
        console.log(body);
        callback(getParameterByName("?" + body, "access_token"));
    });
}

var getFacebookId = function (oAuthToken, res, callback) {
    console.log("token: " + oAuthToken);
    request("https://graph.facebook.com/me?fields=id&access_token=" + oAuthToken, function (error, response, body) {

        var result = JSON.parse(body);

        //var fakeError = '{"error":{"message":"Error validating access token: Session has expired at unix time 1374256800. The current unix time is 1374342424.","type":"OAuthException","code":190,"error_subcode":463}}';
        //var result  = JSON.parse(fakeError);

        if (result.error) {
            console.log("Error: " + JSON.stringify(result));
            res.send({}, 401);
        }
        else {
            console.log("calling back with " + result.id);
            callback(result.id);
        }

    });

}

/* list tasks */
app.get('/api/tasks', function (req, res) {
    getFacebookId(req.headers['authorization'].substring(7), res, function (fbid) {
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
    getFacebookId(req.headers['authorization'].substring(7), res, function (fbid) {
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
    getFacebookId(req.headers['authorization'].substring(7), res, function (fbid) {
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
    getFacebookId(req.headers['authorization'].substring(7), res, function (fbid) {
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
