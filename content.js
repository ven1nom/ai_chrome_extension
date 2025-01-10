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


// Access the API key
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
  // console.log("problemIdEditorWindow", problemId);
  if (!problemId) return null;
  
  const key = `course_8991_${problemId}_C++14`;
  const editorData = localStorage.getItem(key);
  return editorData;
}
//console.log(getCodeEditorData())

//Function to extract problem description from DOM
/*function getProblemContext() {
  try {
      // Find the main container
      const container = document.getElementsByClassName(codingDescContainerClass)[0];
      //console.log(container)
      if (!container) return null;

      // Get the w-100 container that holds the problem content
      const contentContainer = container.querySelector('.w-100:nth-child(2)');
      //console.log(contentContainer)
      if (!contentContainer) return null;

      let problemContext = {
          description: '',
          inputFormat: '',
          outputFormat: '',
          constraints: '',
          sampleInput: '',
          sampleOutput: '',
          notes: ''
      };

      // Function to extract text content from a section
      const extractSectionContent = (sectionElement) => {
          if (!sectionElement) return '';
          // Get all text nodes, excluding button elements
          const textContent = Array.from(sectionElement.querySelectorAll('*'))
              .filter(el => !el.matches('button'))
              .map(el => el.textContent.trim())
              .filter(text => text)
              .join('\n');
          return textContent;
      };

      // Helper function to find section by heading text
      const findSectionByHeading = (headingText) => {
         
        const headings = contentContainer.querySelectorAll('h5.fw-bolder.problem_heading');
        for (const heading of headings) {
          if (heading.textContent.trim() === headingText) {
             return heading;
          }

      };

      // Extract Description
      const descriptionSection = findSectionByHeading('Description');
      console.log(descriptionSection)
      if (descriptionSection) {
          problemContext.description = extractSectionContent(descriptionSection);
      }

      // Extract Input Format
      const inputFormatSection = findSectionByHeading('Input Format');
      console.log(inputFormatSection)
      if (inputFormatSection) {
          problemContext.inputFormat = extractSectionContent(inputFormatSection);
      }

      // Extract Output Format
      const outputFormatSection = findSectionByHeading('Output Format');
      if (outputFormatSection) {
          problemContext.outputFormat = extractSectionContent(outputFormatSection);
      }

      // Extract Constraints
      const constraintsSection = findSectionByHeading('Constraints');
      if (constraintsSection) {
          problemContext.constraints = extractSectionContent(constraintsSection);
      }

      // Extract Sample Input/Output
      const sampleInputElements = Array.from(contentContainer.querySelectorAll('div[class*="_C13VJ"]'))
          .filter(el => el.textContent.includes('Sample Input'));
      
      if (sampleInputElements.length > 0) {
          const inputContainer = sampleInputElements[0].nextElementSibling?.querySelector('[class*="coding_input_format"]');
          if (inputContainer) {
              problemContext.sampleInput = inputContainer.textContent.trim();
          }
      }

      // Extract Notes/Explanations
      const notesSection = findSectionByHeading('Note');
      if (notesSection) {
          problemContext.notes = extractSectionContent(notesSection);
      }

      return problemContext;
  } 
} catch (error) {
      console.error('Error extracting problem context:', error);
      return null;
  }
}
*/
const extractContentUsingXPath = (headingText) => {
  try {
      const xpath = `//h5[contains(@class, 'problem_heading') and normalize-space(text())='${headingText}']/following-sibling::div[1]//div[contains(@class, 'markdown-renderer')]//p`;
      
      const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
      );

      let textContent = '';
      for (let i = 0; i < result.snapshotLength; i++) {
          const node = result.snapshotItem(i);
          if (node) {
              const nodeText = node.textContent.trim();
              textContent += (textContent ? '\n' : '') + nodeText;
          }
      }

      return textContent;
  } catch (error) {
      console.error(`Error extracting ${headingText} content:`, error);
      return '';
  }
};

// Get problem context from DOM
const getProblemContext = () => {
  return {
      description: extractContentUsingXPath('Description'),
      inputFormat: extractContentUsingXPath('Input Format'),
      outputFormat: extractContentUsingXPath('Output Format'),
      constraints: extractContentUsingXPath('Constraints'),
      sampleInput: extractContentUsingXPath('Sample Input'),
      sampleOutput: extractContentUsingXPath('Sample Output'),
      notes: extractContentUsingXPath('Notes'),
  };
};

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
//---------------------------------Network Req Intercept -------------------------------------//
//inject script on every page load
addInjectScript();

//store problem data
const problemDataMap = new Map();
//track last visited page

