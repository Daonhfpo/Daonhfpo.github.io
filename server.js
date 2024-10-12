const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

wss.on('connection', (ws) => {
    // Add new client
    clients.push(ws);
    console.log('New client connected. Total clients: ' + clients.length);

    // Broadcast to all clients when a new user connects
    const welcomeMessage = JSON.stringify({ message: 'A new user has joined!', total: clients.length });
    clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(welcomeMessage);
        }
    });

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.message) {
            // Broadcast the chat message to all clients
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ message: data.message }));
                }
            });
        } else if (data.id) {
            // Broadcast player updates to all clients
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data)); // Send position and rotation updates
                }
            });
        }
    });
    

    ws.on('close', () => {
        // Remove client on disconnect
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected. Total clients: ' + clients.length);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
