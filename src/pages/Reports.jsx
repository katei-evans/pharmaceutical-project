import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField,
  MenuItem
} from '@mui/material';
import { api } from '../services/api';

const Reports = () => {
  const [expiringDrugs, setExpiringDrugs] = useState([]);
  const [daysThreshold, setDaysThreshold] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpiringDrugs = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/inventory/expiring?days=${daysThreshold}`);
        setExpiringDrugs(response.data);
      } catch (error) {
        console.error('Error fetching expiring drugs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpiringDrugs();
  }, [daysThreshold]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            Expiring Drugs Report
          </Typography>
          <TextField
            select
            label="Days Threshold"
            value={daysThreshold}
            onChange={(e) => setDaysThreshold(e.target.value)}
            size="small"
            sx={{ width: 120 }}
          >
            <MenuItem value={7}>7 days</MenuItem>
            <MenuItem value={30}>30 days</MenuItem>
            <MenuItem value={60}>60 days</MenuItem>
            <MenuItem value={90}>90 days</MenuItem>
          </TextField>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Drug Name</TableCell>
                <TableCell>Batch Number</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Expiration Date</TableCell>
                <TableCell>Days Until Expiry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : expiringDrugs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No drugs expiring within {daysThreshold} days
                  </TableCell>
                </TableRow>
              ) : (
                expiringDrugs.map((drug, index) => (
                  <TableRow key={index}>
                    <TableCell>{drug.drug_name}</TableCell>
                    <TableCell>{drug.batch_number}</TableCell>
                    <TableCell>{drug.location}</TableCell>
                    <TableCell>{drug.quantity}</TableCell>
                    <TableCell>{drug.expiration_date}</TableCell>
                    <TableCell 
                      sx={{ 
                        color: drug.days_until_expiry <= 7 ? 'error.main' : 
                              drug.days_until_expiry <= 30 ? 'warning.main' : 'success.main'
                      }}
                    >
                      {drug.days_until_expiry}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Reports;