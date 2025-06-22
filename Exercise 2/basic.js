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
    const emptyDataButton = document.getElementById("empty-table");

    submitDataButton.addEventListener("click", function(event) {
        event.preventDefault();
        const username = document.getElementById("input-username").value;
        const email = document.getElementById("input-email").value;
        const admin = document.getElementById("input-admin").checked; 
        const image = document.getElementById("input-image").files[0];
        const table = document.getElementById("user-table");
        const tableBody = table.querySelector('tbody'); // Get the table body specifically


        let usernameExists = false;
        for (let i = 0; i < tableBody.rows.length; i++) {
            const tableRow = tableBody.rows[i];
            if (tableRow.cells[0].textContent === username) { // Check if username already exists
                usernameExists = true; 
                if (email !== "") { //If an email is given, update the email box
                    tableRow.cells[1].textContent = email;
                }
                tableRow.cells[2].textContent = admin ? "X" : "-"; 
                if (image) { // If an image is uploaded, update the image box
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

        
        // If username does not exist, create a new row and  append it to the table body
        if (!usernameExists) {     
            const newRow = document.createElement("tr");
            newRow.align = "center"; 

            const usernameCB = document.createElement("td");
            usernameCB.textContent = username;  
            const emailCB = document.createElement("td");
            emailCB.textContent = email; 
            const roleCB = document.createElement("td");
            roleCB.textContent = admin ? "X" : "-"; 
            roleCB.align = "center"; 
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
            tableBody.appendChild(newRow); 
        }

        // Clear form fields
        document.getElementById("input-username").value = "";
        document.getElementById("input-email").value = "";
        document.getElementById("input-admin").checked = false;
        document.getElementById("input-image").value = "";
    });
    

    // Add event listener for empty table button
    emptyDataButton.addEventListener("click", function() {
        const table = document.getElementById("user-table");
        const tableBody = table.querySelector('tbody'); 
        tableBody.innerHTML = ""; 
    });
}