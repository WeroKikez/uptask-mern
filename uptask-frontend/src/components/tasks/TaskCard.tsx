import { Fragment } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskProject } from "@/types/index";
import { deleteTask } from "@/api/TaskAPI";
import { toast } from "react-toastify";
import { useDraggable } from "@dnd-kit/core";

type TaskCardProps = {
    task: TaskProject,
    canEdit: boolean
    isDragOver: boolean
    dragId: string
}

const TaskCard = ({task, canEdit, isDragOver, dragId} : TaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id
  })

  const navigate = useNavigate()  

  const params = useParams()
  const projectId = params.projectId!

  const queryClient = useQueryClient()  
  const { mutate } = useMutation({
    mutationFn: deleteTask,
    onError: ( error ) => {
        toast.error(error.message)
    },
    onSuccess: ( response ) => {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] })
        toast.success(response)
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    cursor: "grabbing"
  } : {
    cursor: "grab",
  }

  return (
    <li 
        className={isDragOver || dragId !== task._id ? `p-5 bg-white border border-slate-300 flex justify-between gap-3` : ''}
        onAuxClick={() => navigate(`/projects/${projectId}?viewTask=${task._id}`)}
        onDoubleClick={() => navigate(`/projects/${projectId}?viewTask=${task._id}`)}
    >
        <div
            {...listeners}
            {...attributes}
            ref={setNodeRef}
            style={style}
            className={`min-w-0 flex flex-col gap-y-4 ${!isDragOver && dragId === task._id && 'p-5'} bg-white`}
        >
            <p
                className="text-xl font-bold text-slate-600 text-left"
            >{task.name}</p>
            <p className="text-slate-500">{task.description}</p>
        </div>

        
        {isDragOver || dragId !== task._id ? (
        <div>    
            <div className="flex shrink-0  gap-x-6">
                <Menu as="div" className="relative flex-none">
                    <Menu.Button className="-my-3.5 -mx-5 block py-1 text-gray-500 hover:text-gray-900">
                        <span className="sr-only">opciones</span>
                        <EllipsisVerticalIcon className="h-9 w-9" aria-hidden="true" />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items
                            className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                            <Menu.Item>
                                <button 
                                    type='button' 
                                    className='block px-3 py-1 text-sm leading-6 text-gray-900'
                                    onClick={() => navigate(location.pathname + `?viewTask=${task._id}`)}
                                >
                                    Ver Tarea
                                </button>
                            </Menu.Item>
                            {canEdit && (
                                <>
                                <Menu.Item>
                                    <button 
                                        type='button' 
                                        className='block px-3 py-1 text-sm leading-6 text-gray-900'
                                        onClick={() => navigate(location.pathname + `?editTask=${task._id}`)}
                                    >
                                        Editar Tarea
                                    </button>
                                </Menu.Item>

                                <Menu.Item>
                                    <button 
                                        type='button' 
                                        className='block px-3 py-1 text-sm leading-6 text-red-500'
                                        onClick={() => mutate({projectId, taskId: task._id})}
                                    >
                                        Eliminar Tarea
                                    </button>
                                </Menu.Item>
                                </>
                            )}
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </div>
        ) : null}
    </li>
  )
}

export default TaskCard