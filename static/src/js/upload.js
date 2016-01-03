var React = require('react');
var radio = require('radio');
var $ = require('jquery');
var _ = require('underscore');

var lib = require('./lib');
var LoginButton = require('./login').LoginButton;

var AddFileButton = React.createClass({
    click: function(e) {
        e.preventDefault();
        this.refs.file.click();
    },

    change: function(e) {
        // process each file selected by the input
        var files = this.refs.file.files;
        for (var i = 0; i < files.length; i++) {
            this.processFile(files[i]);
        }
    },

    processFile: function(file) {
        // read the contents of the file and broadcast to file list
        var reader = new FileReader();
        reader.onload = function(data) {
            radio('FileAdded').broadcast(file.name, reader.result);
        };

        reader.readAsText(file);
    },

    render: function() {
        return (
            <div className="btn-add-file">
                <a href="#" onClick={this.click}>Add Files</a>
                <input className="btn-add-file-input" type="file" multiple ref="file" onChange={this.change} />
            </div>
        );
    }
});

exports.Container = React.createClass({
    componentDidMount: function() {
        var self = this;
        radio('FileAdded').subscribe(function(title, content) {
            // don't add the same file twice
            var files = self.state.files;
            var hash = lib.hash(title + content);
            for (var i = 0; i < files.length; i++) {
                if (files[i].hash == hash) {
                    return;
                }
            }

            // add file to list and refresh
            files.push({
                hash: hash,
                title: title,
                content: content
            });

            self.setState({files: files});
        });

        radio('FileRemoved').subscribe(function(hash) {
            var files = self.state.files.filter(function(e) {
                return e.hash != hash;
            });

            self.setState({files: files});
        });
    },

    getInitialState: function() {
        return {
            files: []
        };
    },

    render: function() {
        return (
            <div className="container-upload">
                <LoginButton />
                <Controls files={this.state.files} />
                <FileList files={this.state.files} />
            </div>
        );
    }
});

var Controls = React.createClass({
    titleChange: function(e) {
        radio('TitleChanged').broadcast($(this.refs.title).val());
    },

    render: function() {
        return (
            <div className="controls">
                <input type="text" ref="title" onChange={this.titleChange} />
                <AddFileButton />
                <PasteFileButton />
                <PasteFileContainer />
                <UploadButton files={this.props.files} />
            </div>
        );
    }
});

var FileList = React.createClass({
    render: function() {
        var items = this.props.files.map(function(file, index) {
            return (
                <FileRow title={file.title} content={file.content} hash={file.hash} key={file.hash} />
            );
        });

        return (
            <div className="container-files">
                <ul>{items}</ul>
            </div>
        );
    }
});

var FileRow = React.createClass({
    remove: function(e) {
        e.preventDefault();
        radio('FileRemoved').broadcast(this.props.hash);
    },

    render: function() {
        return (
            <li>
                <div className="title">
                    {this.props.title}
                </div>
                <a href="#" className="remove" onClick={this.remove}>x</a>
            </li>
        )
    }
});

var PasteFileButton = React.createClass({
    click: function(e) {
        e.preventDefault();
        radio('ShowPasteFileContainer').broadcast();
    },

    render: function() {
        return (
            <div className="btn-paste-file">
                <a href="#" onClick={this.click}>Paste File</a>
            </div>
        );
    }
});

var PasteFileContainer = React.createClass({
    componentDidMount: function() {
        var self = this;
        radio('ShowPasteFileContainer').subscribe(function() {
            self.show();
        });
    },

    click: function(e) {
        e.preventDefault();
        radio('FileAdded').broadcast($(this.refs.title).val(), $(this.refs.content).val());
        this.hide();
    },

    hide: function() {
        $(this.refs.container).addClass('hidden');
        $(this.refs.title).val('');
        $(this.refs.content).val('');
    },

    show: function() {
        $(this.refs.container).removeClass('hidden');
    },

    render: function() {
        return (
            <div className="container-paste-file hidden" ref="container">
                <input ref="title" type="text" placeholder="Filename (e.g., hello.c)" />
                <textarea ref="content" placeholder="Paste file contents here"></textarea>
                <a href="#" onClick={this.click}>Done</a>
            </div>
        );
    }
});

var UploadButton = React.createClass({
    componentDidMount: function() {
        var self = this;
        radio('TitleChanged').subscribe(function(title) {
            self.setState({title: title});
        });
    },

    createSubmission: function() {
        var self = this;
        lib.post('/submissions', {
            title: this.state.title
        }, function(response) {
            self.uploadFiles(response.submission.id);
        });
    },

    click: function(e) {
        e.preventDefault();
        this.createSubmission();
    },

    getDefaultState: function() {
        return {
            title: ''
        }
    },

    uploadFiles: function(submissionId) {
        // strip unnecessary fields from files list
        var files = _.map(this.props.files, function(file) {
            return {
                title: file.title,
                content: file.content
            }
        });

        lib.post('/submissions/' + submissionId + '/files', {
            files: files
        }, function(response) {
        });
    },

    render: function() {
        return (
            <div className="btn-upload">
                <a href="#" onClick={this.click}>Upload</a>
            </div>
        );
    }
});
