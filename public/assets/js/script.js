const $animalForm = document.querySelector('#animal-form');

const handleAnimalFormSubmit = event => {
  event.preventDefault();

  // get animal data and organize it
  const name = $animalForm.querySelector('[name="animal-name"]').value;
  const species = $animalForm.querySelector('[name="species"]').value;
  const dietRadioHTML = $animalForm.querySelectorAll('[name="diet"]');
  let diet;

  for (let i = 0; i < dietRadioHTML.length; i += 1) {
    if (dietRadioHTML[i].checked) {
      diet = dietRadioHTML[i].value;
    }
  }

  if (diet === undefined) {
    diet = '';
  }

  const selectedTraits = $animalForm.querySelector('[name="personality"]').selectedOptions;
  const personalityTraits = [];
  for (let i = 0; i < selectedTraits.length; i += 1) {
    personalityTraits.push(selectedTraits[i].value);
  }
  const animalObject = { name, species, diet, personalityTraits };

  // when we submit a new animal through the form, we collect all the input data into an animalObject and use fetch() to POST our data to the server.
  //By default, the browser's fetch() API functionality performs GET requests and POST requests 
  fetch('/api/animals', {
    //  specifying POST as the method will allow the request to make it to the proper endpoint in our server, which is the one we created in the previous lesson to add new animals to the JSON file.
    method: 'POST',
    //Next, we have to tell the request what type of data we're looking to send and then actually provide the data. We set the headers property to inform the request that this is going to be JSON data. That way, we can add stringified JSON data for our animalObject to the body property of the request. Without these, we would never receive req.body on the server!
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(animalObject)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      alert('Error: ' + response.statusText);
    })
    .then(postResponse => {
      console.log(postResponse);
      alert('Thank you for adding an animal!');
    });

};

$animalForm.addEventListener('submit', handleAnimalFormSubmit);
