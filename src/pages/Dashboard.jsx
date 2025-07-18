import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { getInventory } from '../services/api';
import DrugVerification from '../components/DrugVerification';
import TemperatureMonitor from '../components/TemperatureMonitor';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const response = await getInventory();
        setInventoryCount(response.data.length);
        
        // Count items expiring in next 30 days
        const expiring = response.data.filter(item => {
          const expDate = new Date(item.batch.expiration_date);
          const today = new Date();
          const diffTime = expDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30;
        });
        setExpiringSoon(expiring.length);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };
    
    fetchInventoryData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Inventory Items</Typography>
            <Typography variant="h3">{inventoryCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Expiring Soon (30 days)</Typography>
            <Typography variant="h3" color="error">{expiringSoon}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Your Role</Typography>
            <Typography variant="h3" textTransform="capitalize">
              {user?.role || 'Guest'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DrugVerification />
        </Grid>
        <Grid item xs={12} md={6}>
          <TemperatureMonitor locationId={1} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;