// we're using apiRoutes/index.js as a central hub for all routing functions we may want to add to the application

//We've added this code so that later, when we add additional routes, they can all be exported from the same file.

const router = require('express').Router();
const animalRoutes = require('../apiRoutes/animalRoutes');

router.use(animalRoutes);

//Don't forget to go into apiRoutes/index.js and update the file with middleware so that the router uses the new zookeeper routes
router.use(require('./zookeeperRoutes'));

module.exports = router;