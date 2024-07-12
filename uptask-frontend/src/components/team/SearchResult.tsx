import { addMemberToProject } from "@/api/TeamAPI"
import { TeamMember } from "@/types/index"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { toast } from "react-toastify"

type SearchResultProps = {
    user: TeamMember,
    reset: () => void
}

const SearchResult = ({ user, reset } : SearchResultProps) => {
    const params = useParams()
    const projectId = params.projectId!

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: addMemberToProject,
        onError: ( error ) => {
            toast.error(error.message)
        },
        onSuccess: ( response ) => {
            toast.success(response)
            queryClient.invalidateQueries({ queryKey: ['projectTeam', projectId] })
            reset()
        }
    })

    const handleAddMemberToProject = () => mutate({ projectId, id: user._id })

    return (
        <>
            <p className="mt-10 text-center font-bold">Resultado: </p>
            <div className="flex justify-between items-center">
                <p className="text-center text-lg text-violet-700 px-4 py-2 rounded-md bg-violet-100 border-2 border-violet-700">{user.name}</p>
                <button
                    className="text-purple-600 hover:bg-purple-100 px-10 py-3 font-bold cursor-pointer"
                    onClick={handleAddMemberToProject}
                >Agregar al Proyecto</button>
            </div>
        </>
    )
}

export default SearchResult