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
// La variable MONGODB_URI debe estar configurada en Render (Environment Variables)
const dbURI = process.env.MONGODB_URI;

// Verificar que la URI existe
if (!dbURI) {
    console.error('❌ Error: MONGODB_URI no está configurada en las variables de entorno');
    console.log('💡 Debes agregar MONGODB_URI en Render → Environment Variables');
    process.exit(1); // Detiene el servidor si no hay URI
}

// Opciones para evitar warnings en consola
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
};

mongoose.connect(dbURI, mongooseOptions)
    .then(() => {
        console.log('🟢 Base de datos conectada exitosamente');
        console.log(`📊 Base de datos: ${mongoose.connection.name}`);
        console.log(`📍 Host: ${mongoose.connection.host}`);
        
        // Inicializar sockets DESPUÉS de conectar la base de datos
        require('./sockets')(io);

        // ===== SERVIDOR =====
        const PORT = process.env.PORT || 3000;
        
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log("🚀 Servidor corriendo en el puerto", PORT);
            console.log(`🔗 Accede en: http://localhost:${PORT} o en tu URL de Render`);
        });

    })
    .catch(err => {
        console.error('🔴 Error de conexión a MongoDB:');
        console.error(`   Mensaje: ${err.message}`);
        
        // Mostrar ayuda si es error de autenticación
        if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
            console.error('💡 Posible solución: Verifica usuario y contraseña en MONGODB_URI');
        }
        
        // Mostrar ayuda si es error de red
        if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
            console.error('💡 Posible solución: Verifica que la URI de MongoDB sea correcta');
        }
        
        process.exit(1);
    });

// ===== MANEJO DE CIERRE GRACIOSO =====
// Esto asegura que la conexión se cierre correctamente al detener el servidor
process.on('SIGINT', () => {
    console.log('🛑 Cerrando servidor...');
    mongoose.connection.close(() => {
        console.log('📴 Conexión a MongoDB cerrada');
        process.exit(0);
    });
});