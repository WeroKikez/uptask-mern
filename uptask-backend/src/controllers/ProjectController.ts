import type { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {
    static createProject = async (req : Request, res : Response) => {
        const project = new Project(req.body)

        // Set a project manager
        project.manager = req.user.id
        
        try {
            await project.save()
            res.send('Project Created Successfully')
        } catch (error) {
            console.error(error.message)
        }
    }
    
    static getAllProjects = async (req : Request, res : Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user.id} },
                    { team: { $in: req.user.id} }
                ]
            })

            res.json(projects)
        } catch (error) {
            console.log(error.message)
        }
    }

    static getProjectById = async (req : Request, res : Response) => {
        try {
            const { id } = req.params
            const project = await Project.findById(id).populate('tasks')

            if(!project) { 
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }

            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error('Acción No Válida')
                return res.status(401).json({ error: error.message })
            }

            res.json(project)
        } catch (error) {
            console.log(error.message)
        }
    }

    static updateProject = async (req : Request, res : Response) => {
        try {
            const { id } = req.params
            const project = await Project.findById(id)
            
            if(!project) { 
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }

            if(project.manager.toString() !== req.user.id.toString()) {
                const error = new Error('Acción No Válida')
                return res.status(401).json({ error: error.message })
            }

            project.projectName = req.body.projectName
            project.clientName = req.body.clientName
            project.description = req.body.description
            
            await project.save()
            res.send('Project Updated Successfully')
        } catch (error) {
            console.log(error.message)
        }
    }

    static deleteProject = async (req : Request, res : Response) => {
        try {
            const { id } = req.params
            const project = await Project.findById(id)
            
            if(!project) { 
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }

            if(project.manager.toString() !== req.user.id.toString()) {
                const error = new Error('Acción No Válida')
                return res.status(401).json({ error: error.message })
            }
            
            await project.deleteOne()
            res.send('Project Deleted Successfully')
        } catch (error) {
            console.error(error.message)
        }
    }
}