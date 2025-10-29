
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://TestUser:TestPassword@cluster0.fp8sfws.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

async function connectDB() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        db = client.db("TicketSales");
    } catch{
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

function getDB(){
    if (!db) throw new Error("Database not intialized");
    return db;
}

module.exports = {connectDB, getDB};