import express from 'express';
import cron from 'node-cron';
import fs from 'fs/promises';

import { fetchData } from './externalApiService.js';

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

// app.get('/json', async (req,res) => {
//     try{
//         const data = await fs.readFile(FILE_NAME, 'utf-8');
//         const stateData = JSON.parse(data);
        
//         res.json(stateData);
//     }catch(error){
//         console.log(error);
//     }
// });

app.get('/statePopulation', async (req, res) => {
    try{
        const data = await fs.readFile(FILE_NAME, 'utf-8');
        const stateData = JSON.parse(data);

        if(!req.query.state){
            return res.json(stateData);
            // return res.status(400).json({ error: 'State ( state ) query parameter is required to filter (ex: statePopulation?state=California)' });
        }

        for(let stateName in stateData){
            if(stateName.toLowerCase() === req.query.state.toLowerCase()){    
                return res.json({ state: stateName, population: stateData[stateName] });
            }
        }

        return res.json({ message: 'State not found' });
    }catch(error){
        console.log(error);
    }
});

app.get('/', async (req, res) => {
    try{
        const data = await fs.readFile(FILE_NAME, 'utf-8');
        const stateData = JSON.parse(data);

        const context = {
            "stateNames" : Object.keys(stateData),
            "populations" : Object.values(stateData),
        }

        res.render('index.ejs', context);
    }catch(error){
        console.log(error);
    }
})
//Server Port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})