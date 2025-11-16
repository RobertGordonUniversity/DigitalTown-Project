//https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Sending_forms_through_JavaScript#Using_XMLHttpRequest_and_the_FormData_object
const form = document.getElementById("CSVinfo");

//Function gets data from the CSV form and sends it server side
async function uploadCSV(){

    const formData = new FormData(form);

    //tries to post and sends error if unsuccessful
    try {
        const response = await fetch("/api/csv", {
            method: "POST",
            body: formData
        });
    
        const result = await response.json();
    
        document.getElementById("message").innerText = "CSV uploaded successfully!";
        
    } catch (error) {
        document.getElementById("message").innerText = "Upload failed!";
        console.error(error);
    }
} 

form.addEventListener("submit", (event) => {
    event.preventDefault();
    uploadCSV();
});