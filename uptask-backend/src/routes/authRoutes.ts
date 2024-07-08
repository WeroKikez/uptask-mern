import { Router } from "express"
import { AuthController } from "../controllers/AuthController"
import { body } from "express-validator"
import { handleInputErrors } from "../middlewares/validation"

const router = Router()

router.post('/create-account', 
    body('name')
        .notEmpty().withMessage("The name is required"),
    body('password')
        .isLength({min: 8}).withMessage("Password must be at least 8 characters long"),
    body('password_confirmation').custom((value, { req }) => {
        if(value !== req.body.password) {
            throw new Error('Passwords do not match')
        }

        return true
    }),
    body('email')
        .isEmail().withMessage("Invalid email"),
    
    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account', 
    body('token')
        .notEmpty().withMessage("Token is required"),

        handleInputErrors,
        AuthController.confirmAccount
)

router.post('/login', 
    body('email')
        .isEmail().withMessage("Invalid email"),
    body('password')
        .notEmpty().withMessage("Password is required"),

    handleInputErrors,
    AuthController.login
)

export default router