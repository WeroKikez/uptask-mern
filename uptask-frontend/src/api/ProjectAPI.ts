import api from "@/lib/axios";
import { Project, ProjectFormData, dashboardProjectSchema, editProjectSchema, projectSchema } from "@/types/index";
import { isAxiosError } from "axios";


export async function createProject(project: ProjectFormData) {
    try {
        const data = await api.post('/projects', project)
        if(data.status === 200) {
            return 'Proyecto Creado Exitosamente'
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            const errorMessage = error.response.status === 404 ? new Error('Proyecto No Encontrado') : new Error(error.response.data.error)
            
            throw errorMessage
        }
    }
}

export async function getProjects() {
    try {
        const { data } = await api('/projects')
        const response = dashboardProjectSchema.safeParse(data)

        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getProjectById(id : Project['_id']) {
    try {
        const { data } = await api(`/projects/${id}`)
        const response = editProjectSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            const errorMessage = error.response.status === 404 ? new Error('Proyecto No Encontrado') : new Error(error.response.data.error)
            
            throw errorMessage
        }
    }
}

export async function getFullProjectDetailsById(id : Project['_id']) {
    try {
        const { data } = await api(`/projects/${id}`)
        const response = projectSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            const errorMessage = error.response.status === 404 ? new Error('Proyecto No Encontrado') : new Error(error.response.data.error)
            
            throw errorMessage
        }
    }
}

type ProjectAPIType = {
    formData : ProjectFormData,
    projectId : Project['_id']
}

export async function updateProject({formData, projectId} : ProjectAPIType) {
    try {
        const data = await api.put<string>(`/projects/${projectId}`, formData)
        
        if(data.status === 200) {
            return 'Proyecto Actualizado Exitosamente'
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            const errorMessage = error.response.status === 404 ? new Error('Proyecto No Encontrado') : new Error(error.response.data.error)
            
            throw errorMessage
        }
    }
}

export async function deleteProject(id : Project['_id']) {
    try {
        const data = await api.delete(`/projects/${id}`)
        
        if(data.status === 200) {
            return 'Proyecto Eliminado Exitosamente'
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            const errorMessage = error.response.status === 404 ? new Error('Proyecto No Encontrado') : new Error(error.response.data.error)
            
            throw errorMessage
        }
    }
}