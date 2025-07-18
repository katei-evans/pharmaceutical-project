import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  Alert,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from '@mui/material';
import { api } from '../services/api';

const TemperatureMonitor = ({ locationId }) => {
  const [tempData, setTempData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemperatureData = async () => {
      try {
        const response = await api.get(`/iot/temperature/${locationId}`);
        setTempData(response.data);
      } catch (err) {
        setError('Failed to load temperature data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemperatureData();
    
    // Set up polling every 5 minutes
    const interval = setInterval(fetchTemperatureData, 300000);
    return () => clearInterval(interval);
  }, [locationId]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  // Prepare chart data
  const chartData = tempData.temperature_history
    .map(item => ({
      time: new Date(item.time).toLocaleTimeString(),
      temperature: item.temperature
    }))
    .reverse();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Temperature Monitoring
      </Typography>
      
      {tempData.is_alert && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Temperature out of range! Current: {tempData.current_temperature}°C
          (Range: {tempData.min_threshold}°C - {tempData.max_threshold}°C)
        </Alert>
      )}
      
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis 
              domain={[tempData.min_threshold - 2, tempData.max_threshold + 2]}
              label={{ value: '°C', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Last updated: {new Date(tempData.timestamp).toLocaleString()}
      </Typography>
    </Paper>
  );
};

export default TemperatureMonitor;