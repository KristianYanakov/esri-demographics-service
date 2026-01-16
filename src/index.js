import express from 'express';
import cron from 'node-cron';
import fs from 'fs/promises';

import { fetchData } from './externalApiService.js';
import { FILE } from 'dns';

const app = express();
const PORT = process.env.PORT || 8000;
const FILE_NAME = 'stateData.json';

app.use(express.json());
app.use(express.static("public"));

async function writeDataToFile(){
    try{
        const data = await fetchData();

        await fs.writeFile(FILE_NAME, JSON.stringify(data, null, 2));
        console.log('Data written to file successfully');
    }catch(error){
        console.error(error.message);
    }
}

cron.schedule('0 * * * *', () => {
    console.log('Cron job called:', new Date().toISOString());
    writeDataToFile();
});

//First load on server start
writeDataToFile();

app.get('/', async (req,res) => {
    try{
        const data = await fs.readFile(FILE_NAME, 'utf-8');
        const stateData = JSON.parse(data);
        
        res.json(stateData);
    }catch(error){
        console.log(error);
    }

});

//Server Port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})