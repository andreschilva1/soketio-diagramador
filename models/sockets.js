const axios = require('axios');
class Sockets {

    users;

    constructor(io) {
        this.users = [];
        this.io = io;
        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on('connection', (socket) => {  // socket = cliente que se conecto
            console.log('cliente conectado', socket.id);

            socket.on('join-room', (room, data_user) => {

                data_user.push(socket.id)

                if (!existUser(this.users, data_user)) {
                    this.users.push(data_user);
                    console.log("se inserto uno nuevo");
                } else {
                    var index = indexOf(this.users, data_user[1], 1);
                    //console.log(index);
                    this.users.splice(index, 1)
                    this.users.push(data_user);
                }

                socket.join(room);
                console.log(this.users);

                //Actualiza usuarios
                this.io.to(room).emit('new-connection', this.users);

                //Indica que hay un nuevo usuario conectado
                this.io.to(room).emit('new-connection-user', data_user);
            });

            // Movimientos en el paper
            socket.on('diagram', (prueba, room) => {
                console.log(prueba);
                this.io.to(room).emit('return-diagram', prueba);
            });


            socket.on("disconnecting", () => {
                //console.log(socket.id);
                var index = indexOf(this.users, socket.id, 3)
                console.log(index);
                if (index != -1) {

                    var room = this.users[index][2]
                    this.io.to(room).emit('new-desconnection-user', this.users[index][0]);
                    //console.log("Se salio el usuario: ", this.users[index][0])
                    this.users.splice(index, 1)

                    if (!existRoom(this.users, room)) {
                        //axios.post('http://3.87.74.141/api/updateDiagram', {
                            
                        axios.post('http://localhost:8000/api/updateDiagram', {
                            "diagram_id": room,
                        }).then((response) => {
                            console.log(response.data);
                        }).catch((error) => {
                            console.log(error);
                        })
                    }


                    // Avisar a toda la sala que alguien se salio
                    this.io.to(room).emit('new-connection', this.users);
                }
            });
        });

    }

}

function existUser(users, user) {
    for (var i = 0; i < users.length; i++) {
        if (users[i][1] == user[1]) return true
    }

    return false
}

function existRoom(users, room) {
    for (var i = 0; i < users.length; i++) {
        if (users[i][2] == room) return true
    }

    return false
}

function indexOf(users, element, index) {
    for (var i = 0; i < users.length; i++) {
        if (users[i][index] == element) return i;
    }

    return -1;
}

module.exports = Sockets;