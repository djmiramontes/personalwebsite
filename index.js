const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files (like CSS, images)
app.use(express.static('public'));

// Default route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/views/about.html');
});

app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/views/contact.html');
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
