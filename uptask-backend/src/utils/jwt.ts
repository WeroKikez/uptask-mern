import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
 
type UserPayload = {
    id: mongoose.Schema.Types.ObjectId
}
  
export const generateJWT = (payload : UserPayload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '180d'
    })

    return token
}