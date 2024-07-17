import ProfileForm from "@/components/profile/ProfileForm"
import { useAuth } from "@/hooks/useAuth"

const ProfileView = () => {
  const { data, isLoading } = useAuth()  

  if(isLoading) return 'Cargando...'

  if(data) return <ProfileForm data={data} />
}

export default ProfileView