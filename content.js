// content.js
// Author:
// Author URI: https://
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the webpage level activities (e.g. manipulating page data, etc.)
// License: MIT
// Constants for element IDs
// Constants
const AI_HELPER_BUTTON_ID = "ai-helper-button";
const CHAT_CONTAINER_ID = "chat-container";
const codingDescContainerClass = "py-4 px-3 coding_desc_container__gdB9M";

const GEMINI_API_KEY = 'AIzaSyBxMQyik-7Z_e7TpupMUpi1y5W0Xy9xMGI';

// Function to extract problem ID from URL
function getCurrentProblemId() {
  const urlParams = new URLSearchParams(window.location.search);
  const pathMatch = window.location.pathname.match(/\/problems\/[^\/]+-(\d+)/);
  return pathMatch ? pathMatch[1] : null;
}

// Function to get code editor data from localStorage
function getCodeEditorData() {
  const problemId = getCurrentProblemId();
  if (!problemId) return null;
  
  const key = `course_8991_${problemId}_C++14`;
  const editorData = localStorage.getItem(key);
  return editorData;
}

function getSavedMessages() {
  try {
      const key = 'ai_chat_' + window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_');
      return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
      return [];
  }
}

function saveMessage(userMessage, aiResponse) {
  try {
      const key = 'ai_chat_' + window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_');
      const messages = getSavedMessages();
      messages.push(
          { type: 'user', text: userMessage },
          { type: 'ai', text: aiResponse }
      );
      localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
      console.error('Error saving messages:', error);
  }
}

// Track last visited page
let lastPageVisited = "";

