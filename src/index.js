const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// ===== CONFIGURACIÓN =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== CONEXIÓN A MONGODB =====
const dbURI = process.env.MONGODB_URI;

// Verificar que la URI existe
if (!dbURI) {
    console.error('❌ Error: MONGODB_URI no está configurada');
    process.exit(1);
}

// ✅ CORRECCIÓN: Eliminar las opciones obsoletas
// Las versiones nuevas de Mongoose ya no necesitan useNewUrlParser ni useUnifiedTopology
mongoose.connect(dbURI)
    .then(() => {
        console.log('🟢 Base de datos conectada exitosamente');
        
        // Inicializar sockets DESPUÉS de conectar la base de datos
        require('./sockets')(io);

        const PORT = process.env.PORT || 3000;
        
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log("🚀 Servidor en el puerto", PORT);
        });

    })
    .catch(err => {
        console.error('🔴 Error de conexión:', err.message);
        process.exit(1);
    });

// Manejo de cierre gracioso
process.on('SIGINT', () => {
    console.log('🛑 Cerrando servidor...');
    mongoose.connection.close(() => {
        console.log('📴 Conexión cerrada');
        process.exit(0);
    });
});