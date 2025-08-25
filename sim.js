const express = require('express');
const path = require('path');

const app = express();
const port = 3000; 

app.use('/wasm', express.static(path.join(__dirname, 'wasm')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'simulation.html')); 
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
