import api from "@/lib/axios";
import { ProjectFormData } from "@/types/index";


export async function createProject(project: ProjectFormData) {
    try {
        const data = await api.post('/projects', project)
        if(data.status === 200) {
            return 'Proyecto Creado Exitosamente'
        }
    } catch (error) {
        console.error(error)
    }
}