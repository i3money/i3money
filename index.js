// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Conéctate a MongoDB
mongoose.connect('mongodb://localhost:27017/mi-proyecto', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conectado a MongoDB');
});

// Define el esquema del usuario
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    saldo: { type: Number, default: 0 },
    historial: { type: Array, default: [] }
});

const User = mongoose.model('User', userSchema);

// Ruta para registrar un nuevo usuario
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const newUser = new User({ username, password });

    newUser.save((err) => {
        if (err) {
            return res.status(500).send('Error al registrar usuario');
        }
        res.status(200).send('Usuario registrado exitosamente');
    });
});

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    User.findOne({ username, password }, (err, user) => {
        if (err || !user) {
            return res.status(401).send('Nombre de usuario o contraseña incorrectos');
        }
        res.status(200).send({ message: 'Inicio de sesión exitoso', saldo: user.saldo });
    });
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
