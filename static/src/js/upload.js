var React = require('react');
var radio = require('radio');
$ = jQuery = require('jquery');
var _ = require('underscore');
var bootstrap = require('bootstrap');

var lib = require('./lib');
var LoginButton = require('./login').LoginButton;

var AddFileButton = React.createClass({
    click: function(e) {
        e.preventDefault();
        this.refs.file.value = null;
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
                <a className="btn btn-primary" href="#" onClick={this.click}>
                    <span className="glyphicon glyphicon-plus"></span>
                    Add Files
                </a>
                <input className="btn-add-file-input hidden" type="file" multiple ref="file" onChange={this.change} />
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
            <div className="container-upload content-area content-area-border">
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
                <h1>Let's Submit</h1>
                <div className="row">
                    <div className="col-md-8 col-md-offset-2">
                        <input className="input-title" type="text" ref="title" onChange={this.titleChange} placeholder="Describe what you're uploading." />
                    </div>
                </div>
                <div className="row container-buttons">
                    <div className="col-md-2 col-md-offset-3">
                        <AddFileButton />
                    </div>
                    <div className="col-md-2">
                        <PasteFileButton />
                    </div>
                    <div className="col-md-2">
                        <UploadButton files={this.props.files} />
                    </div>
                </div>
                <div className="row">
                    <PasteFileContainer />
                </div>
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

        var header = '';
        if (items.length > 0) {
            header = <h2>Files to Upload</h2>;
        }

        return (
            <div className="row">
                <div className="container-files col-md-8 col-md-offset-2">
                    {header}
                    {items}
                </div>
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
            <div className="row">
                <div className="row-file">
                    <a href="#" className="remove" onClick={this.remove}>
                        <span className="glyphicon glyphicon-remove"></span>
                    </a>
                    <div className="title">
                        {this.props.title}
                    </div>
                </div>
            </div>
        )
    }
});

var PasteFileButton = React.createClass({
    componentDidMount: function() {
        $('#modal-paste').modal({show: false});
    },

    render: function() {
        return (
            <div className="btn-paste-file">
                <a className="btn btn-primary" href="#" data-toggle="modal" data-target="#modal-paste">
                    <span className="glyphicon glyphicon-pencil"></span>
                    Paste File
                </a>
            </div>
        );
    }
});

var PasteFileContainer = React.createClass({
    click: function(e) {
        e.preventDefault();
        radio('FileAdded').broadcast($(this.refs.title).val(), $(this.refs.content).val());
        $(this.refs.title).val('');
        $(this.refs.content).val('');
    },

    render: function() {
        return (
            <div className="modal fade" id="modal-paste" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content container-paste-file">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">
                                <span className="glyphicon glyphicon-remove"></span>
                            </button>
                            <h4 className="modal-title">Paste File</h4>
                        </div>
                        <div className="modal-body">
                            <input ref="title" type="text" placeholder="Filename (e.g., hello.c)" />
                            <textarea ref="content" placeholder="Paste file contents here"></textarea>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.click}>Done</button>
                        </div>
                    </div>
                </div>
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
            self.slug = response.submission.slug;
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
        var self = this;
        var files = _.map(this.props.files, function(file) {
            return {
                title: file.title,
                content: file.content
            }
        });

        lib.post('/submissions/' + submissionId + '/files', {
            files: files
        }, function(response) {
            window.location.assign('/review/' + self.slug);
        });
    },

    render: function() {
        return (
            <div className="btn-upload">
                <button className="btn btn-success" onClick={this.click} disabled={this.props.files.length == 0}>
                    <span className="glyphicon glyphicon-upload"></span>
                    Upload
                </button>
            </div>
        );
    }
});
