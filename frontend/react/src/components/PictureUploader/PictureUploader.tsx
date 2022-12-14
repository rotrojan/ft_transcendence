import React from "react";
import "./PictureUploader.css"

type MyState = {
    picture: any;
    src: string;
}

export default class PictureUploader extends React.Component<{}, MyState>{
    constructor(props: any) {
        super(props);
        this.state = {
            picture: "",
            src: ""
        };
    }

    handlePictureSelected(event: any) {
        var picture = event.target.files[0];
        var src = URL.createObjectURL(picture);

        this.setState({
            picture: picture,
            src: src
        });
    }

    renderPreview() {
        if (this.state.src !== "") {
            return (
				<div className="preview">
                	<img src={this.state.src} alt="Preview of your avatar" />
				</div>
            );
        } else {
            return (
                <div className="preview">
				</div>
            );
        }
    }

    async upload() {
        var url: string = "/user/uploadPicture";
        var credentials: RequestCredentials = "include";

        var formData = new FormData();
        formData.append("file", this.state.picture);

        var requestOptions = {
            method: 'POST',
            body: formData,
            credentials: credentials
        };

        let result = await fetch(url, requestOptions);
        if (result.status === 401) {
            window.location.assign("/");
        } else if (result.status === 403) {
            alert("Wrong format : format must be png, jpg or jpeg");
        } else if (result.status !== 201) {
            alert(result.status + " " + result.statusText);
        } else {
		    window.location.assign("/myProfile");
        }
    }

    render() {
        return (
            <div className="pictureUploader">
                <h1>Upload your avatar</h1>
                <input type="file" name="file" id="file" className="inputfile" onChange={this.handlePictureSelected.bind(this)} />
                {this.renderPreview()}
                <button onClick={this.upload.bind(this)}>Upload</button>
            </div>
        );
    }
}