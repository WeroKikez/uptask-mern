import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaskById, updateTaskStatus } from '@/api/TaskAPI';
import { toast } from 'react-toastify';
import { formatDate } from '@/utils/utils';
import { statusTranslations } from '@/locales/es';
import { TaskStatus } from '@/types/index';
import { statusBackgroundColors, statusBorderColors, statusTextColors } from '@/locales/colours';
import NotesPanel from '../notes/NotesPanel';

export default function TaskDetailsModal() {
    const projectId = useParams().projectId!
    
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const taskId = queryParams.get('viewTask')!

    const show = taskId ? true : false

    const navigate = useNavigate()

    const { data, isError, error } = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => getTaskById({projectId, taskId}),
        enabled: !!taskId,
        retry: false
    })

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: updateTaskStatus,
        onError: ( error ) => {
            toast.error(error.message)
        },
        onSuccess: ( response ) => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            queryClient.invalidateQueries({ queryKey: ['task', taskId] })
            toast.success(response)
            navigate(location.pathname, {replace: true})
        }
    })

    const handleChange = (e : React.ChangeEvent<HTMLSelectElement>) => {
        mutate({
            projectId,
            taskId,
            status: e.target.value as TaskStatus
        })
    }

    useEffect(() => {
        if(isError) {
            toast.error(error.message, { toastId: 'error' })
            navigate(location.pathname, {replace: true})
        }
    }, [isError])
  
    if (data) return (
        <>
            <Transition appear show={show} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => {navigate(location.pathname, {replace: true})}}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all p-16">
                                    <p className='text-sm text-slate-400'>Agregada el: {formatDate(data.createdAt)}</p>
                                    <p className='text-sm text-slate-400'>Última actualización: {formatDate(data.updatedAt)}</p>
                                    <Dialog.Title
                                        as="h3"
                                        className="font-black text-4xl text-slate-600 my-5"
                                    >{data.name}</Dialog.Title>
                                    <p className='text-lg text-slate-500 mb-2'><span className='font-bold'>Descripción:</span> {data.description}</p>

                                    {data.completedBy.length > 0 && (
                                        <>
                                            <p className='font-bold mt-4 mb-2'>Historial de Cambios</p>
                                            
                                            <ul className='list-decimal'>
                                            {data.completedBy.map( (actiityLog) => (
                                                <li className='flex gap-5 mt-2 text-center' key={actiityLog._id}>
                                                    <div className={`align-middle text-center w-[150px] rounded-lg border-2 ${statusBorderColors[actiityLog.status]} ${statusBackgroundColors[actiityLog.status]}`}>
                                                        <span 
                                                            className={`font-bold uppercase text-sm px-5 py-1 ${statusTextColors[actiityLog.status]}`}
                                                        >{statusTranslations[actiityLog.status]}</span>
                                                    </div>
                                                    
                                                    <p className=''>{actiityLog.user.name}</p>
                                                </li>
                                            ))}
                                            </ul>
                                        </>
                                    )}

                                    <div className='my-5 space-y-3'>
                                        <label className='font-bold'>Estado Actual:</label>

                                        <select 
                                            className="w-full p-3 border border-gray-300"  
                                            defaultValue={data.status}
                                            onChange={handleChange}
                                        >
                                            {Object.entries(statusTranslations).map( ([key, status]) => (
                                                <option key={key} value={key}>{status}</option>
                                            ) )}
                                        </select>
                                    </div>

                                    <NotesPanel notes={data.notes} />
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}