let lastPageVisited = "";
//listen for xhrDataFetched event
window.addEventListener("xhrDataFetched", (event) => {
    const data = event.detail;
    console.log('XHR Event Received:', {
      fullEvent: event,
      eventDetail: data
  });
    if (data.url && data.url.match(/https:\/\/api2\.maang\.in\/problems\/user\/\d+/)) {
        const idMatch = data.url.match(/\/(\d+)$/);
        if (idMatch) {
            const id = idMatch[1];
            problemDataMap.set(id, data.response); // Store response data by ID
          //  console.log(`Stored data for problem ID ${id}:`, data.response);
          debugStoredData();
          console.log('=== Intercepted Problem Data ===');
          console.log('Problem ID:', id);
          console.log('Full Response:', data.response);
          console.log('Response Structure:', {
              keys: Object.keys(data.response),
              dataTypes: Object.entries(data.response).map(([key, value]) => ({
                  key,
                  type: typeof value,
                  isNull: value === null,
                  isUndefined: value === undefined
              }))
          });
          console.log('Current Map Size:', problemDataMap.size);
          console.log('=== End Intercepted Data ===\n');
        }
    }
});
 function debugStoredData() {
  console.log('=== Current Stored Data ===');
  console.log('Map Size:', problemDataMap.size);
  console.log('All Stored Problems:');
  problemDataMap.forEach((value, key) => {
      console.log(`Problem ID ${key}:`, value);
  });
  console.log('=== End Stored Data ===\n');
}

//inject script on every page load
/*function addInjectScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  script.onload = () => {
    console.log("Inject script loaded successfully");
    script.remove();
  }
  document.documentElement.appendChild(script);
}*/

//------------------------------------Network Call Intercept--------------------------------//
// Initialize observer when page loads

  const observer = new MutationObserver(() => {
    handleContentChange();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  handleContentChange();


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
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  script.onload = () => {
    console.log("Injection successful");
    // Verify interception is working
    window.addEventListener("xhrDataFetched", (event) => {
      console.log("XHR intercepted:", event.detail);
    }, false);
    script.remove();
  };
  script.onerror = (error) => console.error("Injection failed:", error);
  document.documentElement.appendChild(script);
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

    //verification use
    // Add this function to verify data access
function verifyDataAccess() {
  // Get problem context
  const problemContext = getProblemContext();
  
  // Get code editor data
  const codeEditorData = getCodeEditorData();
  
  // Get "Hints" section data via intercepting network request
  const currentProblemId = getCurrentProblemId();
  const interceptedData = problemDataMap.get(currentProblemId);

  // Create verification object
  const verification = {
      description: {
          exists: Boolean(problemContext.description),
          content: problemContext.description,
          length: problemContext.description?.length || 0
      },
      inputFormat: {
          exists: Boolean(problemContext.inputFormat),
          content: problemContext.inputFormat,
          length: problemContext.inputFormat?.length || 0
      },
      outputFormat: {
          exists: Boolean(problemContext.outputFormat),
          content: problemContext.outputFormat,
          length: problemContext.outputFormat?.length || 0
      },
      constraints: {
          exists: Boolean(problemContext.constraints),
          content: problemContext.constraints,
          length: problemContext.constraints?.length || 0
      },
      sampleInput: {
          exists: Boolean(problemContext.sampleInput),
          content: problemContext.sampleInput,
          length: problemContext.sampleInput?.length || 0
      },
      sampleOutput: {
          exists: Boolean(problemContext.sampleOutput),
          content: problemContext.sampleOutput,
          length: problemContext.sampleOutput?.length || 0
      },
      notes: {
          exists: Boolean(problemContext.notes),
          content: problemContext.notes,
          length: problemContext.notes?.length || 0
      },
      codeEditor: {
          exists: Boolean(codeEditorData),
          content: codeEditorData,
          length: codeEditorData?.length || 0
      },
      interceptedData: {
        exists: Boolean(interceptedData),
        content: interceptedData,
        length: interceptedData ? Object.keys(interceptedData).length : 0
    }
  };

  // Log detailed verification results
  console.log('Data Access Verification Results:', verification);
  
  // Return summary of what's accessible
  return {
      accessibleFields: Object.entries(verification)
          .map(([field, data]) => ({
              field,
              accessible: data.exists,
              hasContent: Boolean(data.length)
          }))
  };
}
    async function handleSendMessage() {
      if (input.value.trim()) {

         //verification logging
         console.log('=== Data Access Verification ===');
         const accessCheck = verifyDataAccess();
         console.log('Verification Summary:', accessCheck);

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
          // Get code editor data & DOM Data
          const codeEditorData = getCodeEditorData();
          const problemContext = getProblemContext();
          const currentProblemId = getCurrentProblemId();
        const interceptedData = problemDataMap.get(currentProblemId);


          // Prepare context-enhanced prompt
          const enhancedPrompt = `
          Problem Context:
          ${problemContext.description}
          
          Input Format:
          ${problemContext.inputFormat}
          
          Output Format:
          ${problemContext.outputFormat}
          
          Constraints:
          ${problemContext.constraints}
          
          Sample Input:
          ${problemContext.sampleInput}
          
          Sample Output:
          ${problemContext.sampleOutput}
          
          Notes/Explanations:
          ${problemContext.notes}
          
          Current Code in Editor:
          ${codeEditorData || 'No code found in editor'}
          
          Intercepted Data: 
          ${interceptedData ? JSON.stringify(interceptedData) : 'No intercepted data available'}
         
          User Question:
          ${userMessage}
          
          Please provide assistance based on this specific problem context.
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
  
            
              chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                if (request.action === 'getEnhancedContext') {
                    (async () => {
                        const response = await prepareAndSendData(request.userMessage, request.apiKey);
                        sendResponse({ response });
                    })();
                    return true; // Keep the message channel open for async response
                }
            });
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