import { deleteNote } from "@/api/NoteAPI"
import { useAuth } from "@/hooks/useAuth"
import { Note } from "@/types/index"
import { formatDate } from "@/utils/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { useLocation, useParams } from "react-router-dom"
import { toast } from "react-toastify"

type NoteDetailProps = {
    note: Note
}

const NoteDetail = ({note} : NoteDetailProps) => {
  const { data, isLoading } = useAuth()
  const canDelete = useMemo(() => data?._id === note.createdBy._id, [data])

  const params = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  
  const projectId = params.projectId!
  const taskId = queryParams.get('viewTask')!

  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: deleteNote,
    onError: ( error ) => toast.error(error.message),
    onSuccess: ( response ) => {
        queryClient.invalidateQueries({ queryKey: ['task', taskId] })
        toast.success( response )
    }
  })

  if(isLoading) return 'Cargando...'
  
  if(data) return (
    <div className="p-3 flex justify-between items-center">
        <div>
            <p className="">
                {note.content} por: <span className="font-bold">{note.createdBy.name}</span>
            </p>
            <p className="text-xs text-slate-500">
                {formatDate(note.createdAt)}
            </p>
        </div>

        {canDelete && (
            <button
                type="button"
                className="bg-red-600 hover:bg-red-500 p-2 rounded-lg text-xs text-white font-bold cursor-pointer transition-colors"
                onClick={() => mutate({ projectId, taskId, noteId: note._id })}
            >Eliminar</button>
        )}
    </div>
  )
}

export default NoteDetail