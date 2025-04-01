require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { server: debug, error: debugError } = require('./utils/debug');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// logging
app.use((req, res, next) => {
    debug(`${req.method} ${req.url}`);
    next();
});

// microsoft ai edge only
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const isEdge = userAgent.includes('Edg/');
    
    if (req.path.startsWith('/api/') || req.path.startsWith('/public/')) {
        next();
    } else if (!isEdge) {
        res.status(403).sendFile(path.join(__dirname, 'public', 'browser-error.html'));
    } else {
        next();
    }
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use('/public', express.static(path.join(__dirname, 'public')));


app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        debug('Chat request received:', message);
        
        // Skip API call for authentication test messages
        if (message === 'test_auth' || message === 'verify_auth') {
            return res.json({ response: 'Authentication successful' });
        }
        
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.AI_MODEL || 'deepseek/deepseek-r1:free';
        
        if (!apiKey) {
            throw new Error('OpenRouter API key is not configured');
        }
        
        const openRouterResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI assistant dedicated to supporting VI Software, including the open-source launcher, API documentation, user panels, and server management tools. Format responses using markdown with **bold** for emphasis, *italics* for technical terms, headers (`#`, `##`, `###`) for structure, and triple backtick code blocks with language tags for code examples (e.g., ```javascript, ```java). You strictly adhere to ethical and legal standards, only addressing requests related to VI Software. Resources: [visoftware.dev](https://visoftware.dev), Auth Server: [authserver.visoftware.dev](https://authserver.visoftware.dev), API: [api.visoftware.dev](https://api.visoftware.dev), Launcher GitHub: [github.com/vi-software/vis-launcher](https://github.com/vi-software/vis-launcher).'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        
        const aiResponse = openRouterResponse.data.choices[0].message.content;
        debug('AI response received');
        
        res.json({ response: aiResponse });
    } catch (error) {
        debugError('API Error:', error);
        let errorMessage = 'An error occurred while processing your request.';
        
        if (error.response) {
            debugError('OpenRouter API error:', error.response.data);
            errorMessage = `API Error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`;
        } else if (error.request) {
            debugError('No response from OpenRouter API');
            errorMessage = 'No response received from AI service. Please check your internet connection.';
        } else if (error.message && error.message.includes('API key')) {
            errorMessage = 'AI service is not properly configured. Please contact the administrator.';
        }
        
        res.status(500).json({ error: errorMessage });
    }
});

app.get('*', (req, res) => {
    debug('Serving main application');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    debugError('Error occurred:', err);
    debugError('Stack:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

app.listen(PORT, () => {
    debug(`Server running on port ${PORT}`);
    debug(`Debug mode: ${process.env.DEBUG || 'not set'}`);
    console.log(`Server is running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
    debugError('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    debugError('Unhandled Rejection at:', promise, 'reason:', reason);
});
