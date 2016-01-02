var React = require('react');
var lib = require('./lib');

exports.LoginButton = React.createClass({
    click: function(e) {
        e.preventDefault();
        FB.login(function(response) {
            if (response.status == 'connected') {
                lib.post('/users', {
                    facebook_token: response.authResponse.accessToken
                }, function(response) {
                    lib.setToken(response.user.token);
                });
            }
        }, {
            scope: 'public_profile,email,user_friends'
        });
    },

    render: function() {
        return (
            <a href="#" onClick={this.click}>Login</a>
        );
    }
});
