const Chat = require('./Models/Chat');

module.exports = (io) => {

    let users = {};

    const colors = [
        '#e74c3c', '#3498db', '#2ecc71', '#9b59b6',
        '#f1c40f', '#e67e22', '#1abc9c', '#34495e'
    ];

    io.on('connection', async (socket) => {
        console.log("Nuevo Usuario Conectado");

        // 🔥 CARGAR MENSAJES GUARDADOS
        let messages = await Chat.find({}).limit(8).sort({ created_at: -1 });
        socket.emit('cargando varios mensajes', messages.reverse());

        // ===== NUEVO USUARIO =====
        socket.on('new user', (data, cb) => {

            const nickname = data.trim();

            // 🔴 VALIDACIÓN (NO PERMITE ESPACIOS)
            if (nickname === '') {
                return cb(false);
            }

            if (nickname in users) {
                cb(false);
            } else {
                cb(true);

                socket.nickname = nickname;
                socket.color = colors[Math.floor(Math.random() * colors.length)];

                users[socket.nickname] = socket;

                io.sockets.emit('user joined', {
                    nick: socket.nickname
                });

                updateNicknames();
            }
        });

        // ===== ENVIAR MENSAJE =====
        socket.on('Enviar mensaje', async (data, cb) => {
            let msg = data.trim();

            if (msg === '') {
                cb('Error: escribe un mensaje');
                return;
            }

            // 🔥 GUARDAR EN BD
            await Chat.create({
                nombreUsuario: socket.nickname,
                mensaje: msg
            });

            // ===== PRIVADO =====
            if (msg.substr(0, 3) === '/w ') {

                msg = msg.substr(3);
                const index = msg.indexOf(' ');

                if (index !== -1) {

                    let name = msg.substring(0, index);
                    let mensaje = msg.substring(index + 1);

                    if (name in users) {

                        users[name].emit('whisper', {
                            msg: mensaje,
                            nick: socket.nickname,
                            color: socket.color
                        });

                        socket.emit('whisper', {
                            msg: mensaje,
                            nick: socket.nickname,
                            color: socket.color
                        });

                    } else {
                        cb('Error: usuario no existe');
                    }

                } else {
                    cb('Error: usa /w usuario mensaje');
                }

            } else {
                io.sockets.emit('Nuevo mensaje', {
                    msg: msg,
                    nick: socket.nickname,
                    color: socket.color
                });
            }
        });

        // ===== DESCONECTAR =====
        socket.on('disconnect', () => {
            if (!socket.nickname) return;

            io.sockets.emit('user left', {
                nick: socket.nickname
            });

            delete users[socket.nickname];
            updateNicknames();
        });

        // ===== ACTUALIZAR USUARIOS =====
        function updateNicknames() {
            io.sockets.emit('usernames', Object.keys(users));
        }

    });
};