const fileData = (num, name, link) => {
    return `
        <tr>
            <td>${num}</td>
            <td>${name}</td>
            <td>
                <a href="/file/${name}" target="_blank">
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

setInterval(() => {
    initFileData();
}, 5000);