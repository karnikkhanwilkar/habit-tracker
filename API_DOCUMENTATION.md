# API Documentation - Habit Tick Boxes

## Modified Endpoints

### Create Habit (POST /api/habits)

**BEFORE:**
```json
{
  "habitName": "Morning Run",
  "frequency": "daily",
  "progress": 0
}
```

**AFTER:**
```json
{
  "habitName": "Morning Run",
  "frequency": "daily"
}
```

**Note:** `progress` field is no longer used. Backend automatically initializes `completions` array.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "habitName": "Morning Run",
  "frequency": "daily",
  "userId": "507f1f77bcf86cd799439012",
  "completions": [],
  "createdAt": "2025-12-09T10:30:00.000Z",
  "updatedAt": "2025-12-09T10:30:00.000Z"
}
```

---

## New Endpoints

### Toggle Completion (PUT /api/habits/:habitId/completion/:completionIndex)

Toggle the completion status of a specific tick box at a given index.

**URL Parameters:**
- `habitId` (string): MongoDB ObjectId of the habit
- `completionIndex` (number): Zero-based index of the tick box (0-29 for daily, 0-11 for weekly/monthly)

**Request Body:**
```json
{
  "isCompleted": true
}
```

**Successful Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "habitName": "Morning Run",
  "frequency": "daily",
  "userId": "507f1f77bcf86cd799439012",
  "completions": [
    {
      "date": "2025-12-09T00:00:00.000Z",
      "isCompleted": true,
      "label": "Tue, Dec 09"
    },
    {
      "date": "2025-12-11T00:00:00.000Z",
      "isCompleted": true,
      "label": "Thu, Dec 11"
    }
  ],
  "createdAt": "2025-12-09T10:30:00.000Z",
  "updatedAt": "2025-12-09T12:45:00.000Z"
}
```

**Error Responses:**

404 Not Found:
```json
{
  "message": "Habit not found"
}
```

400 Bad Request:
```json
{
  "message": "Invalid completion index"
}
```

500 Server Error:
```json
{
  "message": "Server error"
}
```

---

## Unchanged Endpoints

### Get All Habits (GET /api/habits)
Returns all habits for authenticated user with their completions arrays populated.

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "habitName": "Morning Run",
    "frequency": "daily",
    "userId": "507f1f77bcf86cd799439012",
    "completions": [
      {
        "date": "2025-12-09T00:00:00.000Z",
        "isCompleted": true,
        "label": "Tue, Dec 09"
      }
    ],
    "createdAt": "2025-12-09T10:30:00.000Z",
    "updatedAt": "2025-12-09T12:45:00.000Z"
  }
]
```

### Update Habit (PUT /api/habits/:id)
Can still update habitName, frequency, or add custom fields. Completions are managed separately via the toggle endpoint.

### Delete Habit (DELETE /api/habits/:id)
Deletes the entire habit including all completions. No changes.

---

## Implementation Details

### Completion Index Mapping

The frontend and backend use the same date calculation algorithm to map completion indices to dates:

**Daily (Index 0-29):**
```
Index 0 → Today
Index 1 → Tomorrow
Index 2 → Day after tomorrow
...
Index 29 → 29 days from today
```

**Weekly (Index 0-11):**
```
Index 0 → Start of current week (Monday)
Index 1 → Start of next week (7 days later)
Index 2 → 2 weeks from now
...
Index 11 → 11 weeks from now
```

**Monthly (Index 0-11):**
```
Index 0 → 1st of current month
Index 1 → 1st of next month
Index 2 → 1st of month after next
...
Index 11 → 1st of month 11 months from now
```

### Date Normalization

All dates are stored at midnight UTC:
```javascript
date.setHours(0, 0, 0, 0);
date.toISOString(); // e.g., "2025-12-09T00:00:00.000Z"
```

This ensures consistent date matching across timezones.

---

## Integration Example

### Frontend Service Call

```javascript
// From frontend/src/services/habitService.js
export const toggleHabitCompletion = async (habitId, completionIndex, isCompleted, token) => {
  const res = await axios.put(
    `${API_URL}/habits/${habitId}/completion/${completionIndex}`,
    { isCompleted },
    getAuthHeader(token)
  );
  return res.data; // Returns updated habit
};
```

### React Component Usage

```javascript
// From frontend/src/components/HabitTickBoxes.jsx
const handleCheckboxChange = async (tickBox, index) => {
  setLoading({ ...loading, [index]: true });
  
  try {
    const updatedHabit = await toggleHabitCompletion(
      habit._id,
      index,
      !tickBox.isCompleted,
      token
    );
    
    // Regenerate tick boxes from returned data
    const newTickBoxes = generateTickBoxes(habit.frequency, updatedHabit.completions);
    setTickBoxes(newTickBoxes);
    
    // Notify parent component
    if (onUpdate) {
      onUpdate(updatedHabit);
    }
  } catch (err) {
    setError('Failed to update completion status');
  } finally {
    setLoading({ ...loading, [index]: false });
  }
};
```

### Backend Controller

```javascript
// From backend/controllers/habitController.js
exports.toggleCompletion = async (req, res) => {
  const { isCompleted } = req.body;
  const { habitId, completionIndex } = req.params;

  const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
  
  // Generate tick boxes for current state
  const tickBoxes = generateTickBoxes(habit.frequency, habit.completions);
  const targetTickBox = tickBoxes[completionIndex];
  const targetDate = new Date(targetTickBox.date);
  targetDate.setHours(0, 0, 0, 0);

  // Find or create completion entry for this date
  const existingIndex = habit.completions.findIndex((c) => {
    const cDate = new Date(c.date);
    cDate.setHours(0, 0, 0, 0);
    return cDate.getTime() === targetDate.getTime();
  });

  if (existingIndex >= 0) {
    habit.completions[existingIndex].isCompleted = isCompleted;
  } else {
    habit.completions.push({
      date: targetDate.toISOString(),
      isCompleted,
      label: targetTickBox.label,
    });
  }

  await habit.save();
  res.json(habit);
};
```

---

## Backward Compatibility

- Existing habits without `completions` array will work fine
- The frontend will treat an empty `completions` array as all unchecked
- Old `progress` field in habits is ignored but not removed
- Migration can be done gradually without breaking existing functionality

---

## Rate Limiting Considerations

Each checkbox click triggers one API call. Consider implementing rate limiting:
- Multiple rapid clicks on same checkbox: Debounce on frontend
- User checking many boxes quickly: No special handling needed (database will queue)
- Production use: Consider Redis-based rate limiting if needed

---

## Security

- All endpoints require authentication via `authMiddleware`
- Users can only access/modify their own habits
- Completion index is validated (must be non-negative integer)
- Database queries filter by `userId` to prevent unauthorized access
