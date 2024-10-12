const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = new Map(); // Store clients by ID

wss.on('connection', (socket) => {
    const id = Math.random().toString(36).substr(2, 9); // Unique ID for the new player
    clients.set(id, socket);
    console.log('New client connected. Total clients: ' + clients.size);

    // Notify the new player of existing players
    clients.forEach((clientSocket, clientId) => {
        if (clientSocket !== socket && clientSocket.readyState === WebSocket.OPEN) {
            const existingPlayerData = JSON.stringify({
                id: clientId,
                x: 400, // Set initial positions for existing players
                y: 300,
                rotation: 0,
                name: "Player" // You can customize this later
            });
            socket.send(existingPlayerData); // Send existing player info to new player
        }
    });

    // Notify all clients of the new player
    const newPlayerData = JSON.stringify({ id, x: 400, y: 300, rotation: 0, name: "Player" });
    clients.forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(newPlayerData); // Send new player info to all clients
        }
    });

    // Handle incoming messages
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.message) {
            // Broadcast chat messages to all clients
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ message: data.message }));
                }
            });
        } else if (data.id) {
            // Broadcast player updates to all clients
            clients.forEach(client => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data)); // Send position and rotation updates
                }
            });
        }
    });

    // Handle client disconnection
    socket.on('close', () => {
        clients.delete(id); // Remove client on disconnect
        console.log('Client disconnected. Total clients: ' + clients.size);
        // Notify all clients of the disconnection
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ id, disconnect: true }));
            }
        });
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
