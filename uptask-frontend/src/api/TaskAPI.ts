import { isAxiosError } from "axios"
import api from "@/lib/axios"
import { Project, TaskFormData } from "../types"

type TaskAPI = {
    formData : TaskFormData,
    projectId : Project['_id']
}

export async function createTask({formData, projectId} : Pick<TaskAPI, 'formData' | 'projectId'>) {
    try {
        const url = `/projects/${projectId}/task`
        const data = await api.post<string>(url, formData)

        if(data.status === 200) {
            return 'Tarea Creada Exitosamente'
        }

    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}