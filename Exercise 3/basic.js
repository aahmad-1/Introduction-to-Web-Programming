if(document.readyState !== "loading") {
    console.log("Document is ready!");
    initializedCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is ready after waiting!");
        initializedCode();
    });
}