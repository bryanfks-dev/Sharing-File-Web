const uploadFileSection = document.querySelector("section.upload-file-section");
const uploadBtn = document.querySelector(".buttons button.upload-btn")
const exitBtn = document.querySelector(".buttons button.exit-btn");
const progressBar = document.querySelector("section.upload-file-section .modal form .progress progress");

const uploadFileForm = document.querySelector("section.upload-file-section form");
const filesInput = document.querySelector("section.upload-file-section input[type='file']");
const loadedTotal = document.querySelector(".loaded-total");

// close upload file section function
const hideUploadFileSection = () => {
    uploadFileSection.style.visibility = "hidden";

    // Remove "on" class
    if (progressBar.style.display === 'block') {
        progressBar.style.display = 'none';
    }
}

const initProgressBar = (ev) => {
    progressBar.style.display = 'block';
    progressBar.value = 0;
    progressBar.max = ev.total;

    loadedTotal.textContent = `Uploaded ${ev.loaded} bytes of ${ev.total} bytes`;
}

const updateProgressBarValue = (ev) => {
    progressBar.value = ev.loaded;

    loadedTotal.textContent = `Uploaded ${ev.loaded} bytes of ${ev.total} bytes`;
}

// Upload file form listener
// This part should be handled manually, cannot use
// traditional post method from form action
uploadFileForm.addEventListener("submit", (e) => {
    // Prevent web from reloading
    e.preventDefault();

    // Validate files count
    if (!filesInput.files.length) {
        alert("No File Selected");
        return;
    }

    // File upload validation
    const formData = new FormData();

    // Append all uploaded file into form data
    for (let i = 0; i < filesInput.files.length; i++) {
        formData.append("files", filesInput.files[i]);
    }

    // Create XML request
    const req = new XMLHttpRequest();

    req.upload.addEventListener("loadstart", (e) => {
        initProgressBar(e);

        // Disable buttons
        filesInput.disabled = true;
        uploadBtn.disabled = true;
    });

    req.upload.addEventListener("progress", (e) => {
        updateProgressBarValue(e);

        if (e.loaded === e.total) {
            alert('File(s) have been uploaded');

            // Wait for certain seconds, then hide section
            setTimeout(() => {
                hideUploadFileSection();
                initFileData();
            }, 100);
        }
    });

    req.open('post', '/upload_files', true);

    req.send(formData);
});

/* Hidden function(s) */
const deleteFileData = (filename, password) => {
    const formData = new FormData();

    // Append param to form data
    formData.append("filename", filename);
    formData.appendd("password", password);

    // Send post request to 'rm_file' route
    fetch('/rm_file', {
        body: formData,
        method: 'post',
        mode: 'no-cors'
    })
    .catch((err) => console.error(err));
}