// popup.js
document.getElementById('submitQuestion').addEventListener('click', async () => {
    const userMessage = document.getElementById('userQuestion').value;
    const apiKey = 'YOUR_GEMINI_API_KEY'; // Store this securely

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                action: "getEnhancedContext",
                userMessage,
                apiKey
            },
            function(response) {
                if (response && response.response) {
                    document.getElementById('result').textContent = response.response;
                }
            }
        );
    });
});