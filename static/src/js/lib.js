var $ = require('jquery');
var md5 = require('blueimp-md5');

var API = '/api';
var TOKEN_KEY = 'token';

var get = exports.get = function(url, data, callback) {
    if (arguments.length == 2) {
        return request(url, null, 'GET', data);
    }

    return request(url, data, 'GET', callback);
};

exports.hash = function(data) {
    return md5(data);
};

var post = exports.post = function(url, data, callback) {
    if (arguments.length == 2) {
        return request(url, null, 'POST', data);
    }

    return request(url, data, 'POST', callback);
};

var request = function(url, data, method, callback) {
    $.ajax({
        contentType: 'application/json; charset=UTF-8',
        data: data ? JSON.stringify(data) : '',
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + token()
        },
        method: method,
        success: callback,
        url: API + url + '/json'
    });
};

exports.setToken = function(token) {
    localStorage[TOKEN_KEY] = token;
};

var token = exports.token = function() {
    if (TOKEN_KEY in localStorage) {
        return localStorage[TOKEN_KEY];
    }

    return '';
};
