import React, { Component } from 'react';
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Ensure correct part is used
    reader.onerror = error => reject(error);
});

class FileUpload extends Component {
    constructor(props) {
        super(props);
        this.onFileChange = this.onFileChange.bind(this); // Bind the method here
    }

    async onFileChange(event) {
        if (event.target.files[0] !== undefined && event.target.files[0] !== null) {
            let UpFile = event.target.files[0];
            const imgbytes = UpFile.size; // Size in bytes
            const imgkbytes = Math.round(imgbytes / 1024); // Size in KB
            const fileD = await toBase64(UpFile);
            const extension = UpFile.name.substring(UpFile.name.lastIndexOf('.') + 1).toLowerCase();
            
            const res = {
                filename: UpFile.name,
                filepath: fileD, // Using the correct base64 part
                sizeinKb: imgkbytes,
                fileType: `data:${UpFile.type};base64`, // Adding MIME type
                extension: extension
            };

            this.props.onChange(res);
        }
    }

    render() {
        return (
            <div className="custom-file">
                <input
                    type="file"
                    className={this.props.className}
                    id={this.props.id}
                    onChange={this.onFileChange} // Using the bound method
                />
                <label className="custom-file-label" htmlFor={this.props.id}>Choose file</label>
            </div>
        );
    }
}

export default FileUpload;