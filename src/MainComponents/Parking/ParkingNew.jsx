import React from 'react'
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import TextAria from '../../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import { ToastContainer, toast } from 'react-toastify';
import Button from '../../ReactComponents/Button/Button.jsx';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList';
import MultiSelect from '../../ReactComponents/MultiSelect/MultiSelect.jsx';
class ParkingNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  
            PropertyData : [{Name:'Royal Nest Housing', Value:1}, {Name:'EON society', Value:2},{Name:'Inox enclave', Value:3}],
            ParkingAreaData : [{Name:'Basement', Value:1}, {Name:'L1', Value:2},{Name:'L2', Value:2}],
            FloorData : [{Name:'1', Value:1}, {Name:'2', Value:2}],
        };
    }
    updateDepartment = () => {

    }
    handleSave = () => {
  

    }
    handleCancel = () => {
        // departmentBL.ValidateControls();
        this.props.Action('Home');
        //
        // appCommon.ShownotifyError('Solve all error');
    };
    render() {
        return (
            <div>
                
            <div >
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-sm-6">
                               
                                <div className="form-group">

                                    <label for="txtDepartmentName">Property Name</label>
                                    <DropDownList 
                                        Id="ddlProperty"
                                        Options={this.state.PropertyData} />
                                   
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="txtDescription">Parking Area</label>
                                     
                                    <DropDownList 
                                        Id="ddlParkingArea"
                                        Options={this.state.ParkingAreaData} />

                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                               
                                <div className="form-group">

                                    <label for="txtParkingName">Parking Name</label>
                                    <InputBox Id="txtParkingName"
                                                onChange={this.updateDepartment.bind(this)}
                                                PlaceHolder="Flat Name"
                                                className="form-control form-control-sm"
                                            />
                                   
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                
                                </div>
                            </div>
                        </div>
                         
                    </div>


                    <div className="modal-footer">
                        <Button
                            Id="btnSave"
                            Text="Save"
                            Action={this.handleSave}
                            ClassName="btn btn-primary" />
                        <Button
                            Id="btnCancel"
                            Text="Cancel"
                            Action={this.handleCancel}
                            ClassName="btn btn-secondary" />

                    </div>
                </div>
            </div>
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

export default ParkingNew;