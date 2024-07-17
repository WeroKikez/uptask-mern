import type { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import Token from "../models/Token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthController {
    /* ACCOUTNS */

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

            const user = await User.findById(tokenExist.user)
            user.confirmed = true

            await Promise.allSettled([ user.save(), tokenExist.deleteOne() ])

            res.send('Cuenta Confirmada Correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static login = async (req : Request, res : Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })

            if(!user) {
                const error = new Error('Usuario No Encontrado')
                return res.status(404).json({ error: error.message })
            }

            if(!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()

                await token.save()

                // Enviar email
                AuthEmail.sendConfirmationEmail( {
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('El Usuario No Ha Confirmado su Cuenta, Hemos Enviado Un Email De Confirmación')
                return res.status(401).json({ error: error.message })
            }

            // Check password
            const isPasswordCorrect = await checkPassword(password, user.password)

            if(!isPasswordCorrect) {
                const error = new Error('Password Incorrecto')
                return res.status(401).json({ error: error.message })
            }

            const token = generateJWT({id: user.id})

            res.send(token)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static requestConfirmationCode = async (req : Request, res : Response) => {
        try {
            const { email } = req.body

            // Check if user already exist
            const user = await User.findOne({ email })
            if(!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json( { error: error.message } )
            }

            if(user.confirmed) {
                const error = new Error('El usuario ya esta confirmado')
                return res.status(403).json( { error: error.message } )
            }
          
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
            res.send('Token enviado, revisa tu email')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static forgotPassword = async (req : Request, res : Response) => {
        try {
            const { email } = req.body

            // Check if user already exist
            const user = await User.findOne({ email })
            if(!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json( { error: error.message } )
            }
          
            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            
            await token.save()

            // Enviar email
            AuthEmail.sendPasswordResetToken( {
                email: user.email,
                name: user.name,
                token: token.token
            })
            
            res.send('Token enviado, revisa tu email')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static validateToken = async (req : Request, res : Response) => {
        try {
            const { token } = req.body

            const tokenExist = await Token.findOne({ token })
            
            if(!tokenExist) {
                const error = new Error('Token No Valido')
                return res.status(401).json( { error: error.message } )
            }

            res.send('Token valido, define tu nuevo password')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static updatePasswordWithToken = async (req : Request, res : Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExist = await Token.findOne({ token })
            
            if(!tokenExist) {
                const error = new Error('Token No Valido')
                return res.status(401).json( { error: error.message } )
            }

            // Get user
            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(password)

            Promise.allSettled( [ user.save(), tokenExist.deleteOne() ] )

            res.send('Password Actualizado Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static user = async (req : Request, res : Response) => {
        return res.json(req.user)
    }

    /* PROFILE */

    static updateProfile = async ( req : Request, res : Response ) => {
        try {
            const { name, email } = req.body

            const userExists = await User.findOne({ email })
            if(userExists && userExists.id.toString() !== req.user.id){
                const error = new Error('El usuario ya existe')
                return res.status(409).json({ error: error.message })
            }

            req.user.name = name
            req.user.email = email

            await req.user.save()
            res.send('Perfil Actualizado Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static updateCurrentPassword = async ( req : Request, res : Response ) => {
        try {
            const { current_password, password } = req.body

            const user = await User.findById(req.user.id)
            
            const isPasswordCorrect = await checkPassword(current_password, user.password)

            if(!isPasswordCorrect) {
                const error = new Error('La contraseña actual es incorrecta')
                return res.status(401).json({ error: error.message })
            }

            user.password = await hashPassword(password)
            await user.save()
            res.send('La constraseña se actualizo correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static checkPassword = async ( req : Request, res : Response ) => {
        try {
            const { password } = req.body

            const user = await User.findById(req.user.id)
            const isPasswordCorrect = await checkPassword(password, user.password)

            if(!isPasswordCorrect) {
                const error = new Error('La contraseña es incorrecta')
                return res.status(401).json({ error: error.message })
            }

            res.send('Password Correcto')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }
}