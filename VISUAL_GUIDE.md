# Interactive Habit Tick Boxes - Visual Guide

## Before vs After

### BEFORE (Old System)
```
+-------------------+
| Morning Run       |
| Frequency: Daily  |
|                   |
| [==========> ] 40%|
|                   |
| [+10%] [Edit] [X] |
+-------------------+
```

**Issues:**
- Abstract percentage doesn't reflect real habits
- No time awareness
- Single "+10%" button not meaningful
- No visual timeline

### AFTER (New System)
```
+────────────────────────────────────────────────────+
| Morning Run                                        |
| Frequency: Daily                                   |
|                                                    |
| ☐ Tue   ☐ Wed   ☑ Thu   ☑ Fri   ☐ Sat   ☑ Sun   |
| Dec 9  Dec 10  Dec 11  Dec 12  Dec 13  Dec 14   |
|                                                    |
| ☐ Mon   ☑ Tue   ☐ Wed   ☐ Thu   ...             |
| Dec 15  Dec 16  Dec 17  Dec 18                    |
|                                                    |
| [Edit] [Delete]                                   |
+────────────────────────────────────────────────────+
```

**Improvements:**
✓ Visual timeline of completions
✓ Date-specific tracking
✓ Satisfying visual feedback (checkmarks turn green)
✓ Extends automatically into future
✓ Shows clear patterns

## Frequency Examples

### Daily Habit
```
Create: "Read for 30 minutes"
Frequency: Daily
Display: 30 checkboxes (today + 29 days ahead)

☑ Tue    ☑ Wed    ☐ Thu    ☐ Fri    ☐ Sat    ☐ Sun
Dec 9    Dec 10   Dec 11   Dec 12   Dec 13   Dec 14

☐ Mon    ☑ Tue    ☐ Wed    ☐ Thu    ☐ Fri    ☐ Sat
Dec 15   Dec 16   Dec 17   Dec 18   Dec 19   Dec 20

...continues 12 more days...
```

**Best for:** Daily activities, small habits, building streaks

### Weekly Habit
```
Create: "Team Meeting"
Frequency: Weekly
Display: 12 checkboxes (current week + 11 weeks ahead)

☑ Week 50  ☐ Week 51  ☐ Week 52  ☑ Week 1  ☐ Week 2
2025       2025       2025       2026       2026

☐ Week 3   ☐ Week 4   ☑ Week 5   ☐ Week 6  ☐ Week 7
2026       2026       2026       2026      2026

...continues 5 more weeks...
```

**Best for:** Weekly recurring tasks, meetings, weekly goals

### Monthly Habit
```
Create: "Budget Review"
Frequency: Monthly
Display: 12 checkboxes (current month + 11 months ahead)

☑ December   ☐ January    ☐ February   ☑ March      ☐ April
2025         2026         2026         2026         2026

☐ May        ☐ June       ☑ July       ☐ August     ☐ September
2026         2026         2026         2026         2026

...continues 3 more months...
```

**Best for:** Monthly tasks, reviews, major projects

## Visual States

### Unchecked Box
```
☐ Mon Dec 16   (Gray text, empty checkbox)
```

### Checked Box
```
☑ Mon Dec 16   (Green text with strikethrough, filled checkbox)
```

### Hover State
```
[☐ Mon Dec 16] (Slightly highlighted on hover)
```

### Loading
```
☐ Mon Dec 16   (Circular spinner appears while saving)
⟳ 
```

## User Interaction Flow

```
1. User creates habit "Meditate 10min"
   └─ Selects "Daily"
   └─ Submits form
      └─ Backend creates habit with empty completions array
      └─ Frontend displays 30 checkboxes starting today
         
2. User checks Monday
   └─ Component sends: PUT /habits/{id}/completion/0 {isCompleted: true}
   └─ Backend finds/creates completion for Monday
   └─ Saves to database
   └─ Returns updated habit
      └─ Frontend checkbox turns green with strikethrough
      
3. User refreshes page
   └─ Frontend loads habits
   └─ Monday checkbox is still checked (persisted!)
   └─ All other data in completions array is restored
```

## Data Persistence Example

### First Load
```javascript
{
  habitName: "Meditate 10min",
  frequency: "daily",
  completions: []  // Empty initially
}
```

### After checking Day 1
```javascript
{
  habitName: "Meditate 10min",
  frequency: "daily",
  completions: [
    {
      date: "2025-12-09T00:00:00.000Z",
      isCompleted: true,
      label: "Tue, Dec 09"
    }
  ]
}
```

### After checking Day 3
```javascript
{
  habitName: "Meditate 10min",
  frequency: "daily",
  completions: [
    {
      date: "2025-12-09T00:00:00.000Z",
      isCompleted: true,
      label: "Tue, Dec 09"
    },
    {
      date: "2025-12-11T00:00:00.000Z",
      isCompleted: true,
      label: "Thu, Dec 11"
    }
  ]
}
```

**Page refresh:** All completions reload automatically!

## Component Architecture

```
Dashboard.jsx
├─ useAuth() hook (gets token, user)
├─ useState for habits
├─ getHabits() on mount
├─ Maps each habit to a Card
│  └─ HabitTickBoxes.jsx
│     ├─ Receives: habit, onUpdate callback
│     ├─ generateTickBoxes() on mount/frequency change
│     ├─ Renders 30/12/12 checkboxes based on frequency
│     └─ handleCheckboxChange()
│        └─ toggleHabitCompletion() API call
│           └─ Updates state and parent via callback
└─ ConfirmDialog for delete
```

## Network Request Examples

### Toggle Completion
```
PUT /api/habits/507f1f77bcf86cd799439011/completion/0

Request:
{
  "isCompleted": true
}

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "habitName": "Morning Run",
  "frequency": "daily",
  "completions": [
    {
      "date": "2025-12-09T00:00:00.000Z",
      "isCompleted": true,
      "label": "Tue, Dec 09"
    }
  ]
}
```

## Automatic Timeline Extension

### On December 9, 2025
Daily habit shows days 9-38 of December + first days of January

### On January 10, 2026
Daily habit now shows days 10-31 of January + early February
(Old days automatically drop off from display)

### Monthly Habit Behavior
Always shows current month + next 11 months
- In December 2025: Dec 2025 - Nov 2026
- In January 2026: Jan 2026 - Dec 2026
- And so on...

## Mobile Responsiveness

The tick box display is fully responsive:
- **Desktop**: All checkboxes in neat grid
- **Tablet**: Checkboxes wrap with good spacing
- **Mobile**: Checkboxes stack with readable labels

Labels are small but readable on all screen sizes.
