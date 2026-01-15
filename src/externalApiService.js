import axios from 'axios';

console.log('External API Service Loaded');

export async function fetchData(){
    try{
        const response = await axios.get('https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_Counties/FeatureServer/0/query?where=1%3D1&outFields=population%2C+state_name&returnGeometry=false&f=pjson');
        const stateDictionary = createStateDictionary(response.data);
        
        return stateDictionary;
    }catch (error){
        console.log(error);
    }
}

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