const database = require('../database');
const express = require('express');
const router = express.Router();


router.get('/', async (req,res) => {
    try {
        //Connection to db and collection
        const db = database.getDB();
        const collection = db.collection("MapData");
        const custType = ["Young","Old","Middle"];
        //random longitude + latitide, junk data
        const doc = {
            latitude: (Math.random() * 360) - 180,
            longitude: (Math.random() * 360) - 180,
            customer: custType[Math.floor((Math.random() * 100) % custType.length)]
        }
        
        //Inserts the document into the collection
        const result = await collection.insertOne(doc);

        //Sends a message in the console
        console.log(`A document was inserted with the _id: ${result.insertedId}`);

    } catch (e){
        console.log(e);
    }
});
  
module.exports = router;