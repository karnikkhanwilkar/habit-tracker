import React from 'react';
import { Box, Typography, Chip, Tooltip, Card, CardContent, Grid } from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

/**
 * 🔥 StreakBadge Component
 * Displays habit streak information with milestones
 */
const StreakBadge = ({ 
  currentStreak = 0,
  longestStreak = 0,
  isStreakActive = false,
  milestones = {},
  size = 'medium',
  showDetails = false 
}) => {
  const getStreakColor = (streak, isActive) => {
    if (!isActive || streak === 0) return 'default';
    if (streak >= 30) return 'success';
    if (streak >= 14) return 'warning';
    if (streak >= 7) return 'primary';
    return 'secondary';
  };

  const getMilestoneEmoji = (streak) => {
    if (streak >= 365) return '🏆';
    if (streak >= 100) return '💎';
    if (streak >= 60) return '🌟';
    if (streak >= 30) return '👑';
    if (streak >= 14) return '💪';
    if (streak >= 7) return '🔥';
    return '⭐';
  };

  if (!showDetails) {
    return (
      <Tooltip 
        title={`${currentStreak} day streak${isStreakActive ? ' (active)' : ''}`}
        arrow
      >
        <Chip
          icon={<WhatshotIcon />}
          label={`${currentStreak}${getMilestoneEmoji(currentStreak)}`}
          color={getStreakColor(currentStreak, isStreakActive)}
          size={size}
          variant={isStreakActive ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 'bold',
            '& .MuiChip-icon': {
              animation: isStreakActive && currentStreak > 0 ? 'pulse 2s infinite' : 'none',
            },
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Card elevation={2} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <WhatshotIcon 
                sx={{ 
                  color: isStreakActive ? '#ff6b35' : '#ccc',
                  animation: isStreakActive ? 'pulse 2s infinite' : 'none' 
                }} 
              />
              <Typography variant="h6" color="white">
                Current Streak
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="white">
              {currentStreak} {getMilestoneEmoji(currentStreak)}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              {isStreakActive ? 'Keep it going! 💪' : 'Start your streak today!'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <EmojiEventsIcon sx={{ color: '#ffd700' }} />
              <Typography variant="h6" color="white">
                Best Streak
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="white">
              {longestStreak}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Personal record
            </Typography>
          </Grid>

          {milestones?.current && (
            <Grid item xs={12}>
              <Box textAlign="center" mt={1}>
                <Typography variant="body1" color="white" fontWeight="bold">
                  🎉 {milestones.current.title}
                </Typography>
                {milestones.next && (
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Next milestone: {milestones.next.days} days {milestones.next.emoji}
                  </Typography>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StreakBadge;