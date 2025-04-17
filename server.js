const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
    res.status(200).render("key");
});

app.get('/app', (req, res) => {
    let key = req.query.key?.trim();

    if (!key) {
        return res.status(400).render("key", { msg: "Please Enter a key" });
    }

    return res.status(200).render("content", { key });
});

const roomData = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", (key) => {
        socket.join(key);
        console.log(`User ${socket.id} joined room: ${key}`);

        if (roomData[key]) {
            socket.emit("server-message", roomData[key]);
        }
    });

    socket.on('message', (message, key) => {

        roomData[key] = message;

        socket.to(key).emit('server-message', message);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
