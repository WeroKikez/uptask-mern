import mongoose from "mongoose"
import colors from "colors"
import { exit } from "node:process"

export const connectDB = async () => {
    try {
        console.log(colors.blue("Conectando a la base de datos..."))
        const { connection } = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.host}:${connection.port}`
        console.log(colors.bgGreen.bold(`MongoDB conectado en:`) + ' ' + colors.magenta.bold(url))
    } catch (error) {
        console.log(colors.red("Error de conexión a la base de datos: "))
        console.log(colors.bgRed.bold(error.message))
        exit(1)
    }
}