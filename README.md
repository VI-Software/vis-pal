# VIS Pal - el asistente de inteligencia artificial definitivo para los usuarios de VI Software!

VIS Pal is an AI assistant developed by VI Software for April 1st of 2025. Its purpose is to joke about and critique the current trend of integrating AI into every aspect of life.

## Features

- **Chat Interface**: Interact with the assistant through a chat interface.
- **Authentication**: Secure the chat with a password.
- **Persistent Chat History**: Save and load chat history using local storage.
- **API Integration**: Communicate with the OpenRouter API for AI responses.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/VI-Software/vis-pal.git
    cd vis-pal
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a .env file based on .env.example:
    ```sh
    cp .env.example .env
    ```

4. Update the .env file with your configuration:
    ```env
    PORT=3000
    OPENROUTER_API_KEY=your_openrouter_api_key
    AUTH_PASSWORD=your_secure_password
    ```

## Usage

### Development

To start the development server with hot reloading:
```sh
npm run dev
```

### Production

To start the server in production mode:
```sh
npm run start
```

## Project Structure

- public: Contains the frontend files (HTML, CSS, JS).
- utils: Contains utility functions.
- server.js: Main server file.
- .env: Environment variables.
- package.json: Project metadata and dependencies.

## Environment Variables

- `PORT`: The port on which  serverthe will run.
- `OPENROUTER_API_KEY`: API key for OpenRouter.
- `AUTH_PASSWORD`: Password for authenticating chat requests.

## SHOWCASE

![](./msrc/img/showcase1.png)
![](./msrc/img/showcase2.png)
![](./msrc/img/showcase3.png)

## License

This project is licensed under the [MIT License](./LICENSE).
