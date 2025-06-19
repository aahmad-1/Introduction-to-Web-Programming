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
    
    // Change "Hello world" to "Moi maailma" & print "hello world" to console
    const changeButton = document.getElementById("change-button");
    const heading1 = document.getElementById("Heading1");
    
    changeButton.addEventListener("click", function() {
        console.log("hello world");
        heading1.textContent = "Moi maailma";
    });

    // Add items/text to the list
    const list = document.getElementById("my-list");
    const addData = document.getElementById("add-data");
    const inputItem = document.getElementById("input-item");

    addData.addEventListener("click", function() { 
        const addedData = document.createElement("li");
        addedData.textContent = inputItem.value;
        list.appendChild(addedData);
        inputItem.value = ""; // Clear the input field
    });
}