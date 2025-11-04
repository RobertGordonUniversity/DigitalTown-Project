const database = require('../database');
const express = require('express');
const router = express.Router();

router.get('/', async (req,res) => {
    try {
        //Connection to db and collection
        const db = database.getDB();
        const collection = db.collection("MapData");

        //collects all records from the collection
        const records = await collection.find({}).toArray();

        //returns as a json response
        res.json(records);

    } catch (e){
        console.log(e);
    }
});
  
module.exports = router;