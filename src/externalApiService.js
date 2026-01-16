import axios from 'axios';

console.log('External API Service Loaded');

/**
 * Fetch data from external API and process it into a dictionary with mapped STATE_NAME : POPULATION
 * @async
 * @returns {Promise<Object>} State dictionary with populations
 * @throws {Error} Logs error if API request fails
 * @example
 * const stateData = await fetchData();
 * // Returns: { "California": 39512223, "Texas": 28995881, ... }
 */
export async function fetchData(){
    try{
        const response = await axios.get('https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_Counties/FeatureServer/0/query?where=1%3D1&outFields=population%2C+state_name&returnGeometry=false&f=pjson');
        const stateDictionary = createStateDictionary(response.data);
        
        return stateDictionary;
    }catch (error){
        console.error(error);
        throw error;
    }
}

/**
 * Creates a dictionary and calculates the population for each state
 * @param {Object} data - API response containing features array
 * @param {Array} data.features - Array of county features
 * @param {Object} data.features[].attributes - County attributes
 * @param {string} data.features[].attributes.STATE_NAME - State name
 * @param {number|string} data.features[].attributes.POPULATION - County population
 * @returns {Object<string, number>} Dictionary with state names as keys and total population as values
 * @throws {Error} Logs error if data processing fails
 * @example
 * const apiResponse = { features: [...] };
 * const result = createStateDictionary(apiResponse);
 * // Returns: { "California": 39512223 }
 */
function createStateDictionary(data){
    try{
        if (!data || !data.features || !Array.isArray(data.features)) {
            throw new Error('Invalid data received from API');
        }

        let stateDict = {};

        for (let i=0; i < data.features.length; i++){
            let feature = data.features[i];
            let stateName = feature.attributes.STATE_NAME;
            let population = Number(feature.attributes.POPULATION);

            if(!stateName || isNaN(population)){
                console.log("Corrupted entry! Skipping...");
                continue;
            }

            if (stateName in stateDict){
                stateDict[stateName] += population;
                continue;
            }
            stateDict[stateName] = population;
        }

        return stateDict;

    }catch(error){
        console.error(error);
        throw error;
    }   
}