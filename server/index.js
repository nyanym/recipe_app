const express = require('express');

const app = express();
const PORT = 5000;

app.use(express.json());

// Sample backend API route
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from Node.js backend!' });
});

app.listen(PORT, () => {
  console.log(`Node server is running on http://localhost:${PORT}`);
});
