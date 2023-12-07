const express = require('express');
const app = express();
const port = 3000;

// Servez les fichiers statiques (HTML, CSS, JS) depuis le dossier 'public'
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Le serveur est en écoute sur http://localhost:${port}`);
});
