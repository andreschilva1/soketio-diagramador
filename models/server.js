//Servidor Express
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const cors = require('cors');

const Sockets = require('./sockets');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        
        //Http server
        this.server = http.createServer(this.app);

        // Configuraciones  de sockets
        this.io = socketio(this.server, {/* Configuraciones*/ });
    }

    middlewares() {
        //desplegar el directorio publico
        this.app.use(express.static(path.resolve(__dirname, '../public')));
        //CORS
        this.app.use( cors() );
    }

    configurarSockets(){
        new Sockets( this.io );
    }

    execute() {
        //inicializar middlewares
        this.middlewares();
        //inicializar sockets
        this.configurarSockets();
        //inicilaizar server
        this.server.listen(this.port, () => {
            console.log('Server corriendo en puerto:', this.port);
        });
    }
}

module.exports = Server;