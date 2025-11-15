const database = require('../database');
const express = require('express');
const multer = require("multer");
const fs = require("fs");
const csv = require("csvtojson");
const router = express.Router();


const upload = multer({dest: "uploads/"})

router.post('/', upload.single('CSV'), async (req, res) => {
    if (req.file) {
        const filePath = req.file.path;

        try {
            const db = database.getDB();
            const collection = db.collection("MapData");
            
            //CSV to JSON
            const jsonData = await csv().fromFile(filePath);

            if (!Array.isArray(jsonData)) {
                return res.status(400).send("CSV format invalid: not returning array");
            }

            await collection.insertMany(jsonData);

            res.send({message: "CSV uploaded!"})

        } catch (err) {
            console.error(err);
            res.status(500).send({ error: err.message });
        } finally {
            try {
                await fs.promises.unlink(filePath);
            } catch (err) {
                console.error("Failed to delete file:", err);
            }
        }
    } else {
        return res.status(400).send("No CSV uploaded");
    }
});
  
module.exports = router;