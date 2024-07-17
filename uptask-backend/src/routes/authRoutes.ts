import { Router } from "express"
import { AuthController } from "../controllers/AuthController"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middlewares/validation"
import { authenticate } from "../middlewares/auth"

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

router.post('/request-code', 
    body('email')
        .isEmail().withMessage("Invalid email"),

    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/forgot-password', 
    body('email')
        .isEmail().withMessage("Invalid email"),

    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .notEmpty().withMessage("Token is required"),

    handleInputErrors,
    AuthController.validateToken
)

router.post('/update-password/:token',
    param('token')
        .isNumeric().withMessage("Invalid Token"),
    body('password')
        .isLength({min: 8}).withMessage("Password must be at least 8 characters long"),
    body('password_confirmation').custom((value, { req }) => {
        if(value !== req.body.password) {
            throw new Error('Passwords do not match')
        }

        return true
    }),

    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.get('/user', 
    authenticate,
    AuthController.user
)

/* ROUTES FOR PROFILE */
router.put('/profile',
    authenticate,
    body('name')
        .notEmpty().withMessage("The name is required"),
    body('email')
        .isEmail().withMessage("Invalid email"),
    
    handleInputErrors,
    AuthController.updateProfile
)

router.post('/update-password', 
    authenticate,
    body('current_password')
    .notEmpty().withMessage("Password must be at least 8 characters long"),
    body('password')
        .isLength({min: 8}).withMessage("Password must be at least 8 characters long"),
    body('password_confirmation').custom((value, { req }) => {
        if(value !== req.body.password) {
            throw new Error('Passwords do not match')
        }
        return true
    }),

    handleInputErrors,
    AuthController.updateCurrentPassword
)

export default router