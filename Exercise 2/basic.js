if(document.readyState !== "loading") {
    console.log("Document is ready!");
    initializedCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is ready after waiting!");
        initializedCode();
    });
}

function initializedCode() {
    const submitDataButton = document.getElementById("submit-data");
    const emptyDataButton = document.getElementById("empty-data");

    submitDataButton.addEventListener("click", function(event) {
        event.preventDefault();
        const username = document.getElementById("input-username").value;
        const email = document.getElementById("input-email").value;
        const admin = document.getElementById("input-admin").checked;
        const image = document.getElementById("input-image").files[0];
        const table = document.getElementById("user-table");

        let usernameExists = false;
        for (let i = 1; i < table.rows.length; i++) {
            const tableRow = table.rows[i];
            if (tableRow.cells[0].textContent === username) {
                usernameFound = true;
                if (email !== "") {
                    tableRow.cells[1].textContent = email;
                    }
                    tableRow.cells[2].textContent = role ? "X" : "-";
                    if (image) {
                        const img = document.createElement("img");
                        img.src = URL.createObjectURL(image);
                        img.width = 64;
                        img.height = 64;
                        tableRow.cells[3].innerHTML = "";
                        tableRow.cells[3].appendChild(img);
                    }
                    break;

                }
            }
            if (!usernameExists) {     
            const newRow = document.createElement("tr");

            const usernameCB = document.createElement("td");
            usernameCB.textContent = username;  
            const emailCB = document.createElement("td");
            emailCB.textContent = email; 
            const roleCB = document.createElement("td");
            roleCB.textContent = role ? "X" : "-";
            const imageCB = document.createElement("td");
            if (image) {
                const img = document.createElement("img");
                img.src = URL.createObjectURL(image);
                img.width = 64;
                img.height = 64;
                imageCB.appendChild(img);
            }
            newRow.appendChild(usernameCB);
            newRow.appendChild(emailCB);
            newRow.appendChild(roleCB);
            newRow.appendChild(imageCB);
            table.appendChild(newRow);
        }

        document.getElementById("input-username").value = "";
        document.getElementById("input-email").value = "";
        document.getElementById("input-admin").checked = false;
        document.getElementById("input-image").value = "";
    });

    emptyDataButton.addEventListener("click", function() {
        const table = document.getElementById("user-table");
        const rowCount = table.rows.length;
        for (let i = rowCount - 1; i > 0; i--) {
            table.deleteRow(i);
        }
    });
}