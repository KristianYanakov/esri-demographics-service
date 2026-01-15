import axios from 'axios';

console.log('External API Service Loaded');

/**
 * Fetch data from external API and process it into a dictionary with mapped STATE_NAME : POPULATION
 * @returns {Object} State dictionary with populations
 */
export async function fetchData(){
    try{
        const response = await axios.get('https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_Counties/FeatureServer/0/query?where=1%3D1&outFields=population%2C+state_name&returnGeometry=false&f=pjson');
        const stateDictionary = createStateDictionary(response.data);
        
        return stateDictionary;
    }catch (error){
        console.log(error);
    }
}

/**
 * Creates a dictionary and calculates the population for each state
 * @param {Object} data - API response
 * @returns {Object} Dictionary with state names as keys and total population as values
 */
function createStateDictionary(data){
    try{
        let stateDict = {};

        for (let i=0; i < data.features.length; i++){
            let feature = data.features[i];
            let stateName = feature.attributes.STATE_NAME;
            let population = Number(feature.attributes.POPULATION);

            if (stateName in stateDict){
                stateDict[stateName] += population;
                continue;
            }
            stateDict[stateName] = population;
        }

        return stateDict;

    }catch(error){
        console.log(error);
    }   
}