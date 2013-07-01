var facebookConnect = {

        init:  function(callback) {


            FB.getLoginStatus(function (response) {
                callback(response);
            });
        },

        logout: function(callback) {
            FB.logout(function(response){
                callback("Logged out");
            });
        },


        getLoginStatus: function(callback) {
            FB.getLoginStatus(function (response) {
                callback(response);
            });
        },

        getUsername: function(callback)
        {
            FB.api('/me', function (response) {
                callback(response.name);
            });
        },

        getOAuth: function(callback)
        {

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