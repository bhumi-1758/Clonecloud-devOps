const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.route('/')
  .get(getTasks)
  .post(
    [
      body('title').notEmpty().withMessage('Title is required').trim().escape(),
      body('description').optional().trim().escape(),
    ],
    validate,
    createTask
  );

router.route('/:id')
  .put(
    [
      body('title').optional().notEmpty().withMessage('Title cannot be empty').trim().escape(),
      body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status'),
    ],
    validate,
    updateTask
  )
  .delete(deleteTask);

module.exports = router;
