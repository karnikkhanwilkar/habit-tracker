import React, { useEffect, useState } from 'react';
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
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [localReminderEnabled, setLocalReminderEnabled] = useState(false);
  const [localReminderTime, setLocalReminderTime] = useState('');
  const [localReminderDays, setLocalReminderDays] = useState([]);
  const [localReminderMessage, setLocalReminderMessage] = useState('');

  useEffect(() => {
    setLocalReminderEnabled(!!habit.reminderEnabled);
    setLocalReminderTime(habit.reminderTime || '');
    setLocalReminderDays(habit.reminderDays || []);
    setLocalReminderMessage(habit.reminderMessage || '');
  }, [habit]);

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
    setLocalReminderEnabled(enabled);
  };

  const handleTimeChange = (time) => {
    setLocalReminderTime(time);
  };

  const handleDayToggle = (dayId) => {
    const updatedDays = localReminderDays.includes(dayId)
      ? localReminderDays.filter(d => d !== dayId)
      : [...localReminderDays, dayId];

    setLocalReminderDays(updatedDays);
  };

  const handleMessageChange = (message) => {
    setLocalReminderMessage(message);
  };

  const handleSaveReminderSettings = async () => {
    setSaveLoading(true);
    setSaveResult(null);

    try {
      await onUpdate({
        ...habit,
        reminderEnabled: localReminderEnabled,
        reminderTime: localReminderTime,
        reminderDays: localReminderDays,
        reminderMessage: localReminderMessage
      });
      setSaveResult({ success: true, message: 'Reminder settings saved.' });
    } catch (error) {
      setSaveResult({ success: false, message: 'Failed to save reminder settings.' });
    } finally {
      setSaveLoading(false);
    }

    setTimeout(() => setSaveResult(null), 5000);
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
              checked={localReminderEnabled}
              onChange={(e) => handleReminderToggle(e.target.checked)}
              color="primary"
            />
          }
          label="Enable email reminders"
          sx={{ mb: 2 }}
        />

        <Collapse in={localReminderEnabled}>
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
                value={localReminderTime || '09:00'}
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
                      color={localReminderDays.includes(day.id) ? 'primary' : 'default'}
                      variant={localReminderDays.includes(day.id) ? 'filled' : 'outlined'}
                      clickable
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                {localReminderDays.length > 0 
                  ? `Reminders will be sent on: ${localReminderDays.map(d => weekDays[d].full).join(', ')}`
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
                value={localReminderMessage}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Add a personal motivational message to your reminders..."
                fullWidth
                size="small"
              />
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                This message will be included in your reminder emails
              </Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <Button
                variant="contained"
                onClick={handleSaveReminderSettings}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Reminder Settings'}
              </Button>
              <Box display="flex" alignItems="center" gap={1}>
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
            </Box>

            {saveResult && (
              <Alert 
                severity={saveResult.success ? 'success' : 'error'} 
                sx={{ mb: 2 }}
                onClose={() => setSaveResult(null)}
              >
                {saveResult.message}
              </Alert>
            )}

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
            {localReminderEnabled && (
              <Card variant="outlined" sx={{ mt: 3, bgcolor: 'grey.50' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">
                    REMINDER PREVIEW
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Subject:</strong> ⏰ Time for your {habit.habitName} habit!
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Schedule:</strong> {localReminderTime || '09:00'} {
                      localReminderDays.length > 0 
                        ? `on ${localReminderDays.map(d => weekDays[d].short).join(', ')}`
                        : 'daily'
                    }
                  </Typography>
                  {localReminderMessage && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Custom message:</strong> "{localReminderMessage}"
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