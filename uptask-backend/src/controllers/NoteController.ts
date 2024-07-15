import type { Request, Response } from "express"
import Note, { INote } from "../models/Note"
import { Types } from "mongoose"

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    static createNote = async (req : Request<{}, {}, INote>, res : Response) => {
        try {
            const { content } = req.body
            const note = new Note()
    
            note.content = content
            note.createdBy = req.user.id
            note.task = req.task.id
            req.task.notes.push(note.id)

            await Promise.allSettled([ note.save(), req.task.save() ])
            res.send('Nota Creada Correctamente')
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static getTaskNotes = async (req : Request, res : Response) => {
        try {
            const notes = await Note.find({ task: req.task.id })
            res.json(notes)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static deleteNote = async (req : Request<NoteParams>, res : Response) => {
        try {
            const { noteId } = req.params
            const note = await Note.findById(noteId)

            if(!note) {
                const error = new Error('Nota No Encontrada')
                return res.status(404).json({ error: error.message })
            }

            if(note.createdBy.toString() !== req.user.id) {
                const error = new Error('Acción No Válida')
                return res.status(401).json({ error: error.message })
            }

            req.task.notes = req.task.notes.filter( note => note.toString() !== noteId.toString() )

            Promise.allSettled([ note.deleteOne(), req.task.save() ])
            res.send('Nota Eliminada Correctamente')
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}