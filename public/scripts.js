// Base de datos simulada de usuarios y solicitudes
let usuarios = [
    { username: 'admin', password: 'admin', saldo: 0, historial: [] }
];

let solicitudes = [];

// Función para registrar un nuevo usuario
function registrarUsuario() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const usuarioExistente = usuarios.find(user => user.username === username);

    if (usuarioExistente) {
        alert('El nombre de usuario ya está en uso.');
        return false;
    }

    usuarios.push({ username, password, saldo: 0, historial: [] });
    alert('Usuario registrado exitosamente.');
    alternarFormulario();
    return false;
}

// Función para iniciar sesión
function iniciarSesion() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const usuario = usuarios.find(user => user.username === username && user.password === password);

    if (usuario) {
        document.getElementById('usuarioActual').innerText = username;
        document.getElementById('saldoActual').innerText = usuario.saldo;

        document.getElementById('inicioSesion').classList.add('oculto');
        document.getElementById('plataforma').classList.remove('oculto');

        if (username === 'admin') {
            document.getElementById('admin').classList.remove('oculto');
        }
    } else {
        document.getElementById('mensajeError').innerText = 'Nombre de usuario o contraseña incorrectos.';
    }

    return false;
}

// Función para cerrar sesión
function cerrarSesion() {
    document.getElementById('inicioSesion').classList.remove('oculto');
    document.getElementById('plataforma').classList.add('oculto');
    document.getElementById('admin').classList.add('oculto');
}

// Función para cerrar sesión del administrador
function cerrarSesionAdmin() {
    document.getElementById('admin').classList.add('oculto');
    cerrarSesion();
}

// Función para alternar entre formulario de inicio de sesión y registro
function alternarFormulario() {
    document.getElementById('inicioSesion').classList.toggle('oculto');
    document.getElementById('registro').classList.toggle('oculto');
}

// Función para mostrar el formulario de depósito
function mostrarFormularioDeposito() {
    prepararFormularioSolicitud('Depósito');
}

// Función para mostrar el formulario de retiro
function mostrarFormularioRetiro() {
    prepararFormularioSolicitud('Retiro');
}

// Función para preparar el formulario de solicitud de depósito o retiro
function prepararFormularioSolicitud(tipo) {
    document.getElementById('tipoSolicitud').value = tipo;
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('cedula').value = '';
    document.getElementById('correo').value = '';
    document.getElementById('cantidad').value = '';

    document.getElementById('plataforma').classList.add('oculto');
    document.getElementById('solicitud').classList.remove('oculto');
}

// Función para enviar una solicitud de depósito o retiro
function enviarSolicitud() {
    const tipo = document.getElementById('tipoSolicitud').value;
    const nombreUsuario = document.getElementById('usuarioActual').innerText;
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const cedula = document.getElementById('cedula').value;
    const correo = document.getElementById('correo').value;
    const cantidad = parseFloat(document.getElementById('cantidad').value);

    const solicitud = {
        tipo,
        nombreUsuario,
        nombre,
        apellido,
        cedula,
        correo,
        cantidad,
        estado: 'Pendiente'
    };

    solicitudes.push(solicitud);

    alert('Solicitud enviada exitosamente.');

    document.getElementById('solicitud').classList.add('oculto');
    document.getElementById('plataforma').classList.remove('oculto');

    actualizarSolicitudesPendientes();

    return false;
}

// Función para mostrar el historial de transacciones
function mostrarHistorialTransacciones() {
    const nombreUsuario = document.getElementById('usuarioActual').innerText;
    const usuario = usuarios.find(user => user.username === nombreUsuario);

    const historialDiv = document.getElementById('historialTransacciones');
    historialDiv.innerHTML = '';

    usuario.historial.forEach(transaccion => {
        const transaccionDiv = document.createElement('div');
        transaccionDiv.classList.add('transaccion');
        transaccionDiv.innerHTML = `
            <p>Tipo: ${transaccion.tipo}</p>
            <p>Cantidad: ${transaccion.cantidad} USD</p>
            <p>Fecha: ${new Date(transaccion.fecha).toLocaleString()}</p>
        `;
        historialDiv.appendChild(transaccionDiv);
    });

    document.getElementById('plataforma').classList.add('oculto');
    document.getElementById('historial').classList.remove('oculto');
}

// Función para cerrar el historial de transacciones
function cerrarHistorial() {
    document.getElementById('historial').classList.add('oculto');
    document.getElementById('plataforma').classList.remove('oculto');
}

// Función para aprobar una solicitud
function aprobarSolicitud(index) {
    const solicitud = solicitudes[index];
    const usuario = usuarios.find(user => user.username === solicitud.nombreUsuario);

    solicitud.estado = 'Aprobada';

    // Mostrar mensaje de que el dinero está siendo trabajado
    const mensajeEstado = document.getElementById('mensajeEstado');
    mensajeEstado.innerText = 'Su dinero está siendo trabajado y se liberará en 48 horas.';
    mensajeEstado.classList.add('visible');

    setTimeout(() => {
        if (solicitud.tipo === 'Depósito') {
            usuario.saldo += solicitud.cantidad;
        } else if (solicitud.tipo === 'Retiro' && usuario.saldo >= solicitud.cantidad) {
            usuario.saldo -= solicitud.cantidad;
        }

        solicitud.estado = 'Completada';
        usuario.historial.push({
            tipo: solicitud.tipo,
            cantidad: solicitud.cantidad,
            fecha: Date.now()
        });

        actualizarSolicitudesPendientes();
        actualizarSaldoUsuario();

        // Ocultar mensaje después de 48 horas
        mensajeEstado.classList.remove('visible');
    }, 48 * 60 * 60 * 1000); // 48 horas en milisegundos
}

// Función para actualizar la lista de solicitudes pendientes en el panel de administración
function actualizarSolicitudesPendientes() {
    const solicitudesDiv = document.getElementById('solicitudesPendientes');
    solicitudesDiv.innerHTML = '';

    solicitudes.forEach((solicitud, index) => {
        if (solicitud.estado === 'Pendiente') {
            const solicitudDiv = document.createElement('div');
            solicitudDiv.classList.add('solicitud');
            solicitudDiv.innerHTML = `
                <p>Usuario: ${solicitud.nombreUsuario}</p>
                <p>Tipo: ${solicitud.tipo}</p>
                <p>Cantidad: ${solicitud.cantidad} USD</p>
                <button class="boton" onclick="aprobarSolicitud(${index})">Aprobar</button>
            `;
            solicitudesDiv.appendChild(solicitudDiv);
        }
    });
}

// Función para actualizar el saldo del usuario actual
function actualizarSaldoUsuario() {
    const nombreUsuario = document.getElementById('usuarioActual').innerText;
    const usuario = usuarios.find(user => user.username === nombreUsuario);
    document.getElementById('saldoActual').innerText = usuario.saldo;
}

// Función para modificar el saldo de un usuario (admin)
function modificarSaldo() {
    const username = document.getElementById('usuarioModificar').value;
    const nuevoSaldo = parseFloat(document.getElementById('nuevoSaldo').value);

    const usuario = usuarios.find(user => user.username === username);

    if (usuario) {
        usuario.saldo = nuevoSaldo;
        alert('Saldo modificado exitosamente.');
        actualizarSaldoUsuario();
    } else {
        alert('Usuario no encontrado.');
    }

    return false;
}
