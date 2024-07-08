import type { Request, Response } from "express"
import User from "../models/User"
import { hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import Token from "../models/Token"
import { AuthEmail } from "../emails/AuthEmail"

export class AuthController {
    static createAccount = async (req : Request, res : Response) => {
        try {
            const { password, email } = req.body

            // Check if user already exist
            const userExist = await User.findOne({ email })
            if(userExist) {
                const error = new Error('El usuario ya esta registrado')
                return res.status(409).json( { error: error.message } )
            }

            const user = new User(req.body)

            // Hash password
            user.password = await hashPassword(password)

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar email
            AuthEmail.sendConfirmationEmail( {
                email: user.email,
                name: user.name,
                token: token.token
            })
            
            await Promise.allSettled( [user.save(), token.save()] )
            res.send('Cuenta creada con exito, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static confirmAccount = async (req : Request, res : Response) => {
        try {
            const { token } = req.body

            const tokenExist = await Token.findOne({ token })
            
            if(!tokenExist) {
                const error = new Error('Token No Valido')
                return res.status(401).json( { error: error.message } )
            }
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }
}