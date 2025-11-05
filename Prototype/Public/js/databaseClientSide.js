//Function sends one document to the database to store
//Mainly just used for testing
async function Populate(){
    try {
        await fetch('/api/populate');
    } catch (error){
        console.log(error);
    }
} 


//Function gets all data from one table and returns it.
async function Get(){
    try {
        const res = await fetch('/api/get');
        const data = await res.json();

        document.getElementById('result').innerText = JSON.stringify(data, null, 2);

    } catch (error) {
        console.log(error);
    }
}

async function GetCustomer(){
    try {
        const res = await fetch('/api/get');
        const data = await res.json();

        // document.getElementById('result').innerText = JSON.stringify(data, null, 2);
        console.log("This is happening on client")
        console.log(data);
        return data;
        //return JSON.stringify(data, null, 2);
    } catch (error) {
        console.log(error);
    }
}