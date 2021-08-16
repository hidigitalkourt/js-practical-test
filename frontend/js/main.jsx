var STATUS = ['Open', 'Closed'];
var ASSIGNEES = ['Anuli', 'David', 'Jim', 'Karin', 'Kevin'];

var ucfirst = function(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
};

var Api = {
  get: function(assignee, status) {
    var params = {};
    if (assignee) {
      params.assignee = assignee;
    }
    if (status) {
      params.status = status;
    }
    return Api._request('GET', '/api/bugs', params);
  },
  create: function(title, description) {
    return Api._request('POST', '/api/bug', {
      title: title,
      description: description
    });
  },
  update: function(id, title, description, assignee, status) {
    return Api._request('POST', '/api/bug/' + id, {
      title: title,
      description: description,
      assignee: assignee,
      status: status
    });
  },
  delete: function(id) {
    return Api._request('DELETE', '/api/bug/' + id);
  },
  _request: function(method, url, params) {
    return $.ajax({
      url: url,
      type: method,
      dataType: 'json',
      data: params
    }).catch(function(jqXHR, textStatus, errorThrown) {
      window.console.log('Error with request to ' + url, textStatus, errorThrown);
      throw errorThrown;
    });
  }
};

var Application = React.createClass({
  getInitialState: function() {
    return {assignee: null, status: null};
  },
  filter: function(filter) {
    this.setState(filter);
  },
  render: function() {
    return (
      <div className="application">
        <header>
          <h1>Issue Tracker</h1>
          <Filters onFilter={this.filter} />
        </header>
        <List assignee={this.state.assignee} status={this.state.status} />
      </div>
    )
  }
});

var Filters = React.createClass({
  getInitialState: function() {
    return {assignee: null, status: null};
  },
  filterStatus: function(e) {
    e.preventDefault();
    var status = e.target.textContent;
    if (this.state.status && status.toLowerCase() == this.state.status.toLowerCase()) {
      status = null;
    }
    this.props.onFilter({status: status});
    this.setState({status: status});
  },
  filterAssignee: function(e) {
    e.preventDefault();
    var assignee = e.target.textContent;
    if (this.state.assignee && assignee.toLowerCase() == this.state.assignee.toLowerCase()) {
      assignee = null;
    }
    this.props.onFilter({assignee: assignee});
    this.setState({assignee: assignee});
  },
  render: function() {
    return (
      <div className="filters">
        <h1>status</h1>
        {
          STATUS.map(function(status) {
            var selected = this.state.status == status;
            return <a key={status} onClick={this.filterStatus}
                className={selected ? 'selected' : ''}>{selected ? status.toUpperCase() : status}</a>
          }.bind(this))
        }
        &nbsp;|&nbsp;
        <h1>assignee</h1>
        {
          ASSIGNEES.map(function(assignee) {
            var selected = this.state.assignee == assignee;
            return <a key={assignee} onClick={this.filterAssignee}
                className={selected ? 'selected' : ''}>{selected ? assignee.toUpperCase() : assignee}</a>
          }.bind(this))
        }
      </div>
    );
  }
});

var List = React.createClass({
  getInitialState: function() {
    return {
      issues: null,
      error: null,
    };
  },
  componentWillMount: function() {
    this.reload();
  },
  componentWillReceiveProps: function(props) {
    this.reload(props);
  },
  reload: function(props) {
    var props = props || this.props;
    this.setState({
      error: null,
    });
    Api.get(props.assignee, props.status ? props.status.toLowerCase() : null)
        .then(function(data) {
          this.setState({
            issues: data.bugs.reverse()
          });
        }.bind(this), function(error) {
          this.setState({
            error: error,
          });
        }.bind(this));
  },
  render: function() {
    var content = null;
    if (this.state.issues) {
      if (this.state.issues.length == 0) {
        content = <div className="empty-list">No bugs have been filed! Yay!</div>;
      } else {
        content = this.state.issues.map(function(issue) {
          return <ListItem key={issue.id} issue={issue} onUpdate={this.reload} />
        }.bind(this));
      }
    } else if (this.state.error) {
      content = <div className="error">Error loading bugs</div>;
    } else {
      content = <div className="loading">Loading...</div>;
    }
    return (
      <div>
        <AddForm onSubmit={this.reload} />
        <div className="list">
          {content}
        </div>
      </div>
    );
  }
});

