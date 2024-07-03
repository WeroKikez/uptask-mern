import api from "@/lib/axios";
import { ProjectFormData } from "@/types/index";
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