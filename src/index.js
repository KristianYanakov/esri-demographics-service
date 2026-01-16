import express from 'express';
import cron from 'node-cron';
import fs from 'fs/promises';

import { fetchData } from './externalApiService.js';

const app = express();
const PORT = process.env.PORT || 8000;
const FILE_NAME = 'stateData.json';

app.use(express.json());
app.use(express.static("public"));

/**
 * Periodically fetches demographic data and saves it to a JSON file
 * Handles errors gracefully without crashing the application
 * @async
 * @throws {Error} Logs error but doesn't throw to prevent cron job failure
 */
async function writeDataToFile(){
    try{
        const data = await fetchData();

        if(!data || Object.keys(data).length === 0){
            throw new Error('No data received from external API!');
        }

        await fs.writeFile(FILE_NAME, JSON.stringify(data, null, 2));
        console.log('Data written to file successfully');
    }catch(error){
        console.error("Error occured when writing in the file!: " + error.message);
    }
}

cron.schedule('0 * * * *', () => {
    console.log('Cron job called:', new Date().toISOString());
    writeDataToFile();
});

//First save on server start
writeDataToFile();

/**
 * GET /statePopulation
 * Retrieves state population data with optional filtering by state name
 * 
 * @route GET /statePopulation
 * @queryparam {string} [state] - Optional state name for filtering (case-insensitive)
 * @returns {Object} 200 - All state populations or single state data
 * @returns {Object} 404 - State not found
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Get all states
 * GET /statePopulation
 * 
 * @example
 * // Get specific state
 * GET /statePopulation?state=California
 */
app.get('/statePopulation', async (req, res) => {
    try{
        const data = await fs.readFile(FILE_NAME, 'utf-8');
        const stateData = JSON.parse(data);

        if(!req.query.state){
            return res.json(stateData);
        }

        for(let stateName in stateData){
            if(stateName.toLowerCase() === req.query.state.toLowerCase()){    
                return res.json({ state: stateName, population: stateData[stateName] });
            }
        }

        return res.status(404).json({
            error: 'State Not Found',
            message: `State '${req.query.state}' does not exist in the data.`, 
            });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while processing your request.', 
        });
    }
});

/**
 * GET /
 * Renders the home page with state population data in HTML format
 * 
 * @route GET /
 * @returns {HTML} 200 - Rendered EJS template with state data
 * @returns {Object} 500 - Internal server error
 * 
 * @description Displays all states and their populations in a formatted HTML page
 */
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
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while processing your request.', 
        });
    }
});

/**
 * Initializes the Express server and starts listening on the specified port
 * @constant {number} PORT - Server port number from environment variable or default 8000
 */
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/statePopulation`);
    console.log(`Web interface: http://localhost:${PORT}/`);
})