// Initialize observer when page loads
window.addEventListener("load", function() {
  const observer = new MutationObserver(() => {
    handleContentChange();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  handleContentChange();
});

function handleContentChange() {
  if(isPageChange()) handlePageChange();
}

function isPageChange() {
  const currentPage = window.location.pathname;
  if(currentPage === lastPageVisited) return false;
  lastPageVisited = currentPage;
  return true;
}

function handlePageChange() {
  if(onTargetPage()) {
    cleanUpPage();
    addInjectScript();
    addAIHelpButton();
  }
}

function onTargetPage() {
  return window.location.pathname.startsWith('/problems/');
}

function cleanUpPage() {
  const existingButton = document.getElementById(AI_HELPER_BUTTON_ID);
  if(existingButton) existingButton.remove();
  
  const existingChatContainer = document.getElementById(CHAT_CONTAINER_ID);
  if(existingChatContainer) existingChatContainer.remove();
}

function addInjectScript() {
  // Add any required script injection logic here
  console.log("Script injection ready");
}

function addAIHelpButton() {
  const codingDescContainer = document.getElementsByClassName(codingDescContainerClass)[0];
  if (!codingDescContainer) {
    console.warn("Coding description container not found");
    return;
  }

  const button = document.createElement("button");
  button.id = AI_HELPER_BUTTON_ID;
  button.innerText = "AI Help";
  
  // Style the button
  button.style.padding = "10px 20px";
  button.style.backgroundColor = "#007BFF";
  button.style.color = "#FFFFFF";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.marginTop = "10px";
  button.style.fontSize = "16px";
  button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  
  button.addEventListener("click", function() {
    createChatWindow();
    button.remove();
  });
  
  codingDescContainer.appendChild(button);
}

function createChatWindow() {
  const codingDescContainer = document.getElementsByClassName(codingDescContainerClass)[0];
  if (!codingDescContainer) {
    console.warn("Coding description container not found");
    return;
  }

  // Create main chat container
  const chatContainer = document.createElement("div");
  chatContainer.id = CHAT_CONTAINER_ID;

  // Style the container
  chatContainer.style.position = "relative";
  chatContainer.style.width = "300px";
  chatContainer.style.height = "400px";
  chatContainer.style.backgroundColor = "#FFFFFF";
  chatContainer.style.border = "1px solid #ccc";
  chatContainer.style.borderRadius = "5px";
  chatContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  chatContainer.style.margin = "20px 0";
  chatContainer.style.padding = "15px";
  chatContainer.style.display = "flex";
  chatContainer.style.flexDirection = "column";
  
  // Create chat messages area
  const messagesArea = document.createElement("div");
  messagesArea.style.flex = "1";
  messagesArea.style.overflowY = "auto";
  messagesArea.style.marginBottom = "10px";
  chatContainer.appendChild(messagesArea);

      // Load saved messages
      const savedMessages = getSavedMessages();
      savedMessages.forEach(msg => {
          const messageDiv = document.createElement("div");
          messageDiv.style.marginBottom = "10px";
          messageDiv.style.padding = "8px";
          messageDiv.style.backgroundColor = msg.type === 'user' ? "#f0f0f0" : "#e3f2fd";
          messageDiv.style.borderRadius = "4px";
          messageDiv.textContent = msg.text;
          messagesArea.appendChild(messageDiv);
      });
  
  // Create input container
  const inputContainer = document.createElement("div");
  inputContainer.style.display = "flex";
  inputContainer.style.gap = "10px";

  // Create input field
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type your message...";
  input.style.flex = "1";
  input.style.padding = "8px";
  input.style.border = "1px solid #ccc";
  input.style.borderRadius = "4px";
  input.style.fontSize = "14px";

  // Create send button
  const sendButton = document.createElement("button");
  sendButton.innerText = "Send";
  sendButton.style.padding = "8px 16px";
  sendButton.style.backgroundColor = "#007BFF";
  sendButton.style.color = "#FFFFFF";
  sendButton.style.border = "none";
  sendButton.style.borderRadius = "4px";
  sendButton.style.cursor = "pointer";
  
  // Add event listeners
  sendButton.addEventListener("click", handleSendMessage);
  input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  });

 /* function handleSendMessage() {
    if (input.value.trim()) {
      const message = document.createElement("div");
      message.style.marginBottom = "10px";
      message.style.padding = "8px";
      message.style.backgroundColor = "#f0f0f0";
      message.style.borderRadius = "4px";
      message.textContent = input.value;
      messagesArea.appendChild(message);
      messagesArea.scrollTop = messagesArea.scrollHeight;
      input.value = "";
    }
  }*/
    async function handleSendMessage() {
      if (input.value.trim()) {
          // Show user message first
          const messageDiv = document.createElement("div");
          messageDiv.style.marginBottom = "10px";
          messageDiv.style.padding = "8px";
          messageDiv.style.backgroundColor = "#f0f0f0";
          messageDiv.style.borderRadius = "4px";
          messageDiv.textContent = input.value;
          messagesArea.appendChild(messageDiv);
  
          // Store message and clear input
          const userMessage = input.value;
          input.value = "";
  
          // Show loading message
          const loadingDiv = document.createElement("div");
          loadingDiv.textContent = "Loading...";
          loadingDiv.style.marginBottom = "10px";
          loadingDiv.style.padding = "8px";
          loadingDiv.style.fontStyle = "italic";
          messagesArea.appendChild(loadingDiv);
  
       /*   try {
              // Make API call
              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      contents: [{
                          parts: [{
                              text: userMessage
                          }]
                      }]
                  })
              });
  */         
            
        try {
          // Get code editor data
          const codeEditorData = getCodeEditorData();
          
          // Prepare context-enhanced prompt
          const enhancedPrompt = `
User Question: ${userMessage}

Current Code in Editor:
${codeEditorData || 'No code found in editor'}
`;

          // Make API call with enhanced context
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  contents: [{
                      parts: [{
                          text: enhancedPrompt
                      }]
                  }]
              })
          });

              const data = await response.json();
              const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
  
              // Remove loading message
              loadingDiv.remove();
  
              // Show AI response
              const aiMessageDiv = document.createElement("div");
              aiMessageDiv.style.marginBottom = "10px";
              aiMessageDiv.style.padding = "8px";
              aiMessageDiv.style.backgroundColor = "#e3f2fd";
              aiMessageDiv.style.borderRadius = "4px";
              aiMessageDiv.textContent = aiResponse;
              messagesArea.appendChild(aiMessageDiv);
  
              //save message
              saveMessage(userMessage, aiResponse);
              
          } catch (error) {
              // Remove loading message
              loadingDiv.remove();
  
              // Show error message
              const errorDiv = document.createElement("div");
              errorDiv.style.marginBottom = "10px";
              errorDiv.style.padding = "8px";
              errorDiv.style.backgroundColor = "#ffebee";
              errorDiv.style.color = "#c62828";
              errorDiv.style.borderRadius = "4px";
              errorDiv.textContent = "Sorry, there was an error processing your request.";
              messagesArea.appendChild(errorDiv);
          }
  
          // Scroll to bottom
          messagesArea.scrollTop = messagesArea.scrollHeight;
      }
  }
  

  // Assemble the chat window
  inputContainer.appendChild(input);
  inputContainer.appendChild(sendButton);
  chatContainer.appendChild(inputContainer);
  
  // Add close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "×";
  closeButton.style.position = "absolute";
  closeButton.style.right = "5px";
  closeButton.style.top = "5px";
  closeButton.style.backgroundColor = "transparent";
  closeButton.style.border = "none";
  closeButton.style.fontSize = "20px";
  closeButton.style.cursor = "pointer";
  closeButton.style.color = "#666";
  
  closeButton.addEventListener("click", function() {
    chatContainer.remove();
    addAIHelpButton();
  });
  
  chatContainer.appendChild(closeButton);
  
  // Add to page
  codingDescContainer.appendChild(chatContainer);
}