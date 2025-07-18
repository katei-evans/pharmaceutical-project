import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { api } from '../services/api';

const BatchManagement = ({ drugId }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [formData, setFormData] = useState({
    batch_number: '',
    manufacturing_date: null,
    expiration_date: null,
    quantity: '',
    drug_id: drugId
  });

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await api.get(`/drugs/${drugId}/batches`);
        setBatches(response.data);
      } catch (err) {
        setError('Failed to fetch batches');
      } finally {
        setLoading(false);
      }
    };
    
    if (drugId) {
      fetchBatches();
    }
  }, [drugId]);

  const handleOpenDialog = (batch = null) => {
    setCurrentBatch(batch);
    if (batch) {
      setFormData({
        batch_number: batch.batch_number,
        manufacturing_date: new Date(batch.manufacturing_date),
        expiration_date: new Date(batch.expiration_date),
        quantity: batch.quantity.toString(),
        drug_id: drugId
      });
    } else {
      setFormData({
        batch_number: '',
        manufacturing_date: null,
        expiration_date: null,
        quantity: '',
        drug_id: drugId
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        manufacturing_date: formData.manufacturing_date.toISOString().split('T')[0],
        expiration_date: formData.expiration_date.toISOString().split('T')[0],
        quantity: parseInt(formData.quantity)
      };

      if (currentBatch) {
        await api.put(`/batches/${currentBatch.id}`, payload);
      } else {
        await api.post('/batches', payload);
      }
      
      // Refresh batches list
      const response = await api.get(`/drugs/${drugId}/batches`);
      setBatches(response.data);
      handleCloseDialog();
    } catch (err) {
      setError(currentBatch ? 'Failed to update batch' : 'Failed to create batch');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/batches/${id}`);
      setBatches(batches.filter(batch => batch.id !== id));
    } catch (err) {
      setError('Failed to delete batch');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h5">Batch Management</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Batch
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Batch Number</TableCell>
                <TableCell>Manufacturing Date</TableCell>
                <TableCell>Expiration Date</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No batches found
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => {
                  const expirationDate = new Date(batch.expiration_date);
                  const today = new Date();
                  const daysUntilExpiry = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
                  
                  let status = 'Valid';
                  let statusColor = 'success.main';
                  
                  if (daysUntilExpiry <= 0) {
                    status = 'Expired';
                    statusColor = 'error.main';
                  } else if (daysUntilExpiry <= 30) {
                    status = `Expires in ${daysUntilExpiry} days`;
                    statusColor = 'warning.main';
                  }
                  
                  return (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.batch_number}</TableCell>
                      <TableCell>
                        {new Date(batch.manufacturing_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {expirationDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell sx={{ color: statusColor }}>
                        {status}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpenDialog(batch)}>
                            <EditIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(batch.id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentBatch ? 'Edit Batch' : 'Add New Batch'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Batch Number"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Manufacturing Date"
                value={formData.manufacturing_date}
                onChange={(date) => handleDateChange('manufacturing_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Expiration Date"
                value={formData.expiration_date}
                onChange={(date) => handleDateChange('expiration_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={formData.manufacturing_date}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.batch_number || !formData.manufacturing_date || 
                     !formData.expiration_date || !formData.quantity}
          >
            {currentBatch ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchManagement;