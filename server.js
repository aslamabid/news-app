import express from "express";
import socket from "socket.io";
import dbConnection from "./database";
import errorHandler from "./middlewares/errorHandler";
import axios from 'axios';
import { userRoute, userTransactionRoute } from "./routes";

const app = express();

app.use(express.json());

dbConnection();

app.use('/api', userRoute);
app.use('/api', userTransactionRoute);

app.use(errorHandler);

const server = app.listen(5009, () => {
  console.log("Server running on port", 5009);
});

const io = socket(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("signup", async (userData) => {
    
    try {
      const {data} = await axios.post('http://localhost:5009/api/signup', userData);
      socket.emit('result', { ...data })
    } catch (error) {
      socket.emit('error', { error: error.message ? error.message : 'Internal Server Error' })
    }

  });

  socket.on("login", async (loginCredentials) => {
    try {
      // console.log(loginCredentials);
      const {data} = await axios.post('http://localhost:5009/api/login', loginCredentials);
      socket.emit('result', { ...data })
    } catch (error) {
      socket.emit('error', error.response || error.message || 'Internal Server Error')
    }
  })

  socket.on("add-transaction", async (transactionData) => {
    try {
      // console.log(loginCredentials);
      const {data} = await axios.post('http://localhost:5009/api/create/transaction', transactionData);
      socket.emit('result', { ...data })
    } catch (error) {
      socket.emit('error', error.response || error.message || 'Internal Server Error')
    }
  })

});


// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});