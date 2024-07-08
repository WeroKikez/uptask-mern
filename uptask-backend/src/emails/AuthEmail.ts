import { transport } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async ( user : IEmail ) => {
        const info = await transport.sendMail({
            from: 'UpTask <admin@task.com>',
            to: user.email,
            subject: 'UpTask - Confirma tu Cuenta',
            text: 'UpTask - Confirma tu Cuenta',
            html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask. Ya casi esta todo listo, solo debes confirmar tu cuenta</p>
            
            <p>Visita el siguiente enlace para confirmar tu cuenta: </p>
            <a href="">Confirmar Cuenta</a>
            <p>Ingresa el código: <b>${user.token}</b></p>
            <p>Este token expira en 10 minutos</p>
            `
        })

        console.log('Mensaje Enviado', info.messageId)
    }
}