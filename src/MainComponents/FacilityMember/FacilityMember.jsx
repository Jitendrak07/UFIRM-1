import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from '../FacilityMember/DataProvider.js';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from '../FacilityMember/Validation.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import MultiSelectInline from '../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import DocumentBL from '../../ComponentBL/DocumentBL';
import { DELETE_CONFIRMATION_MSG, BLOCK_CONFIRMATION_MSG, UNBLOCK_CONFIRMATION_MSG } from '../../Contants/Common';
import DocumentUploader from '../../ReactComponents/FileUploader/DocumentUploader.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import axios from 'axios';
import ImageUploader from 'react-images-upload';
import * as appCommonJs from "../../Common/AppCommon.js";
import './FacilityMember.css';

import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;
const documentBL = new DocumentBL();

class FacilityMember extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Pictures: null,
            PageMode: 'Home',
            FacilityMemberId: '0',
            PropertyId: 0, ProfileImageUrl: '', Name: '', Contact: '', Address: '',
            FacilityMasterId: '0', FacilityMaster: [],
            PropertyTowerId: '0', PropertyTowersData: [],
            PropertyFloorId: '0', PropertyFloors: [],
            PropertyFlatId: '0', PropertyFlat: [],
            Gender: '0', GenderList: [],
            Filter: [], FilterValue: "All",
            PropertyDetailsIds: [],
            pageSize: 10,
            pageNumber: 1,
            gridFacilityMemberHeader: [
                { sTitle: 'Id', titleValue: 'facilityMemberId', "orderable": false, },//"visible": true 
                { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileImageUrl', Index: '0' },
                { sTitle: 'Name', titleValue: 'name', },
                { sTitle: 'Gender', titleValue: 'gender', },
                { sTitle: 'Contact', titleValue: 'mobileNumber', },
                { sTitle: 'Facility Type', titleValue: 'facilityName', },
                { sTitle: 'Access', titleValue: 'ToggleSwitch', Value: 'accessCode', Index: '0', Width: '70' },
                // { sTitle: 'Status', titleValue: 'IsBlocked', Value: 'isBlocked', Value2: 'isApproved', Index: '0' },
                { sTitle: 'Status', titleValue: 'status' },
                // { sTitle: 'Approved On', titleValue: 'approvedOn' },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete&Block", Index: '0', "orderable": false },
            ],
            gridFacilityMemberData: [],
            gridDocumentHeader: [
                { sTitle: 'Id', titleValue: 'facilityMemberDocumentId', "orderable": false, },
                { sTitle: 'Document Type', titleValue: 'documentTypeName', "orderable": false, },
                { sTitle: 'Document Number', titleValue: 'documentName', "orderable": false, },
                { sTitle: 'Document Url', titleValue: 'documentUrl', "orderable": false, bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "DownloadNDelete", Index: '0', urlIndex: '3', "orderable": false }
            ],
            gridDocumentData: [],
            grdTotalRows: 0,
            grdTotalPages: 0,
            //Document file
            DocumentType: [], documentType: [], documentTypeId: "0", documentName: "",
            selectedFile: undefined, selectedFileName: undefined, imageSrc: undefined, value: '',
            Showimguploader: false, isServiceStaff: 'Staff', FacilityTypeId: 2
        };
        this.onDrop = this.onDrop.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        documentBL.CreateValidator();
        this.setState({ PropertyId: this.props.PropertyId, pageNumber: 1 }, () => {
            this.loadPropertyTowers(this.props.PropertyId);
            this.loadGender();
            this.getDocumentType();
            this.getFacilityMember("All");
            this.loadFilter();
        });
        $('#grdFacilityMember').find("[aria-label=Action]").addClass("addWidth");
    }
    componentDidUpdate(prevProps) {
        //
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.setState({ PropertyId: this.props.PropertyId, pageNumber: 1 }, () => {
                this.loadPropertyTowers(this.props.PropertyId);
                this.loadGender();
                this.getDocumentType();
                this.getFacilityMember("All");
                this.loadFilter();
            });
        }
    }

    loadGender() {
        let gender = [{ "Value": "Male", "Name": "Male" }, { "Value": "Female", "Name": "Female" }, { "Value": "Other", "Name": "Other" }];
        this.setState({ GenderList: gender });
    }

    loadFilter() {
        let value = [
            { "Value": "All", "Name": "All" },
            { "Value": "Active", "Name": "Active" },
            { "Value": "Pending", "Name": "Pending" },
            { "Value": "Blocked", "Name": "Blocked" },
            { "Value": "Old", "Name": "Old" }];
        this.setState({ Filter: value });
    }

    getFacilityMember(value) {
        var type = 'R';
        var model = this.getModel(type, value);
        console.log(model[0]);
        this.manageFacilityMember(model, type);
    }

    getFacilityType() {
        this.comdbprovider.getFacilityType().then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        console.log("facility type ", rData);
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ FacilityType: rData });

                        let data = [{ "Id": "All", "Name": "All" }];
                        rData.map((item) => {
                            data.push(item);
                        });
                        this.setState({ FilterFacilityType: data });
                    });
                }
            });
    }

    getFacilityMaster(id) {
        this.comdbprovider.getFacilityMaster(id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ FacilityMaster: rData });
                    });
                }
            });
    }

    getDocumentType() {
        this.comdbprovider.getDocumentType(0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "documentTypeId", "Id");
                        rData = appCommon.changejsoncolumnname(rData, "documentTypeName", "Name");
                        let documentTypeData = [{ "Id": "0", "Name": "Select Document Type" }];
                        rData.forEach(element => {
                            documentTypeData.push({ Id: element.Id.toString(), Name: element.Name });
                        });
                        this.setState({ DocumentType: documentTypeData });
                    });
                }
            });
    }

    loadPropertyTowers(id) {
        this.comdbprovider.getPropertyTowers(id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ PropertyTowersData: rData });
                    });
                }
            });
    }

    loadPropertyFlat(id) {
        this.comdbprovider.getPropertyFlat(id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ PropertyFlat: rData });
                    });
                }
            });
    }

    manageFacilityMember = (model, type) => {
        this.ApiProviderr.manageFacilityMember(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'U':
                                appCommon.showtextalert("Facility Member Saved Successfully!", "", "success");
                                this.handleCancel();
                                break;
                            case 'D':
                                appCommon.showtextalert("Facility Member Deleted Successfully!", "", "success");
                                this.handleCancel();
                                break;
                            case 'B':
                                if (model[0].isBlocked) { appCommon.showtextalert("Facility Member Update Unblock Successfully!", "", "success") }
                                else {
                                    appCommon.showtextalert("Facility Member Update Block Successfully!", "", "success")
                                }
                                this.handleCancel();
                                break;
                            case 'R':
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridFacilityMemberData: rData.facilityMember });
                                break;
                            default:
                        }
                    });
                }
            });
    }

    addNew() {
        this.setState({ PageMode: 'Add', Showimguploader: false }, () => {
            CreateValidator();
            documentBL.CreateValidator();
        });

        this.getModel('C');

        //load gender
        this.loadGender();
        this.setState({ PropertyId: this.state.PropertyId });

        //load tower
        this.loadPropertyTowers(this.state.PropertyId);


        //load documents panel
        this.getDocumentType();
        $('#grdFacilityMember').find("[aria-label=Action]").addClass("addWidth");
        let arrayCopy = [...this.state.DocumentType];
        this.setState({ documentType: arrayCopy });
        this.setState({ documentTypeId: "0" });
        this.getFacilityMaster(parseInt(this.state.FacilityTypeId));
    }

    onPagechange = (page) => {
        this.setState({ pageNumber: page }, () => {
            this.getFacilityMember(this.state.FilterValue);
        });

    }

    onDrop(pictureFiles, pictureDataURLs) {
        this.setState({ Pictures: pictureFiles });
    }

    onGridDelete = (Id) => {
        let myhtml = document.createElement("div");
        myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>"
        alert: (
            swal({
                buttons: {
                    ok: "Yes",
                    cancel: "No",
                },
                content: myhtml,
                icon: "warning",
                closeOnClickOutside: false,
                dangerMode: true
            }).then((value) => {
                switch (value) {
                    case "ok":
                        var model = [{ "facilityMemberId": parseInt(Id) }];
                        this.manageFacilityMember(model, 'D');
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );
    }

    onGridBlock = (Id) => {
        let val = this.findItem(parseInt(Id)).isBlocked;
        let myhtml = document.createElement("div");
        myhtml.innerHTML = BLOCK_CONFIRMATION_MSG + "</hr>";
        if (val)
            myhtml.innerHTML = UNBLOCK_CONFIRMATION_MSG + "</hr>";

        alert: (
            swal({
                buttons: {
                    ok: "Yes",
                    cancel: "No",
                },
                content: myhtml,
                icon: "warning",
                closeOnClickOutside: false,
                dangerMode: true
            }).then((value) => {
                switch (value) {
                    case "ok":
                        var model = [{ "facilityMemberId": parseInt(Id), "isBlocked": val }];
                        this.manageFacilityMember(model, 'B');
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );
    }

    async ongridedit(Id) {
        //
        this.setState({ PageMode: 'Edit', Showimguploader: false }, () => {
            CreateValidator();
            documentBL.CreateValidator();
        });
        this.loadGender();
        var rowData = this.findItem(Id);
        this.setState({ FacilityMemberId: rowData.facilityMemberId })
        this.setState({ ProfileImageUrl: rowData.profileImageUrl });
        this.setState({ Name: rowData.name });
        this.setState({ Contact: rowData.mobileNumber });
        this.setState({ Address: rowData.address });
        $('#ddlGender').val(rowData.gender);
        this.setState({ Gender: rowData.gender });

        this.comdbprovider.getFacilityMaster(this.state.FacilityTypeId).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        console.log("facility master ", rData);
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ FacilityMaster: rData, FacilityMasterId: rowData.facilityMasterId }, () => {
                            $('#ddlFacilityMaster').val(rowData.facilityMasterId);
                        });
                    });
                }
            });

        if (rowData.facilityTypeId == 1) {
            //load tower
            this.loadPropertyTowers(this.state.PropertyId);
            let dataValue = [];
            rowData.facilityMemberPropertyAssignmentList.map((item) => {
                dataValue.push({ Id: item.value, Name: item.name, value: item.name, label: item.name, color: '#0052CC' });
            });
            this.onDropdownChanges("PropertyDetails", dataValue);
        }

        //Document Grid
        this.getDocumentType();

        let arrayCopy = [...this.state.DocumentType];
        rowData.facilityMemberDocumentList.map((item) => {
            this.removeByAttr(arrayCopy, 'Id', item.documentTypeId.toString());
        });
        this.setState({ documentType: arrayCopy });
        this.setState({ documentTypeId: "0" });

        this.setState({ gridDocumentData: rowData.facilityMemberDocumentList });
    }

    findItem(id) {
        return this.state.gridFacilityMemberData.find((item) => {
            if (item.facilityMemberId == id) {
                return item;
            }
        });
    }

    getModel = (type, value) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "SearchValue": "NULL",
                    "PropertyId": parseInt(this.state.PropertyId),
                    "PageSize": this.state.pageSize,
                    "PageNumber": this.state.pageNumber,
                    "Filter": this.state.FilterValue,
                    "FacilityType": this.state.isServiceStaff
                });
                break;
            case 'U':
                model.push({
                    "Name": this.state.Name,
                    "Contact": this.state.Contact,
                    "Address": this.state.Address,
                    "FacilityTypeId": this.state.FacilityTypeId,
                    "FacilityMasterId": this.state.FacilityMasterId,
                    "PropertyTowerId": this.state.PropertyTowerId,
                    "PropertyFloorId": this.state.PropertyFloorId,
                    "PropertyFlatId": this.state.PropertyFlatId,
                    "Gender": this.state.Gender,
                });
                break;
            case 'C':
                this.setState({ Pictures: null, ProfileImageUrl: '' });
                this.setState({ Name: '', Contact: '', Address: '' });
                this.setState({ FacilityMemberId: '0' });
                this.setState({ FacilityMasterId: '0', FacilityMaster: [] });
                this.setState({ PropertyTowerId: '0', PropertyTowersData: [] });
                this.setState({ PropertyFloorId: '0', PropertyFloors: [] });
                this.setState({ PropertyFlatId: '0', PropertyFlat: [] });
                this.setState({ Gender: '0' });
                this.setState({ gridFacilityMemberData: [], gridDocumentData: [] });
                this.setState({ documentType: [], documentTypeId: "0", documentName: "" });
                this.removeImage();
                break;
            default:
        };
        return model;
    }

    handleSave = (saveType) => {
        let url = new UrlProvider().MainUrl;
        if (ValidateControls()) {
            const formData = new FormData();
            formData.append("propertyId", this.props.PropertyId);
            formData.append('imageFile', this.state.Pictures != null ? this.state.Pictures[0] : null);
            formData.append("name", this.state.Name);
            formData.append("mobileNumber", this.state.Contact);
            formData.append("address", this.state.Address);
            formData.append("gender", this.state.Gender);
            formData.append("facilityMemberId", this.state.FacilityMemberId);
            formData.append("facilityMasterId", this.state.FacilityMasterId);
            formData.append("propertyTowerId", this.state.PropertyTowerId);
            formData.append("propertyFloorId", this.state.PropertyFloorId);
            formData.append("propertyFlatId", this.state.PropertyFlatId);
            if (this.state.FacilityTypeId == 1) {
                formData.append("propertyDetailsIds", JSON.stringify(this.state.PropertyDetailsIds));
            } else {
                formData.append("propertyDetailsIds", JSON.stringify([]));
            }
            formData.append("saveType", saveType);
            this.state.gridDocumentData.map((item) => {
                formData.append('files', item.selectedFile);
            });
            formData.append('document', JSON.stringify(this.state.gridDocumentData));
            if (this.state.FacilityTypeId == 1 && this.state.PropertyDetailsIds.length > 0) {
                if (this.state.gridDocumentData.length > 0) {
                    this.ApiProviderr.saveFacilityMember(formData)
                        .then(res => {
                            if (res.data <= 0) {
                                appCommon.ShownotifyError("Facility Member Contact is already created");
                            }
                            else {
                                if (this.props.PageMode != "Edit") {
                                    appCommon.showtextalert("Facility Member Created Successfully", "", "success");
                                }
                                else {
                                    appCommon.showtextalert("Facility Member Updated Successfully", "", "success");
                                }
                                this.handleCancel();
                            }
                        });
                }
                else
                    appCommon.showtextalert("At least one document is required", "", "error");
            }
            else if (this.state.FacilityTypeId == 2) {
                if (this.state.gridDocumentData.length > 0) {
                    this.ApiProviderr.saveFacilityMember(formData)
                        .then(res => {
                            if (res.data <= 0) {
                                appCommon.ShownotifyError("Facility Member Contact is already created");
                            }
                            else {
                                if (this.props.PageMode != "Edit") {
                                    appCommon.showtextalert("Facility Member Created Successfully", "", "success");
                                }
                                else {
                                    appCommon.showtextalert("Facility Member Updated Successfully", "", "success");
                                }
                                this.handleCancel();
                            }
                        });
                }
                else
                    appCommon.showtextalert("At least one document is required", "", "error");
            }
            else {
                appCommon.showtextalert("At least one flat is required", "", "error");
            }
        }
    }

    handleCancel = () => {
        this.setState({ PageMode: 'Home' }, () => {
            this.getFacilityMember(this.state.FilterValue);
        });
    };

    onSelected(name, value) {
        switch (name) {
            case "DocumentType":
                this.setState({ documentTypeId: value });
                break;
            case "Filter":
                this.setState({ FilterValue: value, pageNumber: 1 }, () => {
                    this.getFacilityMember(value);
                });
                break;
            // case "FilterFacilityType":
            //     this.setState({ FilterFacilityTypeValue: value, pageNumber: 1 }, () => {
            //         this.getFacilityMember(this.state.FilterValue);
            //     });
            //     break;
            default:
        }
    }

    removeImage() {
        this.setState({
            selectedFile: undefined,
            selectedFileName: undefined,
            imageSrc: undefined,
            value: ''
        });
    }

    onFileChange(event) {
        if (event.target.files[0]) {
            this.setState({
                selectedFile: event.target.files[0],
                selectedFileName: event.target.files[0].name,
                imageSrc: window.URL.createObjectURL(event.target.files[0]),
                value: event.target.value,
            });
        }
    };

    compareBy(key) {
        return function (a, b) {
            if ("" + a[key] < ("" + b[key])) return -1;
            if ("" + a[key] > ("" + b[key])) return 1;
            return 0;
        };
    }

    handleDocSave = () => {
        if (documentBL.ValidateControls() == "") {
            let documentTypeName = this.state.documentType.find((item) => { return item.Id == this.state.documentTypeId }).Name;
            this.setState({ documentType: this.removeByAttr(this.state.documentType, 'Id', this.state.documentTypeId) });
            let gridDocumentData = this.state.gridDocumentData;
            gridDocumentData.push({
                facilityMemberDocumentId: 0,
                // propertyMemberDocumentId: 0,
                documentTypeId: this.state.documentTypeId,
                documentTypeName: documentTypeName,
                documentName: this.state.documentName,
                documentFileName: this.state.selectedFileName,
                documentUrl: this.state.imageSrc,
                selectedFile: this.state.selectedFile
            });
            this.setState({ gridDocumentData: gridDocumentData });
            //clear object
            this.setState({ documentName: " " });
            this.removeImage();
        }
    }

    onDocumentGridData(gridLink) {
        window.open(gridLink);
    }

    onDocumentGridDelete(gridId) {
        let myhtml = document.createElement("div");
        //myhtml.innerHTML = "Save your changes otherwise all change will be lost! </br></br> Are you sure want to close this page?" + "</hr>"
        myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>"
        alert: (
            swal({
                buttons: {
                    ok: "Yes",
                    cancel: "No",
                },
                content: myhtml,
                icon: "warning",
                closeOnClickOutside: false,
                dangerMode: true
            }).then((value) => {
                switch (value) {
                    case "ok":
                        this.setState({ gridDocumentData: this.removeByAttr(this.state.gridDocumentData, 'facilityMemberDocumentId', gridId) });

                        //dropdown                        
                        let documentType = this.state.documentType;
                        this.state.documentType.map((item) => {
                            if (item.Id == gridId)
                                documentType.push(item);
                        });
                        let arrayCopy = [...this.state.documentType];
                        arrayCopy.sort(this.compareBy("Id"));
                        this.setState({ documentType: arrayCopy });
                        this.setState({ documentTypeId: "0" });
                        appCommon.showtextalert("Document Deleted Successfully", "", "success");
                        break;
                    case "cancel":
                        //do nothing 
                        break;
                    default:
                        break;
                }
            })
        );
    }

    removeByAttr(arr, attr, value) {
        var i = arr.length;
        while (i--) {
            if (arr[i]
                && arr[i].hasOwnProperty(attr)
                && (arguments.length > 2 && arr[i][attr] === value)) {
                arr.splice(i, 1);
            }
        }
        return arr;
    }

    updateData = (name, value) => {
        switch (name) {
            case "Name":
                this.setState({ Name: value });
                break;
            case "Contact":
                this.setState({ Contact: value });
                break;
            case "Address":
                this.setState({ Address: value });
                break;
            case "DocumentName":
                this.setState({ documentName: value });
                break;
            default:
        }
    }

    onDropdownChanges = (value, id) => {
        switch (value) {
            case "Gender":
                this.setState({ Gender: id });
                break;
            case "FacilityMaster":
                this.setState({ FacilityMasterId: id });
                break;
            case "PropertyTower":
                this.setState({ PropertyTowerId: id });
                this.loadPropertyFlat(id);
                break;
            case "PropertyDetails":
                this.setState({ PropertyDetailsIds: id });
                break;
            case "PropertyFlat":
                let dataValue = [...this.state.PropertyDetailsIds];
                let isExist = dataValue.find((i) => { if (i.Id.toString() == id.toString()) { return true } else { return false } });
                if (!isExist) {
                    let item = this.state.PropertyFlat.find((item) => {

                        if (item.Value == id) {
                            dataValue.push({ Id: item.Value, Name: item.Name, value: item.Name, label: item.Name, color: '#0052CC' });
                            this.onDropdownChanges("PropertyDetails", dataValue);
                            return item;
                        }
                    });
                    this.state.PropertyDetailsIds.push(item);
                }
                //remove item from flat dropdown
                let data = this.removeByAttr(this.state.PropertyFlat, 'Value', parseInt(id));
                this.setState({ PropertyFlat: data });
                $('#ddlFlatList').val("0");
                break;
            default:
        }
    }

    handleImagechange = () => {
        this.setState({ Showimguploader: true });
    }
    handleImageClose = () => {
        this.setState({ Showimguploader: false });
    }

    checkActiveInactiveData = (val) => {
        this.setState({ isServiceStaff: val }, () => {
            if (val === 'Staff') {
                this.setState({ FacilityTypeId: 2 })
            }
            else if (val === "Service") {
                this.setState({ FacilityTypeId: 1 })
            }
            this.getFacilityMember(val);
        })
    }

    //End
    render() {
        return (
            <div>
                {this.state.PageMode == 'Home' &&
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex p-0">
                                    <ul className="nav tableFilterContainer">
                                        <li className="nav-item">
                                            <div className="btn-group">
                                                <Button id="btnStaff"
                                                    Action={this.checkActiveInactiveData.bind(this, 'Staff')}
                                                    ClassName={this.state.isServiceStaff === 'Staff' ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Staff" />
                                                <Button id="btnService"
                                                    Action={this.checkActiveInactiveData.bind(this, 'Service')}
                                                    ClassName={this.state.isServiceStaff === 'Service' ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Service" />
                                            </div>
                                        </li>
                                        <li className="nav-item ">
                                            <div className='form-inline'>
                                                <label htmlFor="lblFilter">Filter</label>
                                                <SelectBox
                                                    ID="ddlFilter"
                                                    Value={this.state.FilterValue}
                                                    onSelected={this.onSelected.bind(this, "Filter")}
                                                    Options={this.state.Filter}
                                                    ClassName="form-control" />
                                            </div>
                                        </li>
                                    </ul>
                                    <ul className="nav ml-auto tableFilterContainer">
                                        {
                                            this.state.PropertyId !== 0 && <li className="nav-item">
                                                <div className="input-group input-group-sm">
                                                    <div className="input-group-prepend">
                                                        <Button id="btnNewComplain"
                                                            Action={this.addNew.bind(this)}
                                                            ClassName="btn btn-success btn-sm"
                                                            Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                            Text={`Add ${this.state.isServiceStaff}`} />
                                                    </div>
                                                </div>
                                            </li>
                                        }
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdFacilityMember"
                                        IsPagination={true}
                                        ColumnCollection={this.state.gridFacilityMemberHeader}
                                        totalpages={this.state.grdTotalPages}
                                        totalrows={this.state.grdTotalRows}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        onGridBlockMethod={this.onGridBlock.bind(this)}
                                        DefaultPagination={false}
                                        IsSarching="true"
                                        GridData={this.state.gridFacilityMemberData}
                                        pageSize="500" />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {(this.state.PageMode == 'Add' || this.state.PageMode == 'Edit') &&
                    <div>
                        <div>
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div class="col-sm-4">
                                            <div class="form-group">
                                                <label htmlFor="lblName">Name</label>
                                                <InputBox Id="txtName"
                                                    Value={this.state.Name}
                                                    onChange={this.updateData.bind(this, "Name")}
                                                    PlaceHolder="Name"
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="form-group">
                                                <label htmlFor="lblGender">Gender</label>
                                                <DropDownList Id="ddlGender"
                                                    onSelected={this.onDropdownChanges.bind(this, "Gender")}
                                                    Options={this.state.GenderList} />
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="form-group">
                                                <label htmlFor="lblFacilityMaster">Job Profile</label>
                                                <DropDownList Id="ddlFacilityMaster"
                                                    onSelected={this.onDropdownChanges.bind(this, "FacilityMaster")}
                                                    Options={this.state.FacilityMaster} />
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="form-group">
                                                <label htmlFor="lblContact">Contact</label>
                                                <InputBox Id="txtContact"
                                                    Value={this.state.Contact}
                                                    onChange={this.updateData.bind(this, "Contact")}
                                                    PlaceHolder="Contact"
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="form-group">
                                                <label htmlFor="lblAddress">Address</label>
                                                <InputBox Id="txtAddress"
                                                    Value={this.state.Address}
                                                    onChange={this.updateData.bind(this, "Address")}
                                                    PlaceHolder="Address"
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>
                                        {this.state.FacilityTypeId == 1 &&
                                            <div class="col-sm-4">
                                                <div class="form-group">
                                                    <label htmlFor="ddlTowerList">Tower/Wing</label>
                                                    <DropDownList Id="ddlTowerList"
                                                        onSelected={this.onDropdownChanges.bind(this, "PropertyTower")}
                                                        Options={this.state.PropertyTowersData} />
                                                </div>
                                            </div>
                                        }
                                    </div>

                                    {this.state.FacilityTypeId == 1 && <div>
                                        <div className="row">
                                            <div class="col-sm-4">
                                                <div class="form-group">
                                                    <label htmlFor="ddlFlatList">Flat Name</label>
                                                    <DropDownList Id="ddlFlatList"
                                                        onSelected={this.onDropdownChanges.bind(this, "PropertyFlat")}
                                                        Options={this.state.PropertyFlat} />
                                                </div>
                                            </div>
                                            <div class="col-sm-8">
                                                <label htmlFor="selectedFlat">Selected Flat Name</label>
                                                <div class="form-group">
                                                    <div className="disableKey"><MultiSelectInline
                                                        ID="ddlPropertyDetails"
                                                        isMulti={true}
                                                        value={this.state.PropertyDetailsIds}
                                                        onChange={this.onDropdownChanges.bind(this, "PropertyDetails")}
                                                    //options={this.state.OwnerData} 
                                                    /></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    }
                                    <div className="row">
                                        <div className="col-sm-4">
                                            {
                                                (this.state.PageMode === 'Add' || this.state.Showimguploader) ?
                                                    <div className="form-group">
                                                        <label htmlFor="lbPictureUpload">Picture Upload</label>
                                                        <div style={{ display: "flex" }}>
                                                            <div style={{ marginRight: "15px" }}>
                                                                <ImageUploader
                                                                    singleImage={true}
                                                                    //withIcon={true}
                                                                    withIcon={false}
                                                                    withPreview={true}
                                                                    label=""
                                                                    // label="Max file size: 5mb, accepted: jpg, png, svg"
                                                                    buttonText="Upload Images"
                                                                    onChange={this.onDrop}
                                                                    imgExtension={[".jpg", ".png", ".svg"]}
                                                                    maxFileSize={5242880}
                                                                    fileSizeError=" file size is too big"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            {this.state.PageMode === "Edit" && !this.state.Showimguploader &&
                                                <div style={{ marginRight: "15px" }}>
                                                    <img className="ImageView" src={this.state.ProfileImageUrl}
                                                        style={{ height: "90px" }} />
                                                </div>
                                            }
                                            {!this.state.Showimguploader && this.state.PageMode === "Edit" &&
                                                <Button
                                                    Id="bntShowimage"
                                                    Text="Upload Image"
                                                    Action={this.handleImagechange}
                                                    ClassName="btn btn-link" />
                                            }
                                            {this.state.Showimguploader && this.state.PageMode === "Edit" &&
                                                <Button
                                                    Id="bnthideimage"
                                                    Text="Cancel"
                                                    Action={this.handleImageClose}
                                                    ClassName="btn btn-link" />
                                            }
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="modal-content">
                                            <div className="modal-body">
                                                <div className="row">
                                                    <div className="col-sm-3">
                                                        <div className="form-group">
                                                            <label htmlFor="lbDocumentType">Document Type</label>
                                                            <SelectBox
                                                                ID="ddlDocumentType"
                                                                Value={this.state.documentTypeId}
                                                                onSelected={this.onSelected.bind(this, "DocumentType")}
                                                                Options={this.state.documentType}
                                                                ClassName="form-control " />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <div className="form-group">
                                                            <label htmlFor="lbDocumentName">Document Number</label>
                                                            <InputBox Id="txtDocumentName"
                                                                onChange={this.updateData.bind(this, "DocumentName")}
                                                                PlaceHolder="Document Number"
                                                                Value={this.state.documentName}
                                                                Class="form-control"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <div className="form-group">
                                                            <label htmlFor="lbDocumentUpload">Document Upload</label>
                                                            <div className="pr-inner-block mar-bottom-zero-cover">
                                                                <DocumentUploader
                                                                    Class={"form-control "}
                                                                    Id={"fileDocumentUploader"}
                                                                    type={"file"}
                                                                    value={this.state.value}
                                                                    onChange={this.onFileChange.bind(this)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <br></br>
                                                        <Button
                                                            Id="btnAddDoc"
                                                            Text="Add Document"
                                                            Action={this.handleDocSave.bind(this)}
                                                            ClassName="btn btn-primary" />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <DataGrid
                                                            Id="grdDoc"
                                                            IsPagination={false}
                                                            ColumnCollection={this.state.gridDocumentHeader}
                                                            onGridDeleteMethod={this.onDocumentGridDelete.bind(this)}
                                                            onGridDownloadMethod={this.onDocumentGridData.bind(this)}
                                                            GridData={this.state.gridDocumentData}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <Button
                                        Id="btnSave"
                                        Text="Save"
                                        Action={this.handleSave.bind(this, "Save")}
                                        ClassName="btn btn-primary" />
                                    <Button
                                        Id="btnSaveAndApprove"
                                        Text="Save &amp; Approve"
                                        Action={this.handleSave.bind(this, "SaveApprove")}
                                        ClassName="btn btn-success" />
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
                }
            </div>
        );
    }
}

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(FacilityMember);


