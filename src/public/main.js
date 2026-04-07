$(function () {

    const socket = io();

    const $nicknameForm = $('#nickname-form');
    const $nicknameInput = $('#nickname-input');
    const $nicknameError = $('#nickname-error');

    const $chatContainer = $('#chat-container');
    const $nicknameContainer = $('#nickname-container');

    const $messageForm = $('#message-form');
    const $messageInput = $('#message-input');
    const $messages = $('#messages');

    const $userList = $('#user-list');
    const $userCount = $('#user-count');

    // ===== REGISTRAR =====
    $nicknameForm.submit(e => {
        e.preventDefault();

        const nickname = $nicknameInput.val().trim();

        // 🔴 VALIDACIÓN
        if (nickname === '') {
            $nicknameError.removeClass('d-none').text('El nombre no puede estar vacío');
            return;
        }

        socket.emit('new user', nickname, data => {
            if (data) {
                $nicknameContainer.addClass('d-none');
                $chatContainer.removeClass('d-none');
            } else {
                $nicknameError.removeClass('d-none').text('Ese usuario ya existe o es inválido');
            }
        });

        $nicknameInput.val('');
    });

    // ===== ENVIAR =====
    $messageForm.submit(e => {
        e.preventDefault();

        socket.emit('Enviar mensaje', $messageInput.val(), data => {
            $messages.append(`<div class="text-danger">${data}</div>`);
        });

        $messageInput.val('');
    });

    // ===== MENSAJES GUARDADOS =====
    socket.on('cargando varios mensajes', data => {
        data.forEach(msg => {
            $messages.append(
                `<div>
                    <b>${msg.nombreUsuario}:</b> ${msg.mensaje}
                </div>`
            );
        });
    });

    // ===== MENSAJE NORMAL =====
    socket.on('Nuevo mensaje', data => {
        $messages.append(
            `<div>
                <b style="color:${data.color}">${data.nick}:</b> ${data.msg}
            </div>`
        );
    });

    // ===== PRIVADO =====
    socket.on('whisper', data => {
        $messages.append(
            `<div style="color: purple;">
                <b style="color:${data.color}">${data.nick} (privado):</b> ${data.msg}
            </div>`
        );
    });

    // 🟢 USUARIO ENTRA
    socket.on('user joined', data => {
        $messages.append(
            `<div class="text-success text-center">
                🔵 ${data.nick} se ha unido al chat
            </div>`
        );
    });

    // 🔴 USUARIO SALE
    socket.on('user left', data => {
        $messages.append(
            `<div class="text-danger text-center">
                🔴 ${data.nick} ha salido del chat
            </div>`
        );
    });

    // ===== USUARIOS =====
    socket.on('usernames', data => {
        let html = '';

        for (let i = 0; i < data.length; i++) {
            html += `<li><i class="fas fa-user"></i> ${data[i]}</li>`;
        }

        $userList.html(html);
        $userCount.text(`${data.length} usuarios`);
    });

});