const Task = require('../models/Task');
const logger = require('../utils/logger');

// @desc    Get all tasks
// @route   GET /tasks
// @access  Public
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /tasks
// @access  Public
const createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    logger.info(`Task created: ${task._id}`);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /tasks/:id
// @access  Public
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    logger.info(`Task updated: ${task._id}`);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /tasks/:id
// @access  Public
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    logger.info(`Task deleted: ${req.params.id}`);
    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
