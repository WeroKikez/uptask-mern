import Logo from "@/components/Logo"
import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify";

const AuthLayout = () => {
  return (
    <>
    <div className="bg-gray-800 min-h-screen">
        <div className="py-10 lg:py-20 mx-auto w-[550px]">
            <Logo />
            <div className="mt-10">

                <Outlet />
            </div>
        </div>
    </div>

    <ToastContainer 
        pauseOnFocusLoss={false}
        pauseOnHover={false}
    />
    </>
  )
}

export default AuthLayout;