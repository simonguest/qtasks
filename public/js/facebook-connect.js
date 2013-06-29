var facebookConnect = {

        init:  function(callback) {
            FB.init({
                appId: '530788920290681', // App ID from the App Dashboard
                channelUrl: 'http://localhost:3000/channel.html', // Channel File for x-domain communication
                status: true, // check the login status upon init?
                cookie: true, // set sessions cookies to allow your server to access the session?
                xfbml: true  // parse XFBML tags on this page?
            });

            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    console.log('You are connected to the FB connect service');
                    $('#testapi-button').removeAttr("disabled");

                } else if (response.status === 'not_authorized') {
                    console.log('You are not authorized');
                    $('#testapi-button').attr("disabled", "disabled");
                } else {
                    console.log('You are not logged in');
                    $('#testapi-button').attr("disabled", "disabled");
                }
                callback(response.status);
            });
        },

        getLoginStatus: function(callback) {
            console.time("getLoginStatus");

            console.timeEnd("getLoginStatus");

        },

        login: function() {
            FB.login(function (response) {
                if (response.authResponse) {
                    console.log("You are connected!");
                    this.getLoginStatus();
                } else {
                    console.log("User canceled");
                }
            });
        },

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