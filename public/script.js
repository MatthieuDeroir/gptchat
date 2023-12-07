document.getElementById('save-api-token').addEventListener('click', function () {
    var apiKey = document.getElementById('api-key').value;
    if (apiKey) {
        localStorage.setItem('apiKey', apiKey);
        document.getElementById('api-key').value = '';
        document.getElementById('api-key').placeholder = 'Clé API enregistrée !';
        document.getElementById('api-key').classList.add('saved');
    } else {
        alert("Veuillez entrer une clé API valide.");
    }
});

document.getElementById('send-button').addEventListener('click', function() {
    sendMessage();
});

document.getElementById('input-message').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    var inputMessage = document.getElementById('input-message').value;
    if (inputMessage.trim() !== '') {
        addMessageToChat("Vous", inputMessage);
        updateTokenCount(inputMessage, true);
        sendMessageToAPI(inputMessage);
        document.getElementById('input-message').value = '';
        scrollToLatestMessage();
    }
}

function scrollToLatestMessage() {
    var chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('dark-mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});

function addMessageToChat(sender, message) {
    var messagesDiv = document.getElementById('messages');
    var newMessage = document.createElement('p');
    newMessage.innerHTML = '<b>' + sender + '</b>: ' + escapeHtml(message);
    messagesDiv.appendChild(newMessage);
}

function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function sendMessageToAPI(message) {
    var apiURL = "https://api.openai.com/v1/chat/completions";
    var apiKey = localStorage.getItem('apiKey');

    if (!apiKey) {
        addMessageToChat("Erreur", "Clé API non configurée.");
        return;
    }

    var data = {
        "model":"gpt-4",
        "messages": [{
            "role":"user",
            "content": message
        }]
    };

    fetch(apiURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.choices && data.choices.length > 0 && data.choices[0].message.content) {
                var reply = data.choices[0].message.content.trim();
                addMessageToChat("GPT-4", reply);
                updateTokenCount(reply);
            } else {
                addMessageToChat("GPT-4", "Aucune réponse reçue de l'API.");
            }
        })
        .catch(error => {
            console.error("Erreur lors de la communication avec l'API GPT-4:", error);
            addMessageToChat("GPT-4", "Erreur lors de la communication avec l'API.");
        });
}

// Cost calculation
let promptToken = 0;
let sampledToken = 0;
const promptTokenCost = 0.03 / 1000; // Coût par token
const sampledTokenCost = 0.06 / 1000; // Coût par token

function updateTokenCount(message, isPrompt = false) {
    const tokenCount = countTokens(message);
    if (isPrompt) {
        promptToken += tokenCount;
    } else {
        sampledToken += tokenCount;
    }
    updateCostDisplay();
}

function countTokens(message) {
    return Math.ceil(message.length / 4); // Approximation simple : 4 caractères par token en moyenne
}

function updateCostDisplay() {
    const totalCost = (promptToken * promptTokenCost) + (sampledToken * sampledTokenCost);
    document.getElementById('cost-display').textContent = `Coût total de la session : $${totalCost.toFixed(2)}`;
}
