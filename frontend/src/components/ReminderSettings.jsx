import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  TextField,
  Button,
  Chip,
  Grid,
  Alert,
  FormControlLabel,
  Collapse,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/**
 * ⏰ Reminder Settings Component
 * Handles all reminder configuration for a habit
 */
const ReminderSettings = ({ 
  habit, 
  onUpdate, 
  onTestReminder 
}) => {
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const weekDays = [
    { id: 0, short: 'Sun', full: 'Sunday' },
    { id: 1, short: 'Mon', full: 'Monday' },
    { id: 2, short: 'Tue', full: 'Tuesday' },
    { id: 3, short: 'Wed', full: 'Wednesday' },
    { id: 4, short: 'Thu', full: 'Thursday' },
    { id: 5, short: 'Fri', full: 'Friday' },
    { id: 6, short: 'Sat', full: 'Saturday' }
  ];

  const handleReminderToggle = (enabled) => {
    onUpdate({
      ...habit,
      reminderEnabled: enabled
    });
  };

  const handleTimeChange = (time) => {
    onUpdate({
      ...habit,
      reminderTime: time
    });
  };

  const handleDayToggle = (dayId) => {
    const reminderDays = habit.reminderDays || [];
    const updatedDays = reminderDays.includes(dayId)
      ? reminderDays.filter(d => d !== dayId)
      : [...reminderDays, dayId];

    onUpdate({
      ...habit,
      reminderDays: updatedDays
    });
  };

  const handleMessageChange = (message) => {
    onUpdate({
      ...habit,
      reminderMessage: message
    });
  };

  const handleTestReminder = async () => {
    setTestLoading(true);
    setTestResult(null);

    try {
      await onTestReminder(habit._id);
      setTestResult({ success: true, message: 'Test reminder sent successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to send test reminder.' });
    } finally {
      setTestLoading(false);
    }

    // Clear result after 5 seconds
    setTimeout(() => setTestResult(null), 5000);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <NotificationsIcon color="primary" />
          <Typography variant="h6">⏰ Reminder Settings</Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={habit.reminderEnabled || false}
              onChange={(e) => handleReminderToggle(e.target.checked)}
              color="primary"
            />
          }
          label="Enable email reminders"
          sx={{ mb: 2 }}
        />

        <Collapse in={habit.reminderEnabled}>
          <Box>
            <Divider sx={{ mb: 3 }} />
            
            {/* Reminder Time */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccessTimeIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2">Reminder Time</Typography>
              </Box>
              <TextField
                type="time"
                value={habit.reminderTime || '09:00'}
                onChange={(e) => handleTimeChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                Choose when you'd like to receive reminder emails
              </Typography>
            </Box>

            {/* Reminder Days */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CalendarTodayIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2">Reminder Days</Typography>
              </Box>
              <Grid container spacing={1}>
                {weekDays.map((day) => (
                  <Grid item key={day.id}>
                    <Chip
                      label={day.short}
                      onClick={() => handleDayToggle(day.id)}
                      color={(habit.reminderDays || []).includes(day.id) ? 'primary' : 'default'}
                      variant={(habit.reminderDays || []).includes(day.id) ? 'filled' : 'outlined'}
                      clickable
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                {habit.reminderDays?.length > 0 
                  ? `Reminders will be sent on: ${habit.reminderDays.map(d => weekDays[d].full).join(', ')}`
                  : 'Select which days to receive reminders (leave empty for daily)'
                }
              </Typography>
            </Box>

            {/* Custom Message */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Custom Message (Optional)
              </Typography>
              <TextField
                multiline
                rows={3}
                value={habit.reminderMessage || ''}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Add a personal motivational message to your reminders..."
                fullWidth
                size="small"
              />
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                This message will be included in your reminder emails
              </Typography>
            </Box>

            {/* Test Reminder */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="textSecondary">
                Test your reminder settings
              </Typography>
              <Tooltip title="Send a test reminder email now">
                <IconButton
                  onClick={handleTestReminder}
                  disabled={testLoading}
                  color="primary"
                  size="small"
                >
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {testResult && (
              <Alert 
                severity={testResult.success ? 'success' : 'error'} 
                sx={{ mt: 2 }}
                onClose={() => setTestResult(null)}
              >
                {testResult.message}
              </Alert>
            )}

            {/* Reminder Preview */}
            {habit.reminderEnabled && (
              <Card variant="outlined" sx={{ mt: 3, bgcolor: 'grey.50' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">
                    REMINDER PREVIEW
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Subject:</strong> ⏰ Time for your {habit.habitName} habit!
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Schedule:</strong> {habit.reminderTime || '09:00'} {
                      habit.reminderDays?.length > 0 
                        ? `on ${habit.reminderDays.map(d => weekDays[d].short).join(', ')}`
                        : 'daily'
                    }
                  </Typography>
                  {habit.reminderMessage && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Custom message:</strong> "{habit.reminderMessage}"
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ReminderSettings;