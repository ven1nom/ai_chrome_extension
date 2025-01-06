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

  function handleSendMessage() {
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