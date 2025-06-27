if(document.readyState !== "loading") {
    console.log("Document is ready");
    initializeCode();

} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is currently loading");
        initializeCode();
    });
}

function initializeCode() {

    
}