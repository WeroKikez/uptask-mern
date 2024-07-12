import { Request, Response } from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
    static findMemberByEmail = async (req : Request, res : Response) => {
        const { email } = req.body

        try {
            // Find User
            const user = await User.findOne({ email }).select('_id name email')
            if(!user) {
                const error = new Error('Usuario No Encontrado')
                return res.status(404).json({ error: error.message })
            }

            return res.json(user)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static addMemberById = async (req : Request, res : Response) => {
        const { id } = req.body

        try {
            // Find User
            const user = await User.findById(id).select('id')

            if(!user) {
                const error = new Error('Usuario No Encontrado')
                return res.status(404).json({ error: error.message })
            }

            if( req.project.team.some( member => member.toString() === user.id.toString() ) ) {
                const error = new Error('El Usuario Ya Se Encuentra En El Proyecto')
                return res.status(409).json({ error: error.message })
            }

            req.project.team.push(user.id)
            await req.project.save()

            res.send('Usuario Agregado Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static getTeamMembers = async (req : Request, res : Response) => {
        try {
            const project = await Project.findById(req.project.id).populate({
                path: 'team',
                select: 'id email name'
            })

            res.json(project.team)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }

    static removeMemberById = async (req : Request, res : Response) => {
        const { userId } = req.params

        try {
            if( !req.project.team.some( member => member.toString() === userId ) ) {
                const error = new Error('El Usuario No Se Encuentra En El Proyecto')
                return res.status(409).json({ error: error.message })
            }

            req.project.team = req.project.team.filter( member => member.toString() !== userId.toString() )

            await req.project.save()

            res.send('Usuario Removido Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un Error' })
        }
    }
}