# Bifrost - Distributed Chat Application

Bifrost is a distributed chat application allowing real-time communication between users. It uses WebSocket for real-time messaging and Redis for message queuing.

### Prerequisites

Before you begin, ensure you have the following installed:

* Node.js (version 16 or above)
* Docker
* Docker Compose

## Installation

1. **Clone the repository**
`git clone https://github.com/yourusername/bifrost.git
cd bifrost`
2. **Install the dependencies**
`npm install`

## Configuration
Create a `.env` file in the root directory with the following content (update values as needed):
`DB_URI=
SECRET=
REDIS_URL=

## Running the project
To run the project in development mode with live reloading:

1. **Start the development environment:**
`docker-compose up`
2. **Access the application:** 
* App Instance 1: `http://localhost:3001`
* App Instance 2: `http://localhost:3002`
* App Instance 3: `http://localhost:3003`