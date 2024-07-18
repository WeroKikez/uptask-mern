import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <>
    <h1 className="font-black text-white text-center text-4xl"
    >Pagina No Encontrada</h1>   
    <p className="mt-10 text-center text-white">
        Tal vez quieras volver a {' '}
        <Link 
            className="text-fuchsia-500 "
            to='/'
        >Proyectos</Link>
    </p>
    </>
  )
}

export default NotFound