const fs = require('fs');

//This is another module built into the Node.js API that provides utilities for working with file and directory paths
const path = require('path');

const express = require('express');

const { animals } = require('./data/animals');

// heroku sets the environment PORT to 80 (heroku runs off 80, process.env.PORT  allow for that?)
const PORT = process.env.PORT || 3001;
//to start the server instantiate the server and then tell it to listen for requests
//We assign express() to the app variable so that we can later chain on methods to the Express.js server. 
const app = express();

//----Middleware----------//
// parse incoming string or array data
// express.urlencoded({extended: true}) method is a method built into Express.js. It takes incoming POST data and converts it to key/value pairings that can be accessed in the req.body object
// The extended: true option set inside the method call informs our server that there may be sub-array data nested in it as well
app.use(express.urlencoded({ extended: true}));

// parse incoming JSON data 
//The express.json() method we used takes incoming POST data in the form of JSON and parses it into the req.body JavaScript object. Both of the above middleware functions need to be set up every time you create a server that's looking to accept POST data.
app.use(express.json());

// middleware that instructs the server to make /public files readily available (css, font end js etc.)
app.use(express.static('public'));
//the express.static() method. The way it works is that we provide a file path to a location in our application (in this case, the public folder) and instruct the server to make these files static resources. This means that all of our front-end code can now be accessed without having a specific server endpoint created for it!

//----------Middleware end --------------//

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

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

//created a function that accepts the POST route's req.body value and the array we want to add the data to
function createNewAnimal (body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    //Here, we're using the fs.writeFileSync() method, which is the synchronous version of fs.writeFile() and doesn't require a callback function. If we were writing to a much larger data set, the asynchronous version would be better
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        //Next, we need to save the JavaScript array data as JSON, so we use JSON.stringify() to convert it. The other two arguments used in the method, null and 2, are means of keeping our data formatted
        JSON.stringify({ animals: animalsArray }, null, 2)
    ); 

    // return finished code to post route for response
    return animal;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
      return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
      return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
      return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
      return false;
    }
    return true;
  }



//----------------- routes/ creating API endpoints ----------------//
//We can assume that a route that has the term api in it will deal in transference of JSON data, whereas a more normal-looking endpoint such as /animals or '/' should serve an HTML page

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

//Param properties are determined by the value following : in the route
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result)
    } else {
        res.send(404);
    }
});

//POST requests differ from GET requests in that they represent the action of a client requesting the server to accept data 
app.post('/api/animals',(req, res) => {
    // req.body is where our incoming content will be 
    // set id based on what the next index of the array will be
    // animals is an array! so animals.length will be one number higher than the array index number, so we will always be adding the id one number higher than the array index (then we are making the id a string value)
    req.body.id = animals.length.toString();
    // if any data in req.body is incorrect, send 400 error back 
    if (!validateAnimal(req.body)){
        //The line res.status().send(); is a response method to relay a message to the client making the request. We send them an HTTP status code and a message explaining what went wrong. Anything in the 400 range means that it's a user error and not a server error, and the message can help the user understand what went wrong on their end
        res.status(400).send('The animal is not properly formatted.')
    } else {
    // add animal to json file and animals array in this funciton 
    const animal = createNewAnimal(req.body,animals);

    res.json(animal);
    }
});

// ---SERVING AN HTML PAGEs/ creating html endpoints  -----//

// ----- get index.html to be served from our Express.js server-----
// '/' route points us to the root route of the server, this is the route used to create a homepage for a server 
// this GET route has just one job to do, and that is to respond with an HTML page to display in the browser. So instead of using res.json(), we're using res.sendFile(), and all we have to do is indicate the path to find the file we want our server to read and send back to the client.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// We can assume that a route that has the term api in it will deal in transference of JSON data, whereas a more normal-looking endpoint such as /animals or '/' should serve an HTML page. Express.js isn't opinionated about how routes should be named and organized, so that's a system developers must create
app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
  });

app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

//-----------routes end-----------------------//

//chain the listen() method onto our server to make our server listen
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`)
});

// after the above code run npm start then visit http://localhost:3001 to see the data on the port---