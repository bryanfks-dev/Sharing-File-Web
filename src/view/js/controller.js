const fileData = (num, name, link) => {
    return `
        <tr>
            <td>${num}</td>
            <td>${name}</td>
            <td>
                <a href="/file/${name}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: var(--green-clr-100);"><path d="M19 9h-4V3H9v6H5l7 8zM4 19h16v2H4z"></path></svg>
                </a>
            </td>
        </tr>
    `.trim();
}

const tableBody = document.querySelector("tbody");

let data;

const initFileData = async () => {
    const res = await fetch('/api/filesData', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
    });

    data = await res.json();

    tableBody.innerHTML = "";

    for (let i = 0; i < data.fileNames.length; i++) {
        tableBody.innerHTML += fileData(i + 1, data.fileNames[i])
    }
}

initFileData();

// Polling file data from storage every 5 seconds
setInterval(() => {
    initFileData();
}, 5000);

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