import React, { Component } from 'react'
import TaskStatusList from '../MainComponents/Calendar/TaskStatus/TaskStatusList';

class PlannerTaskStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      PageMode: 'Home',
      PageTitle: 'Task Status Report'
    };
  }

  render() {
    return (
      <div className='content-wrapper'>
        <div className='content-header'>
          <div className='container-fluid'>
            <div className='row mb-2'>
              <div className="col-sm-6">
                  <h1 className="m-0 text-dark">Today's Task Status Report</h1>
              </div>
              <div className="col-sm-6">
                  {/* <ol className="breadcrumb float-sm-right">
                      <li className="breadcrumb-item"><a href="/">Home</a></li>
                      <li className="breadcrumb-item active"><a href="/Account/App/PlannerTaskStatus">Tasks</a> </li>
                  </ol> */}
              </div>
            </div>
          </div>
        </div>
        <section className="content">
            <div className="container-fluid">
                <div className="container-fluid">
                  <TaskStatusList />
                </div>
            </div>
        </section>
      </div>
    );
  }
}

export default PlannerTaskStatus;