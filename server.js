const express = require('express');
const { execPath, allowedNodeEnvironmentFlags } = require('process');

const { animals } = require('./data/animals.json');

const PORT = process.env.PORT || 80;
//to start the server instantiate the server and then tell it to listen for requests
//We assign express() to the app variable so that we can later chain on methods to the Express.js server. 
const app = express();

//This function will take in req.query as an argument and filter through the animals accordingly, returning the new filtered array.
function filterByQuery(query, animalsArray) {

    let personalityTraitsArray = [];

    // note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;

    if (query.personalityTraits) {
        // save personalityTraits as a dedicated array.
        // if personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string'){
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray,
            // but here we're updating it for each trait in the .forEach() loop.
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the .forEach() loop is finished.
        filteredResults = filteredResults.filter(
            animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    
    }
    if(query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}


// get() method requires two arguments. The first is a string that describes the route the client will have to fetch from. The second is a callback function that will execute every time that route is accessed with a GET request.
//using the send() method from the res parameter (short for response) to send the string Hello! to our client.
// then we changes send() to json to send large data 
// req is short for request, res is short for response
app.get('/api/animals', (req, res) => {
    let results = animals;
    // query is a property on the request object 
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results)
});
//chain the listen() method onto our server to make our server listen
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`)
});

// after the above code run npm start then visit http://localhost:3001/api/animals to see the data on the port--- we now have a working route on our server