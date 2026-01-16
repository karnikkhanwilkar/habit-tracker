import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { getHabitStats, getHabits } from '../services/habitService';
import { 
  CompletionTrendChart, 
  MonthlyPerformanceChart, 
  SuccessRateChart, 
  StatsSummaryCards,
  TopPerformers 
} from '../components/AnalyticsCharts.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * 📊 Analytics Page
 * Displays comprehensive statistics and charts for habits
 */
const Analytics = () => {
  const { habitId } = useParams();
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(habitId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    if (selectedHabit) {
      loadStats(selectedHabit);
    }
  }, [selectedHabit]);

  const loadHabits = async () => {
    try {
      const data = await getHabits(token);
      setHabits(data);
      if (data.length > 0 && !selectedHabit) {
        setSelectedHabit(data[0]._id);
      }
    } catch (err) {
      setError('Failed to load habits');
    }
  };

  const loadStats = async (habitId) => {
    if (!habitId) return;
    
    setLoading(true);
    try {
      const data = await getHabitStats(habitId, token);
      setStats(data);
      setError('');
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const selectedHabitData = habits.find(h => h._id === selectedHabit);

  if (habits.length === 0) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="info">
          <Typography variant="h6">No Habits Found</Typography>
          <Typography>Create some habits first to view analytics!</Typography>
          <MuiLink component={Link} to="/dashboard" sx={{ mt: 1, display: 'block' }}>
            Go to Dashboard
          </MuiLink>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} to="/dashboard" color="inherit">
            <ArrowBackIcon sx={{ mr: 1, fontSize: 20 }} />
            Dashboard
          </MuiLink>
          <Typography color="textPrimary">Analytics</Typography>
        </Breadcrumbs>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          📊 Habit Analytics
        </Typography>
        
        {habits.length > 1 && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Habit</InputLabel>
            <Select
              value={selectedHabit}
              onChange={(e) => setSelectedHabit(e.target.value)}
              label="Select Habit"
            >
              {habits.map((habit) => (
                <MenuItem key={habit._id} value={habit._id}>
                  {habit.habitName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={60} />
        </Box>
      ) : stats ? (
        <Box>
          {/* Habit Header */}
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" color="white" fontWeight="bold">
                  {stats.habitName}
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.8)">
                  {stats.frequency.charAt(0).toUpperCase() + stats.frequency.slice(1)} habit
                  {stats.overview.bestDayOfWeek && (
                    <> • Best day: {stats.overview.bestDayOfWeek}</>
                  )}
                </Typography>
              </Box>
              <StreakBadge
                currentStreak={selectedHabitData?.currentStreak || 0}
                longestStreak={selectedHabitData?.longestStreak || 0}
                isStreakActive={(selectedHabitData?.currentStreak || 0) > 0}
                showDetails={true}
              />
            </Box>
          </Paper>

          {/* Summary Statistics Cards */}
          <Box mb={3}>
            <StatsSummaryCards stats={stats} />
          </Box>

          {/* Charts Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <CompletionTrendChart 
                data={stats.chartData?.completionTrend || []} 
                title="Weekly Progress Trend"
              />
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <SuccessRateChart 
                completionRate={stats.overview.overallPercentage}
                title="Overall Success Rate"
              />
            </Grid>

            <Grid item xs={12}>
              <MonthlyPerformanceChart 
                data={stats.chartData?.monthlyBars || []} 
                title="Monthly Performance Breakdown"
              />
            </Grid>
          </Grid>

          {/* Additional Insights */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>📈 Insights & Recommendations</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Performance Summary
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    You've completed <strong>{stats.overview.completedDays}</strong> out of{' '}
                    <strong>{stats.overview.totalDays}</strong> total days ({stats.overview.overallPercentage}% success rate).
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Your current streak of <strong>{stats.overview.currentStreak}</strong> days{' '}
                    {stats.overview.currentStreak === stats.overview.longestStreak ? 
                      'matches your best performance!' : 
                      `is working toward your best of ${stats.overview.longestStreak} days.`
                    }
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Recent Trends
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Last 7 days: <strong>{stats.timeFrames.last7Days}%</strong> completion rate
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Last 30 days: <strong>{stats.timeFrames.last30Days}%</strong> completion rate
                  </Typography>
                  {stats.timeFrames.last7Days > stats.timeFrames.last30Days ? (
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      📈 You're improving! Keep up the great work!
                    </Typography>
                  ) : stats.timeFrames.last7Days < stats.timeFrames.last30Days ? (
                    <Typography variant="body2" color="warning.main" fontWeight="bold">
                      📉 Recent dip detected. Let's get back on track!
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="info.main" fontWeight="bold">
                      📊 Maintaining steady progress!
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      ) : null}
    </Container>
  );
};

export default Analytics;