import React, { Component } from "react";
// import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { setHours, setMinutes } from "date-fns";
import Modal from "react-awesome-modal";
// import moment from "moment";
// import { th } from "date-fns/locale";
import ApiProvider from "../DataProvider";
import Button from "../../../ReactComponents/Button/Button";
import * as appCommon from "../../../Common/AppCommon.js";
// import { CreateValidator, ValidateControls } from "../Validation";
import { ToastContainer } from "react-toastify";
import swal from "sweetalert";
import { DELETE_CONFIRMATION_MSG } from '../../../Contants/Common';


export default class ViewTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskId: "",
      QuestionName: "",
      QuesId: "",
      QuesData: [],
    };
    this.ApiProvider = new ApiProvider();
  }

  getQuesModel = (type, Id) => {
    var model = [];
    switch (type) {
      case "T":
        model.push({
          CmdType: type,
          Id: Id,
        });
        break;
        case 'D':
            model.push({
                CmdType: type,
                Id: Id,
              });
              console.log(model)
            break;
      default:
    }
    return model;
  };

  manageQues = (model, type) => {
    this.ApiProvider.manageQues(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "C":
              if (rData === "Created !") {
                appCommon.showtextalert(
                  "Question Saved Successfully!",
                  "",
                  "success"
                );
                console.log("Question Saved Successfully!");
                this.handleCancel();
              }
            case "T":
              let quesData = rData.map((element) => ({
                QuesId: element.QuestID,
                QuesName: element.QuestionName,
                Action:element.Action,
                Remark:element.Remarks
              }));
              this.setState({ QuesData: quesData });
              break;
            case "D":
              if (rData === "Deleted !") {
                appCommon.showtextalert(
                  "Question Deleted Successfully!",
                  "",
                  "success"
                );
              } else {
                appCommon.showtextalert("Someting went wrong !", "", "error");
              }
              this.getQuestion();
              break;
            default:
          }
        });
      }
    });
  };

  getQuestion() {
    var type = "T";
    const taskId = this.props.rowData.TaskId;
    var model = this.getQuesModel(type, taskId);
    this.manageQues(model, type);
  }

  componentDidMount() {
    this.getQuestion();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCategory !== this.state.selectedCategory) {
      this.getSubCategory();
    }
  }

  handleCancel = () => {
    this.props.closeModal();
  };

  removeQuesFields = (QuesId) => {
      console.log(QuesId)
    //debugger
    let myhtml = document.createElement("div");
    myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>";
    alert(swal({
      buttons: {
        ok: "Yes",
        cancel: "No",
      },
      content: myhtml,
      icon: "warning",
      closeOnClickOutside: false,
      dangerMode: true,
    })
  ).then((value) => {
      switch (value) {
        case "ok":
          this.setState({ QuesId: QuesId }, () => {
            var type = "D";
            var model = this.getQuesModel(type, QuesId);
            this.manageQues(model, type);
          });
          break;
        case "cancel":
          break;
        default:
          break;
      }
    });
  };

  render() {
    return (
      <div>
        <Modal
          visible={this.props.showTaskModal}
          effect="fadeInRight"
          onClickAway={this.props.closeModal}
          width="1000"
        >
          <div className="row">
            <div className="col-12">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">View Task</h3>
                  <div className="card-tools">
                    <button
                      className="btn btn-tool"
                      onClick={this.props.closeModal}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div
                  className="card-body"
                  style={{ height: "450px", overflowY: "scroll" }}
                >
                  <div className="row">
                    <div className="col-6">
                      <label>Task Id</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.TaskId}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
                    <div className="col-6">
                      <label>Task Name</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.Name}
                        disabled
                        placeholder="Enter Task"
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <br/>
                    <div className="col-6">
                      <label>Assigned To</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.AssignedTo}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <div className="col-6">
                      <label>QR Code</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.QRcode}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <br />
                    
                    <div className="col-md-12">
                      <div className="row">
                      <div className="col-md-7" style={{ marginTop: "20px" }}>
                      <label>Task Questionnaire</label>
                      </div>
                      <div className="col-md-3" style={{ marginTop: "20px" }}>
                      <label>Remark</label>
                      </div>
                      <div className="col-md-2" style={{ marginTop: "20px" }}>
                      <label>Status</label>
                      </div>
                      </div>
                    </div>
                    {this.state.QuesData.map((element, index) => (
                      <div className="col-md-12" style={{ marginTop: "20px" }}>
                        <div style={{ display: "flex" }}>
                          <div className="col-md-7">
                            <input
                              id="txtName"
                              type="text"
                              name="QuestionName"
                              className="form-control"
                              value={element.QuesName}
                              disabled
                            />
                          </div>
                          {
                            element.Action === "No" ?(
                          <div className="col-md-3">
                          <input
                              id="txtName"
                              type="text"
                              name="Remark"
                              value={element.Remark}
                              disabled
                              className="form-control"
                            />
                          </div>
                            ) : (<div className="col-md-3"></div>)
                          }
                          
                          <div className="col-md-2">
                            <select className="form-control" disabled>
                              <option value={element.Action}>{element.Action}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="modal-footer">
                    <Button
                      Id="btnCancel"
                      Text="Close"
                      Action={this.handleCancel}
                      ClassName="btn btn-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <ToastContainer />
      </div>
    );
  }
}
