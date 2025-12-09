# Quick Reference Card

## 🚀 Quick Start (30 seconds)

```bash
# Terminal 1
cd backend && npm start

# Terminal 2  
cd frontend && npm run dev

# Open http://localhost:5173
# Create a habit → See tick boxes → Click to check off
```

---

## 📁 Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `HabitTickBoxes.jsx` | Main UI component | 126 |
| `tickBoxUtils.js` (frontend) | Date calculations | 160+ |
| `tickBoxUtils.js` (backend) | Server date logic | 160+ |
| `Dashboard.jsx` | Updated dashboard | 110 |
| `habitController.js` | New toggleCompletion | ~90 additions |
| `habitRoutes.js` | New API route | ~8 lines |
| `Habit.js` | Updated schema | +10 lines |

---

## 🔄 Component Tree

```
App
└── Dashboard
    ├── useAuth() → token
    ├── useState(habits)
    ├── getHabits() on mount
    └── Grid of Cards
        └── Card (for each habit)
            ├── Habit name
            ├── Frequency
            └── HabitTickBoxes ← NEW
                ├── generateTickBoxes()
                ├── 30/12/12 Checkboxes
                └── toggleHabitCompletion() API
```

---

## 🎨 Tick Box Generation

| Frequency | Count | Period | Label Format |
|-----------|-------|--------|--------------|
| Daily | 30 | Days | "Tue, Dec 09" |
| Weekly | 12 | Weeks | "Week 50, 2025" |
| Monthly | 12 | Months | "December 2025" |

---

## 🔌 API Endpoint

### New Endpoint
```
PUT /api/habits/:habitId/completion/:completionIndex

Request:  { isCompleted: true/false }
Response: { habit object with completions array }
```

### Request Example
```bash
curl -X PUT http://localhost:5000/api/habits/123/completion/0 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"isCompleted": true}'
```

---

## 💾 Data Structure

```javascript
// Completion Object
{
  date: "2025-12-09T00:00:00.000Z",      // Midnight UTC
  isCompleted: true,                      // Boolean
  label: "Tue, Dec 09"                    // Display text
}

// Full Habit
{
  _id: ObjectId,
  habitName: "Morning Run",
  frequency: "daily",
  userId: ObjectId,
  completions: [{ date, isCompleted, label }, ...],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🎯 State Flow

```
User clicks checkbox
    ↓
setLoading[index] = true
    ↓
toggleHabitCompletion(habitId, index, newValue)
    ↓
PUT /habits/{id}/completion/{index}
    ↓
Backend: map index → date → update/create completion
    ↓
Save to MongoDB
    ↓
Return updated habit
    ↓
setTickBoxes(generateTickBoxes(frequency, completions))
    ↓
setLoading[index] = false
    ↓
UI updates: ☑ Green checkbox
```

---

## 🎬 Visual States

| State | Appearance |
|-------|-----------|
| **Unchecked** | ☐ Gray text, empty box |
| **Checked** | ☑ Green box, green strikethrough text |
| **Loading** | ⟳ Spinner appears |
| **Error** | ⚠️ Red alert message |

---

## 📱 Responsive Breakpoints

```javascript
// From Material-UI Grid
xs={12}  // Full width on all devices
         // (changed from sm={6} md={4})
```

Result: Cards stack vertically on mobile, better for tick boxes

---

## 🔐 Security Checklist

```javascript
// All routes require auth
router.use(auth);  ← Validates JWT token

// Users can only access their habits
{ _id: habitId, userId: req.user.id }

// Completion index validated
param('completionIndex').isInt({ min: 0 })

// Input validation
body('isCompleted').isBoolean()
```

---

## ⚡ Performance Notes

- ✅ No new npm dependencies
- ✅ Tick boxes cached in component state
- ✅ Debounce not needed (single click = one API call)
- ✅ Minimal re-renders (controlled via useEffect)
- ✅ Database queries indexed by userId

---

## 🧪 Test Cases

```javascript
// Create daily habit
POST /habits → { habitName, frequency: "daily" }
// Expect: 30 empty checkboxes

// Toggle completion
PUT /habits/{id}/completion/0 → { isCompleted: true }
// Expect: Checkbox 0 becomes checked

// Persist
GET /habits
// Expect: completions array has entry for today

// Weekly habit
POST /habits → { habitName, frequency: "weekly" }
// Expect: 12 checkboxes with week numbers

// Monthly habit
POST /habits → { habitName, frequency: "monthly" }
// Expect: 12 checkboxes with month names
```

---

## 🐛 Debug Commands

```javascript
// In browser console to inspect habit
window.localStorage  // Check token if needed
// Or in HabitTickBoxes component:
console.log('tickBoxes:', tickBoxes);
console.log('habit.completions:', habit.completions);

// Backend logging
// Check controller logs when toggling
console.error('Toggle completion error:', error);
```

---

## 📋 Deprecation Notice

These are no longer used:

```javascript
// OLD - No longer needed:
progress: 0         // On habits
"+10%" button      // On dashboard  
bumpProgress()     // Function
LinearProgress     // Component
```

---

## 🔄 Backward Compatibility

```javascript
// Old habits still work:
{
  habitName: "Old Habit",
  frequency: "daily",
  progress: 50        // ← Ignored but not removed
  // Missing completions? Treated as []
}

// Migration not needed - gradual transition works fine
```

---

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tick boxes not showing | Check console, verify API URL |
| Can't save completion | Check network tab, verify token |
| Wrong dates | Both frontend/backend use UTC |
| Page refresh loses data | Verify MongoDB save, check logs |
| Multiple users see same data | Check userId filtering in query |

---

## 📚 Documentation Map

```
Root directory:
├── IMPLEMENTATION_COMPLETE.md ← Start here!
├── QUICK_START.md             ← Setup & usage
├── API_DOCUMENTATION.md       ← API details
├── VISUAL_GUIDE.md            ← Examples & diagrams
├── IMPLEMENTATION_SUMMARY.md  ← Technical overview
└── FILE_CHANGES.md            ← Detailed changes
```

---

## ⌨️ Keyboard Navigation (Future Enhancement)

Not implemented yet, but could add:
- Tab to cycle through checkboxes
- Space to toggle checkbox
- Ctrl+Enter to save all changes

---

## 📊 Metrics

- **Lines of new code:** ~400
- **Lines modified:** ~50
- **New API endpoints:** 1
- **New components:** 1
- **New utility files:** 2
- **Database schema changes:** 1 field addition
- **Breaking changes:** 0
- **New dependencies:** 0

---

## 🎓 Learning Resources

Inside the code:
- Detailed comments in `HabitTickBoxes.jsx`
- JSDoc comments in `tickBoxUtils.js`
- Route validation examples in `habitRoutes.js`
- Controller logic in `habitController.js`

---

**Last Updated:** December 9, 2025
**Status:** ✅ Production Ready
**Backward Compatible:** Yes
**Tested:** Yes
