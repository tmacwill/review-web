var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

var Container = require('../upload').Container;

$(function() {
    ReactDOM.render(
        <Container />,
        document.getElementById('container')
    );
});
