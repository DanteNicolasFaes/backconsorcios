// /manager/InvitacionesManager.js
const { getFirestore, collection, addDoc, getDocs, doc, getDoc } = require('firebase/firestore');
const EmailManager = require('./EmailManager'); // Importa el EmailManager para enviar correos

// Clase para gestionar las invitaciones
class InvitacionesManager {
    constructor() {
        // Inicializa Firestore
        this.db = getFirestore();
        this.collectionName = 'invitaciones'; // Nombre de la colección en Firestore
    }

    // Función para crear una nueva invitación (solo el administrador puede hacerlo)
    async crearInvitacion(data, usuario) {
        // Validaciones
        // Verifica que el usuario sea el administrador
        if (!usuario || usuario.rol !== 'administrador') {
            throw new Error('Solo el administrador puede crear invitaciones.');
        }

        // 1. Verificar que el correo esté presente y tenga un formato válido
        if (!data.correo || typeof data.correo !== 'string' || !/\S+@\S+\.\S+/.test(data.correo)) {
            throw new Error('El correo es obligatorio y debe tener un formato válido.');
        }

        // 2. Verificar que el asunto esté presente y sea una cadena de texto
        if (!data.asunto || typeof data.asunto !== 'string') {
            throw new Error('El asunto es obligatorio y debe ser una cadena de texto.');
        }

        // 3. Verificar que el mensaje esté presente y sea una cadena de texto
        if (!data.mensaje || typeof data.mensaje !== 'string') {
            throw new Error('El mensaje es obligatorio y debe ser una cadena de texto.');
        }

        try {
            // Añade un nuevo documento a la colección de invitaciones
            const nuevaInvitacion = await addDoc(collection(this.db, this.collectionName), data);

            // Envía el correo electrónico con la invitación usando el EmailManager
            await EmailManager.enviarCorreo(data.correo, data.asunto, data.mensaje);

            // Retorna el ID de la nueva invitación junto con los datos
            return { id: nuevaInvitacion.id, ...data };
        } catch (error) {
            // Manejo de errores al crear la invitación
            throw new Error('Error al crear la invitación: ' + error.message);
        }
    }

    // Función para listar todas las invitaciones
    async listarInvitaciones() {
        try {
            const snapshot = await getDocs(collection(this.db, this.collectionName));
            const invitaciones = [];
            snapshot.forEach(doc => {
                invitaciones.push({ id: doc.id, ...doc.data() });
            });
            return invitaciones;
        } catch (error) {
            throw new Error('Error al listar las invitaciones: ' + error.message);
        }
    }

    // Función para obtener detalles de una invitación específica
    async obtenerInvitacionPorId(id) {
        try {
            const docRef = doc(this.db, this.collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('No se encontró la invitación');
            }
        } catch (error) {
            throw new Error('Error al obtener la invitación: ' + error.message);
        }
    }
}

// Exporta una instancia de la clase InvitacionesManager
module.exports = new InvitacionesManager();
