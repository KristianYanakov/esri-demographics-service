import axios from 'axios';

console.log('External API Service Loaded');

export async function fetchData(){
    try{
        const response = await axios.get('https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_Counties/FeatureServer/0/query?where=1%3D1&outFields=population%2C+state_name&returnGeometry=false&f=pjson');
        
        // console.log(response.data.features[1].attributes.POPULATION);
        // console.log(response.data.features[1].attributes.STATE_NAME);

        console.log('Data fetched successfully');

        const stateDictionary = createStateDictionary(response.data);
        
        console.log(stateDictionary);
        console.log('State dictionary created successfully'+" LENGTH " + Object.keys(stateDictionary).length);

    }catch (error){
        console.log(error);
    }
}

fetchData();

function createStateDictionary(data){
    try{
        let stateDict = {};

        for (let i=0; i < data.features.length; i++){
            let feature = data.features[i];
            let stateName = feature.attributes.STATE_NAME;
            let population = feature.attributes.POPULATION;

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