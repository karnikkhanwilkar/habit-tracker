import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Stack } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { generateTickBoxes } from '../utils/tickBoxUtils';
import { toggleHabitCompletion } from '../services/habitService';
import { useAuth } from './AuthContext.jsx';
import StyledCheckbox from './StyledCheckbox.jsx';

/**
 * HabitTickBoxes Component
 * Displays interactive tick boxes for habit completion tracking
 * Based on frequency: daily (30 days), weekly (12 weeks), or monthly (12 months)
 */
const HabitTickBoxes = ({ habit, onUpdate, rangeFromCreated = false, futureDays = 7 }) => {
  const { token } = useAuth();
  const [tickBoxes, setTickBoxes] = useState([]);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');

  // Generate tick boxes when habit loads or frequency changes
  const buildOptions = () => {
    if (!rangeFromCreated) return undefined;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + futureDays);
    return {
      startDate: habit.createdAt,
      endDate
    };
  };

  useEffect(() => {
    const options = buildOptions();
    const boxes = generateTickBoxes(habit.frequency, habit.completions || [], options || undefined);
    setTickBoxes(boxes);
  }, [habit._id, habit.frequency, habit.completions, habit.createdAt, rangeFromCreated, futureDays]);

  const handleCheckboxChange = async (tickBox, index) => {
    // Don't allow changes to locked (future) or missed (past uncompleted) tick boxes
    if (tickBox.isLocked || tickBox.isMissed) {
      return;
    }

    setLoading({ ...loading, [index]: true });
    setError('');

    try {
      const updatedHabit = await toggleHabitCompletion(
        habit._id,
        index,
        !tickBox.isCompleted,
        token
      );

      // Update local state with new completion data
      const options = buildOptions();
      const newTickBoxes = generateTickBoxes(habit.frequency, updatedHabit.completions || [], options || undefined);
      setTickBoxes(newTickBoxes);

      // Notify parent component of update
      if (onUpdate) {
        onUpdate(updatedHabit);
      }
    } catch (err) {
      setError('Failed to update completion status');
      console.error('Error toggling completion:', err);
    } finally {
      setLoading({ ...loading, [index]: false });
    }
  };

  if (!tickBoxes.length) {
    return <Alert severity="info">No tick boxes available</Alert>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'stretch',
        }}
      >
        {tickBoxes.map((tickBox, index) => (
          <Box
            key={`${tickBox.date}-${index}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              flex: '0 0 auto',
              minWidth: 50,
            }}
          >
            <Box 
              sx={{ 
                position: 'relative', 
                height: 30, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '10px',
                backgroundColor: tickBox.isMissed ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                padding: '2px',
              }}
            >
              <Box sx={{ 
                opacity: tickBox.isLocked || tickBox.isMissed ? 0.4 : 1, 
                transition: 'opacity 0.2s' 
              }}>
                <StyledCheckbox
                  checked={tickBox.isCompleted}
                  onChange={() => handleCheckboxChange(tickBox, index)}
                  disabled={loading[index] || tickBox.isLocked || tickBox.isMissed}
                />
              </Box>
              {tickBox.isLocked && (
                <LockIcon
                  sx={{
                    position: 'absolute',
                    fontSize: '1.2rem',
                    color: '#999',
                  }}
                />
              )}
              {tickBox.isMissed && (
                <Box
                  sx={{
                    position: 'absolute',
                    fontSize: '1.5rem',
                    color: '#f44336',
                    fontWeight: 'bold',
                  }}
                >
                  ✕
                </Box>
              )}
              {loading[index] && (
                <CircularProgress
                  size={16}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
            </Box>
            <Box
              sx={{
                fontSize: '0.7rem',
                textAlign: 'center',
                maxWidth: 50,
                wordBreak: 'break-word',
                color: tickBox.isCompleted ? '#4caf50' : tickBox.isMissed ? '#f44336' : tickBox.isLocked ? '#999' : 'text.secondary',
                textDecoration: tickBox.isCompleted ? 'line-through' : 'none',
                fontWeight: tickBox.isCompleted || tickBox.isMissed ? 'bold' : 'normal',
                transition: 'all 0.3s ease',
                lineHeight: 1.2,
                mt: 0.5,
              }}
            >
              {tickBox.label}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default HabitTickBoxes;
