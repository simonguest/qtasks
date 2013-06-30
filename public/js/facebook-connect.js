var facebookConnect = {

        init:  function(callback) {
            FB.init({
                appId: '530788920290681', // App ID from the App Dashboard
                channelUrl: 'http://localhost:3000/channel.html', // Channel File for x-domain communication
                status: true, // check the login status upon init?
                cookie: true, // set sessions cookies to allow your server to access the session?
                xfbml: true,  // parse XFBML tags on this page?
                oauth:true
            });

            FB.getLoginStatus(function (response) {
                callback(response.status);
            });
        },

        getLoginStatus: function(callback) {
            console.time("getLoginStatus");

            console.timeEnd("getLoginStatus");

        },

        getUsername: function(callback)
        {
            FB.api('/me', function (response) {
                callback(response.name);
            });
        },

        getOAuth: function(callback)
        {
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    callback(response.authResponse.accessToken);
                }
                else
                {
                    callback("not connected");
                }
            });
        },

//
//        getOAuth: function(callback) {
//            FB.login(function (response) {
//                if (response.session) {
//                    console.log("Getting oauth token");
//                    callback(response.session.access_token);
//                } else {
//                    console.log("User canceled");
//                }
//            });
//        },

        testAPI: function() {
            console.log('Welcome!  Fetching your information.... ');
            FB.api('/me', function (response) {
                console.log('Good to see you, ' + response.name + '.');
                console.log('ID: ' + response.id);
                console.log('Username: ' + response.username);

            });
        },

        id: function() {
            FB.api('/me', function(response){
                return response.id;
            });
        }
};