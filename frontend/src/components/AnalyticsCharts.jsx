import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Grid, Box, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * 📊 Analytics Charts Component
 * Displays various habit analytics and statistics
 */

// Color palette for charts
const COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  warning: '#ed6c02',
  info: '#0288d1',
  completed: '#4caf50',
  missed: '#f44336'
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.info];

/**
 * Completion Trend Line Chart
 */
export const CompletionTrendChart = ({ data, title = "Weekly Completion Trend" }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Typography color="textSecondary">No data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={(label) => `Week: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="percentage" 
              stroke={COLORS.primary} 
              strokeWidth={3}
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Monthly Performance Bar Chart
 */
export const MonthlyPerformanceChart = ({ data, title = "Monthly Performance" }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Typography color="textSecondary">No data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill={COLORS.completed} name="Completed" />
            <Bar dataKey="missed" fill={COLORS.missed} name="Missed" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Success Rate Donut Chart
 */
export const SuccessRateChart = ({ completionRate, title = "Success Rate" }) => {
  const data = [
    { name: 'Completed', value: completionRate, color: COLORS.completed },
    { name: 'Missed', value: 100 - completionRate, color: COLORS.missed }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <Box textAlign="center" mt={2}>
          <Typography variant="h4" component="div" fontWeight="bold" color={COLORS.primary}>
            {completionRate}%
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Overall Success Rate
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Statistics Summary Cards
 */
export const StatsSummaryCards = ({ stats }) => {
  if (!stats) return null;

  const { overview, timeFrames } = stats;

  const summaryCards = [
    {
      title: 'Total Days',
      value: overview.totalDays,
      subtitle: `${overview.completedDays} completed`,
      color: COLORS.info
    },
    {
      title: 'Current Streak',
      value: `${overview.currentStreak} 🔥`,
      subtitle: `Best: ${overview.longestStreak}`,
      color: COLORS.warning
    },
    {
      title: 'Last 7 Days',
      value: `${timeFrames.last7Days}%`,
      subtitle: 'Completion rate',
      color: timeFrames.last7Days >= 70 ? COLORS.success : COLORS.secondary,
      trend: timeFrames.last7Days >= timeFrames.last30Days ? 'up' : 'down'
    },
    {
      title: 'Last 30 Days',
      value: `${timeFrames.last30Days}%`,
      subtitle: 'Completion rate',
      color: timeFrames.last30Days >= 70 ? COLORS.success : COLORS.secondary
    }
  ];

  return (
    <Grid container spacing={2}>
      {summaryCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ background: `linear-gradient(135deg, ${card.color}22 0%, ${card.color}11 100%)` }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color={card.color}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {card.subtitle}
                  </Typography>
                </Box>
                {card.trend && (
                  <Box>
                    {card.trend === 'up' ? 
                      <TrendingUpIcon sx={{ color: COLORS.success }} /> :
                      <TrendingDownIcon sx={{ color: COLORS.secondary }} />
                    }
                  </Box>
                )}
              </Box>
              <Typography variant="caption" fontWeight="bold" sx={{ mt: 1, display: 'block' }}>
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Top Performers List
 */
export const TopPerformers = ({ performers, title = "Top Performing Habits" }) => {
  if (!performers || performers.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Typography color="textSecondary">No habits to display</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        {performers.map((habit, index) => (
          <Box 
            key={habit.id} 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
            py={1}
            borderBottom={index < performers.length - 1 ? 1 : 0}
            borderColor="divider"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                label={index + 1} 
                size="small" 
                color={index === 0 ? 'warning' : 'default'}
                sx={{ fontWeight: 'bold' }}
              />
              <Typography variant="body1">{habit.name}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold">
                {habit.completion}%
              </Typography>
              {habit.streak > 0 && (
                <Chip 
                  label={`🔥 ${habit.streak}`} 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};