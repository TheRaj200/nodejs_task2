const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const userModel = require('./modules/user');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/live', async (req, res) => {
    try {
        const users = await userModel.find();
        res.render('live', { users: users, user: null });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/userDetails/:id', async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        const users = await userModel.find(); // Fetch the users again to display the list as well
        res.render('live', { user: user, users: users });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/create', async (req, res) => {
    try {
        const { firstname, lastname, email, number, City, LogIN, Country, street } = req.body;
        const createdUser = await userModel.create({ firstname, lastname, email, number, City, LogIN, Country, street });
        io.emit('userCreated', createdUser);
        res.redirect('/live');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
 