import { db } from '../firebaseConfig.js'; // Usa la configuración centralizada de Firebase
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import ConfiguracionConsorcioManager from './ConfiguracionConsorcioManager.js';

class ExpensasManager {
    // Método para crear una nueva expensa
    static async crearExpensa(expensa) {
        this.validarExpensa(expensa);

        const configConsorcio = await ConfiguracionConsorcioManager.obtenerConfiguracion(expensa.consorcioId);
        const montoConIntereses = this.calcularIntereses(expensa, configConsorcio);

        try {
            const nuevaExpensaRef = await addDoc(collection(db, 'expensas'), {
                consorcioId: expensa.consorcioId,
                mes: expensa.mes,
                anio: expensa.anio,
                monto: montoConIntereses,
                descripcion: expensa.descripcion || '',
                fechaVencimiento: expensa.fechaVencimiento,
                fechaPago: expensa.fechaPago || null,
                enviada: false,
            });

            return { id: nuevaExpensaRef.id, ...expensa, monto: montoConIntereses };
        } catch (error) {
            throw this.handleError(error, 'Error al crear la expensa');
        }
    }

    // Método para calcular los intereses por mora
    static calcularIntereses(expensa, configConsorcio) {
        const fechaVencimiento = new Date(expensa.fechaVencimiento);
        const fechaPago = expensa.fechaPago ? new Date(expensa.fechaPago) : new Date();
        const diasDeMora = Math.max((fechaPago - fechaVencimiento) / (1000 * 60 * 60 * 24), 0);

        const tasaInteresDiario = configConsorcio.interesPorMora || 0.005;
        const interes = diasDeMora * tasaInteresDiario * expensa.monto;

        return expensa.monto + interes;
    }

    // Validación de los datos de la expensa
    static validarExpensa(expensa) {
        if (!expensa.mes || !expensa.anio || !expensa.monto || !expensa.fechaVencimiento) {
            throw new Error('Todos los campos son necesarios');
        }
    }

    // Método para obtener todas las expensas
    static async obtenerExpensas() {
        try {
            const expensasSnap = await getDocs(collection(db, 'expensas'));
            return expensasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw this.handleError(error, 'Error al obtener las expensas');
        }
    }

    // Obtener una expensa por ID
    static async obtenerExpensaPorId(id) {
        try {
            const expensaRef = doc(db, 'expensas', id);
            const expensaSnap = await getDoc(expensaRef);
            if (!expensaSnap.exists()) {
                throw new Error('Expensa no encontrada');
            }
            return { id: expensaSnap.id, ...expensaSnap.data() };
        } catch (error) {
            throw this.handleError(error, 'Error al obtener la expensa');
        }
    }

    // Modificar una expensa
    static async modificarExpensa(id, datosActualizados) {
        try {
            const expensaRef = doc(db, 'expensas', id);
            await updateDoc(expensaRef, datosActualizados);
            return { id, ...datosActualizados };
        } catch (error) {
            throw this.handleError(error, 'Error al modificar la expensa');
        }
    }

    // Eliminar una expensa
    static async eliminarExpensa(id) {
        try {
            const expensaRef = doc(db, 'expensas', id);
            await deleteDoc(expensaRef);
            return { message: 'Expensa eliminada con éxito' };
        } catch (error) {
            throw this.handleError(error, 'Error al eliminar la expensa');
        }
    }

    // Enviar la expensa por email
    static async enviarExpensaPorEmail(expensa, email) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: `Expensa correspondiente a ${expensa.mes}/${expensa.anio}`,
                text: `Detalle de la expensa: \nMonto: ${expensa.monto}\nDescripción: ${expensa.descripcion}\nFecha Vencimiento: ${expensa.fechaVencimiento}`,
            };

            await transporter.sendMail(mailOptions);
            return { message: 'Expensa enviada por correo con éxito' };
        } catch (error) {
            throw this.handleError(error, 'Error al enviar la expensa por email');
        }
    }

    // Método para manejar errores de forma centralizada
    static handleError(error, mensaje) {
        return new Error(`${mensaje}: ${error.message}`);
    }
}

export default ExpensasManager;