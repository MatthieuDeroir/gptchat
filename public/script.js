document.getElementById('send-button').addEventListener('click', function() {
    var inputMessage = document.getElementById('input-message').value;
    addMessageToChat("Vous", inputMessage);
    sendMessageToAPI(inputMessage);
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
        sendMessageToAPI(inputMessage);
        updateTokenCount(inputMessage, true); // Mise à jour du nombre de tokens
        document.getElementById('input-message').value = ''; // Efface le message de l'input
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
    messagesDiv.innerHTML += '<b>' + sender + '</b>: ' + message + '<br>';
}

function sendMessageToAPI(message) {
    var apiKey = "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"; // Remplacez ceci par votre clé API d'OpenAI
    var apiURL = "https://api.openai.com/v1/chat/completions"; // URL de l'API GPT-4

    var data = {
        "model":"gpt-4",
        "messages": [{
            "role":"user",
            "content":`${message}`
        }]
    };

    // Appel de l'API GPT-4
    // the body must contain the "model", "messages"

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
            console.log(data.choices)

            if (data.choices && data.choices.length > 0 && data.choices[0].message.content) {
                var reply = data.choices[0].message.content.trim();
                addMessageToChat("GPT-4", reply);
                updateTokenCount(reply); // Mise à jour du nombre de tokens
            } else {
                addMessageToChat("GPT-4", "Désolé, je n'ai pas pu obtenir de réponse.");
            }
        })
        .catch(error => {
            console.error("Erreur lors de la communication avec l'API GPT-4:", error);
            addMessageToChat("GPT-4", "Une erreur est survenue lors de la communication avec l'API.");
        });
}


// Cost
let promptToken = 0;
let sampledToken = 0;
let totalTokens = 0;
const promptTokenCost = 0.03 / 1000; // Coût par token
const sampledTokenCost = 0.06 / 1000; // Coût par token



function updateTokenCount(message, isPrompt = false) {
    if (isPrompt) {
        promptToken += countTokens(message);
        console.log("prompt token count: ", promptToken)
    } else {
        sampledToken += countTokens(message);
        console.log("sampled token count: ", sampledToken)
    }
    updateCostDisplay();
}

function countTokens(message) {
    // Approximation simple : 4 caractères par token en moyenne
    return Math.ceil(message.length / 4);
}

function updateCostDisplay() {
    const totalCost = (promptToken * promptTokenCost) + (sampledToken * sampledTokenCost)
    console.log("total cost: ", totalCost)
    document.getElementById('cost-display').textContent = `Coût de la session: $${totalCost.toFixed(2)}`;
}

