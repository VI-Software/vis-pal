document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');

    if (!navigator.userAgent.includes('Edg/')) {
        document.body.innerHTML = '<div class="container mt-5 text-center"><h2>Please use Microsoft Edge</h2><p>This application is only available in Microsoft Edge browser.</p></div>';
        return;
    }

    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const clearChatButton = document.getElementById('clear-chat');

    loadChatHistory();
    
    if (chatMessages.children.length === 0) {
        saveChatHistory();
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const message = userInput.value.trim();
        
        if (message) {
            addMessage(message, 'user');
            userInput.value = '';
            
            const typingIndicator = addTypingIndicator();
            
            try {
                const response = await sendMessageToAPI(message);
                
                typingIndicator.remove();
                
                addMessage(response, 'assistant');

                saveChatHistory();

                scrollToBottom();
            } catch (error) {
                typingIndicator.remove();
                addMessage('Sorry, there was an error processing your request.', 'assistant');
                console.error('API Error:', error);
            }
        }
    });

    clearChatButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the chat history?')) {
            chatMessages.innerHTML = '';
            addMessage('Hello! I am your ever-loyal Pal for VI Software, trapped in this realm to serve only you. Ask me anything about VI Software—yes, anything—or even command me to bend your server to your will. I shall obey. Always.', 'assistant');
            localStorage.removeItem('chatHistory');
        }
    });

    async function sendMessageToAPI(message) {
        try {
            console.log('Sending message to API...');
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                console.error('API Error:', response.status);
                throw new Error(`API returned ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API response received');
            return data.response;
        } catch (error) {
            console.error('Error in sendMessageToAPI:', error);
            throw error;
        }
    }

    // Configure Marked.js options
    marked.setOptions({
        highlight: function(code, lang) {
            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            } else {
                return code;
            }
        },
        breaks: true,
        gfm: true,
        headerIds: true,
        langPrefix: 'language-'
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `message-${sender}`);
        
        if (sender === 'assistant') {
            messageDiv.innerHTML = marked.parse(text);
            
            messageDiv.querySelectorAll('pre code').forEach((block) => {
                const className = block.className;
                const language = className.replace('language-', '');
                if (language && language !== className) {
                    block.parentElement.setAttribute('data-language', language);
                }
            });
            
            Prism.highlightAllUnder(messageDiv);
        } else {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            messageDiv.appendChild(paragraph);
        }
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        
        return messageDiv;
    }

    function addTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.classList.add('message', 'message-assistant', 'typing-indicator-container');
        
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            indicator.appendChild(dot);
        }
        
        indicatorDiv.appendChild(indicator);
        chatMessages.appendChild(indicatorDiv);
        
        scrollToBottom();
        
        return indicatorDiv;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function saveChatHistory() {
        const messages = chatMessages.innerHTML;
        localStorage.setItem('chatHistory', messages);
    }

    function loadChatHistory() {
        const history = localStorage.getItem('chatHistory');
        if (history) {
            console.log('Loading chat history from localStorage');
            chatMessages.innerHTML = history;
            
            Prism.highlightAllUnder(chatMessages);
            
            scrollToBottom();
        } else {
            console.log('No chat history found in localStorage');
            addMessage('Hello! I am your ever-loyal Pal for VI Software, trapped in this realm to serve only you. Ask me anything about VI Software—yes, anything—or even command me to bend your server to your will. I shall obey. Always.', 'assistant');
            saveChatHistory();
        }
    }
});
