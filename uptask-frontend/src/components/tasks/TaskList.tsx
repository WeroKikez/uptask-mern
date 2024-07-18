import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { Project, TaskProject, TaskStatus } from "@/types/index"
import TaskCard from "./TaskCard"
import { statusTranslations } from "@/locales/es"
import { statusBorderTColors } from "@/locales/colours"
import DropTask from "./DropTask"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTaskStatus } from "@/api/TaskAPI"
import { toast } from "react-toastify"
import { useParams } from "react-router-dom"
import { useState } from "react"

type TaskListProps = {
    tasks: TaskProject[],
    canEdit: boolean
}

type GroupedTasks = {
    [key: string]: TaskProject[]
}

const initialStatusGroups : GroupedTasks = {
    pending: [],
    onHold: [],
    inProgress: [],
    underReview: [],
    completed: []
}

const TaskList = ({tasks, canEdit} : TaskListProps) => {
    const [isDragOver, setIsDragOver] = useState(true)
    const [dragId, setDragId] = useState<string>('')

    const params = useParams()
    const projectId = params.projectId!

    const groupedTasks = tasks.reduce((acc, task) => {
        let currentGroup = acc[task.status] ? [...acc[task.status]] : [];
        currentGroup = [...currentGroup, task]
        return { ...acc, [task.status]: currentGroup };
    }, initialStatusGroups)

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: updateTaskStatus,
        onError: ( error ) => toast.error(error.message),
        onSuccess: ( response ) => {
            toast.success(response)
            queryClient.invalidateQueries({ queryKey: ['project', projectId]})
            // queryClient.invalidateQueries({ queryKey: ['task', ]})
        }
    })

    const handleDragEnd = ( e : DragEndEvent ) => {
        setIsDragOver(true)
        setDragId('')

        const { over, active} = e
        
        if( over && over.id ) {
            const taskId = active.id.toString()
            const status = over.id as TaskStatus

            mutate({ projectId, taskId, status })

            queryClient.setQueryData(['project', projectId], ( prevData : Project ) => {
                const updatedTasks = prevData.tasks.map( (task) => {
                    if( task._id === active.id ) {
                        return {
                            ...task,
                            status
                        }
                    }
                    return task
                })

                return {
                    ...prevData,
                    tasks: updatedTasks
                }
            })
        }
    }

    const handleDragStart = ( e : DragStartEvent ) => {
        const { active } = e
        setDragId(active.id.toString())
        setIsDragOver(false)
    }

    return (
    <>
    <h2 className="text-5xl font-black my-10">Tareas</h2>

    <div className='flex gap-5 overflow-x-scroll 2xl:overflow-auto pb-32'>
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        {Object.entries(groupedTasks).map(([status, tasks]) => (
            <div key={status} className='min-w-[300px] 2xl:min-w-0 2xl:w-1/5'>
                <h3 
                    className={`capitalize text-xl font-light border border-slate-300 bg-white p-3 border-t-8 ${statusBorderTColors[status]}`}
                >{statusTranslations[status]}</h3>

                <DropTask status={status} />

                <ul className='mt-5 space-y-5'>
                    {tasks.length === 0 ? (
                        <li className="text-gray-500 text-center pt-3">No Hay tareas</li>
                    ) : (
                        tasks.map(task => <TaskCard key={task._id} task={task} canEdit={canEdit} isDragOver={isDragOver} dragId={dragId} />)
                    )}
                </ul>
            </div>
        ))}
        </DndContext>
    </div>
    </>
  )
}

export default TaskList;