import { Router } from "express"
import { body, param } from 'express-validator'
import { ProjectController } from "../controllers/ProjectController"
import { handleInputErrors } from "../middlewares/validation"
import { TaskController } from "../controllers/TaskController"
import { projectExists } from "../middlewares/project"
import { taskBelongsToProject, taskExists } from "../middlewares/task"
import { authenticate } from "../middlewares/auth"

const router = Router()

router.post('/',
    authenticate,
    
    body('projectName')
        .notEmpty().withMessage("The project's name is required"),
    body('clientName')
        .notEmpty().withMessage("The client's name is required"),
    body('description')
        .notEmpty().withMessage("The description is required"),
    
    handleInputErrors,
    ProjectController.createProject 
)

router.get('/', ProjectController.getAllProjects)

router.get('/:id', 
    param('id').isMongoId().withMessage("Invalid ID"),
    
    handleInputErrors,
    ProjectController.getProjectById
)

router.put('/:id', 
    param('id').isMongoId().withMessage("Invalid ID"),
    
    body('projectName')
        .notEmpty().withMessage("The project's name is required"),
    body('clientName')
        .notEmpty().withMessage("The client's name is required"),
    body('description')
        .notEmpty().withMessage("The description is required"),

    handleInputErrors,
    ProjectController.updateProject
)

router.delete('/:id', 
    param('id').isMongoId().withMessage("Invalid ID"),
    
    handleInputErrors,
    ProjectController.deleteProject
)


/* Routes for Tasks */
router.param('projectId', projectExists)

router.post('/:projectId/task', 
    body('name')
        .notEmpty().withMessage("The task's name is required"),
    body('description')
        .notEmpty().withMessage("The description is required"),
    
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/task',
    TaskController.getProjectTasks
)

router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/task/:taskId', 
    param('taskId').isMongoId().withMessage("Invalid ID"),

    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/task/:taskId', 
    param('taskId').isMongoId().withMessage("Invalid ID"),
    body('name')
        .notEmpty().withMessage("The task's name is required"),
    body('description')
        .notEmpty().withMessage("The description is required"),

    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/task/:taskId', 
    param('taskId').isMongoId().withMessage("Invalid ID"),

    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/task/:taskId/status',
    param('taskId').isMongoId().withMessage("Invalid ID"),
    body('status')
        .notEmpty().withMessage("The status is required"),

    handleInputErrors,
    TaskController.updateStatus
)

export default router