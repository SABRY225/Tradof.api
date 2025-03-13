const express = require('express');
const connectDB = require('./config/db');
const startGrpcServer = require('./grpcServer');

require('dotenv').config();
// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});
app.use('/api/chat',require('./routes/chatRoute'));
// app.use('/api/feedback',require('./routes/chatRoute'));
// app.use('/api/ask-question/',require('./routes/chatRoute'));
const PORT = 3005;
app.listen(PORT, () => {
  console.log(`REST API running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

// Start gRPC server
startGrpcServer();