var ListItem = React.createClass({
  getInitialState: function() {
    return {
      expanded: false,
      editing: false
    };
  },
  toggle: function() {
    this.setState({
      expanded: !this.state.expanded,
      editing: false
    });
  },
  edit: function(e) {
    e.stopPropagation();
    this.setState({
      editing: true
    });
  },
  delete: function(e) {
    e.stopPropagation();
    Api.delete(this.props.issue.id).done(this.submit);
  },
  submit: function() {
    this.props.onUpdate();
    this.setState({
      editing: false
    });
  },
  cancel: function() {
    this.setState({
      editing: false
    });
  },
  render: function() {
    if (this.state.editing) {
      return this.renderEditing();
    } else if (this.state.expanded) {
      return this.renderExpanded();
    } else {
      return this.renderCompact();
    }
  },
  renderCompact: function() {
    var data = this.props.issue;
    return (
      <div className="list-item" onClick={this.toggle}>
        <div className="fields">
          <div className="field assignee"><h1>assignee</h1>{data.assignee || '----'}</div>
          <div className="field status"><h1>status</h1>{ucfirst(data.status)}</div>
          <div className="field title"><h1>title</h1>{data.title}</div>
        </div>
        <div className="controls">
          <span className="fa fa-edit fa-fw" onClick={this.edit} />
          <span className="fa fa-trash fa-fw" onClick={this.delete} />
        </div>
      </div>
    );
  },
  renderExpanded: function() {
    var data = this.props.issue;
    return (
      <div className="list-item expanded" onClick={this.toggle}>
        <div className="fields">
          <div className="field assignee"><h1>assignee</h1>{data.assignee || '----'}</div>
          <div className="field status"><h1>status</h1>{ucfirst(data.status)}</div>
          <div className="field title"><h1>title</h1>{data.title}</div>
          <div className="field description"><h1>description</h1>{data.description}</div>
        </div>
        <div className="controls">
          <span className="fa fa-edit fa-fw" onClick={this.edit} />
          <span className="fa fa-trash fa-fw" onClick={this.delete} />
        </div>
      </div>
    );
  },
  renderEditing: function() {
    return (
      <EditForm issue={this.props.issue} onSubmit={this.submit} onCancel={this.cancel} />
    );
  },
});

var AddForm = React.createClass({
  getInitialState: function() {
    return {error: null}
  },
  add: function() {
    var title = this.refs.title.getDOMNode();
    var description = this.refs.description.getDOMNode();

    if (!title.value) {
      this.setState({error: 'Please set a title.'});
      return;
    } else if (!description.value) {
      this.setState({error: 'Please set a description.'});
      return;
    }

    this.setState({error: null});

    Api.create(title.value, description.value).done(function() {
      this.props.onSubmit();
      title.value = '';
      description.value = '';
    }.bind(this));
  },
  render: function() {
    return (
      <div className="list-item expanded add-form">
        <div className="fields">
          <div className="field title">
            <label htmlFor="title">Title</label>
            <input ref="title"
                type="text"
                id="title"
                name="title" />
          </div>
          <div className="field description">
            <label htmlFor="description">Description</label>
            <textarea ref="description"
                id="description"
                name="description"
                rows="5"></textarea>
          </div>
          <button onClick={this.add}><i className="fa fa-plus" />&nbsp;&nbsp;Add</button>
          <div className="error">{this.state.error}</div>
        </div>
      </div>
    );
  }
});

var EditForm = React.createClass({
  getInitialState: function() {
    return {error: null}
  },
  edit: function() {
    var title = this.refs.title.getDOMNode();
    var description = this.refs.description.getDOMNode();
    var assignee = this.refs.assignee.getDOMNode();
    var status = this.refs.status.getDOMNode();

    if (!title.value) {
      this.setState({error: 'Please set a title.'});
      return;
    } else if (!description.value) {
      this.setState({error: 'Please set a description.'});
      return;
    }

    this.setState({error: null});
    Api.update(this.props.issue.id, title.value, description.value, assignee.value, status.value)
        .done(this.props.onSubmit);
  },
  render: function() {
    var data = this.props.issue;
    var assignees = ASSIGNEES.map(function(assignee) {
      return <option key={assignee} value={assignee}>{assignee}</option>
    });
    var status = STATUS.map(function(status) {
      return <option key={status} value={status.toLowerCase()}>{status}</option>
    });
    return (
      <div className="list-item expanded edit-form">
        <div className="fields">
          <div className="field assignee">
            <label htmlFor="assignee">Assignee</label>
            <select id="assignee" name="assignee" ref="assignee" defaultValue={data.assignee}>
              <option value="">----</option>
              {assignees}
            </select>
          </div>
          <div className="field status">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" ref="status" defaultValue={data.status}>
              {status}
            </select>
          </div>
          <div className="field title">
            <label htmlFor="title">Title</label>
            <input ref="title" type="text" id="title" name="title" defaultValue={data.title} />
          </div>
          <div className="field description">
            <label htmlFor="description">Description</label>
            <textarea
                ref="description"
                id="description"
                name="description"
                rows="5"
                defaultValue={data.description}></textarea>
          </div>
          <button className="fa fa-save" onClick={this.edit}>&nbsp;&nbsp;Save</button>
          <button className="fa fa-remove" onClick={this.props.onCancel}>&nbsp;&nbsp;Cancel</button>
          <div className="error">{this.state.error}</div>
        </div>
      </div>
    );
  }
});

React.render(
  <Application />,
  document.getElementById('app')
);
