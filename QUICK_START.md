# Quick Start Guide: Interactive Habit Tick Boxes

## Installation & Setup

### No Additional Dependencies Needed
The implementation uses existing dependencies already in your project:
- React & Material-UI (frontend)
- Express & Mongoose (backend)

### What to Do

1. **Database Migration** (Optional but recommended)
   - Existing habits will work fine - the `completions` array will be empty initially
   - Old habits with progress percentages will continue to work
   - All new habits will use the tick box system

2. **Restart Services**
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

## How to Use

### Creating a Habit
1. Go to Dashboard
2. Enter habit name (e.g., "Morning Exercise")
3. Select frequency:
   - **Daily**: Track daily completion for 30 days ahead
   - **Weekly**: Track weekly completion for 12 weeks ahead
   - **Monthly**: Track monthly completion for 12 months ahead
4. Click "Add"

### Checking Off Completions
1. Once created, the habit card displays tick boxes
2. Click checkbox to mark as complete (turns green with strike-through)
3. Changes save automatically to the backend
4. Refresh page - completions persist!

### Viewing Progress
- **Daily**: See a calendar-like view of the next 30 days
- **Weekly**: See upcoming 12 weeks with week numbers
- **Monthly**: See upcoming 12 months with month names
- Checkmarks show at a glance which periods are complete

## File Structure

```
habit-tracker/
├── backend/
│   ├── models/
│   │   └── Habit.js                    (Updated: added completions schema)
│   ├── controllers/
│   │   └── habitController.js          (Updated: added toggleCompletion)
│   ├── routes/
│   │   └── habitRoutes.js              (Updated: added completion route)
│   └── utils/
│       └── tickBoxUtils.js             (New: tick box generation logic)
│
└── frontend/
    └── src/
        ├── components/
        │   └── HabitTickBoxes.jsx       (New: tick box UI component)
        ├── pages/
        │   └── Dashboard.jsx            (Updated: removed +10%, added tick boxes)
        ├── services/
        │   └── habitService.js          (Updated: added toggleCompletion)
        └── utils/
            └── tickBoxUtils.js          (New: frontend tick box utilities)
```

## API Endpoint Reference

### New Endpoint
```
PUT /api/habits/:habitId/completion/:completionIndex
Body: { isCompleted: boolean }
Response: Updated habit object with completions array
```

### Modified Endpoint
```
POST /api/habits
Body: { habitName: string, frequency: 'daily'|'weekly'|'monthly'|'custom' }
Note: No longer requires 'progress' field
```

## Data Structure

### Habit Document
```javascript
{
  _id: ObjectId,
  habitName: "Morning Exercise",
  frequency: "daily",
  userId: ObjectId,
  completions: [
    {
      date: "2025-12-09T00:00:00.000Z",
      isCompleted: true,
      label: "Tue, Dec 09"
    },
    {
      date: "2025-12-10T00:00:00.000Z",
      isCompleted: false,
      label: "Wed, Dec 10"
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Testing Checklist

- [ ] Create daily habit - see 30 days of tick boxes
- [ ] Create weekly habit - see 12 weeks of tick boxes
- [ ] Create monthly habit - see 12 months of tick boxes
- [ ] Click tick boxes - they turn green with strike-through
- [ ] Refresh page - completions still visible
- [ ] Delete habit - confirms deletion with dialog
- [ ] Check multiple frequencies work independently
- [ ] Multiple users see only their habits

## Troubleshooting

### Tick boxes not loading
- Check browser console for errors
- Verify backend is running on correct port
- Check VITE_API_URL environment variable

### Completions not persisting
- Check network tab - PUT request should return 200
- Verify MongoDB connection
- Check backend logs for errors

### Wrong dates showing
- Frontend and backend use same date logic
- Daily: Uses current date at midnight
- Weekly: Uses Monday of current week
- Monthly: Uses 1st of current month

## Future Enhancements

- Streak counting (consecutive completions)
- Habit statistics/charts
- Habit categories/tags
- Notifications/reminders
- Export completion data
- Custom frequency patterns
