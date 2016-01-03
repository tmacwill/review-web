var React = require('react');
var lib = require('./lib');

exports.Container = React.createClass({
    componentDidMount: function() {
        // get files from this submission
        var self = this;
        lib.get('/submissions/slug/' + window.data.slug, function(response) {
            var files = [];
            for (var i = 0; i < response.submission.files.length; i++) {
                var file = response.submission.files[i];
                var hash = lib.hash(file.title + file.content);
                files.push({
                    hash: hash,
                    title: file.title,
                    content: file.content
                });
            }

            self.setState({
                files: files
            });
        });
    },

    getInitialState: function() {
        return {
            files: []
        };
    },

    render: function() {
        return (
            <FileList files={this.state.files} />
        );
    }
});

var FileList = React.createClass({
    render: function() {
        var items = this.props.files.map(function(file, index) {
            return (
                <File file={file} key={file.hash} />
            );
        });

        return (
            <div className="container-files">
                {items}
            </div>
        );
    }
});

var File = React.createClass({
    render: function() {
        return (
            <div>
                <div>{this.props.file.title}</div>
                <div dangerouslySetInnerHTML={{__html: this.props.file.content}} />
            </div>
        );
    }
});
