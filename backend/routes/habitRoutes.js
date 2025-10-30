const express = require('express');
const { body, param } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const { createHabit, getHabits, updateHabit, deleteHabit } = require('../controllers/habitController');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  [
    body('habitName').notEmpty().withMessage('habitName is required'),
    body('frequency').isIn(['daily', 'weekly', 'monthly', 'custom']).withMessage('Invalid frequency'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('progress must be 0-100'),
  ],
  createHabit
);

router.get('/', getHabits);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid habit id'),
    body('habitName').optional().isString(),
    body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'custom']).withMessage('Invalid frequency'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('progress must be 0-100'),
  ],
  updateHabit
);

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid habit id')], deleteHabit);

module.exports = router;
