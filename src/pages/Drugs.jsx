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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';

import { api } from '../services/api';

const DrugsPage = () => {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDrug, setCurrentDrug] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ndc: '',
    manufacturer: '',
    dosage: '',
    form: '',
    is_temperature_sensitive: false
  });

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await api.get('/drugs');
        setDrugs(response.data);
      } catch (err) {
        setError('Failed to fetch drugs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrugs();
  }, []);

  const handleOpenDialog = (drug = null) => {
    setCurrentDrug(drug);
    if (drug) {
      setFormData({
        name: drug.name,
        ndc: drug.ndc,
        manufacturer: drug.manufacturer,
        dosage: drug.dosage,
        form: drug.form,
        is_temperature_sensitive: drug.is_temperature_sensitive
      });
    } else {
      setFormData({
        name: '',
        ndc: '',
        manufacturer: '',
        dosage: '',
        form: '',
        is_temperature_sensitive: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (currentDrug) {
        await api.put(`/drugs/${currentDrug.id}`, formData);
      } else {
        await api.post('/drugs', formData);
      }
      // Refresh drugs list
      const response = await api.get('/drugs');
      setDrugs(response.data);
      handleCloseDialog();
    } catch (err) {
      setError(currentDrug ? 'Failed to update drug' : 'Failed to create drug');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/drugs/${id}`);
      setDrugs(drugs.filter(drug => drug.id !== id));
    } catch (err) {
      setError('Failed to delete drug');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h4">Drug Management</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Drug
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
                <TableCell>Name</TableCell>
                <TableCell>NDC</TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell>Dosage</TableCell>
                <TableCell>Form</TableCell>
                <TableCell>Temp Sensitive</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : drugs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No drugs found
                  </TableCell>
                </TableRow>
              ) : (
                drugs.map((drug) => (
                  <TableRow key={drug.id}>
                    <TableCell>{drug.name}</TableCell>
                    <TableCell>{drug.ndc}</TableCell>
                    <TableCell>{drug.manufacturer}</TableCell>
                    <TableCell>{drug.dosage}</TableCell>
                    <TableCell>{drug.form}</TableCell>
                    <TableCell>
                      {drug.is_temperature_sensitive ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenDialog(drug)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(drug.id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentDrug ? 'Edit Drug' : 'Add New Drug'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Drug Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NDC Code"
                name="ndc"
                value={formData.ndc}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Form"
                name="form"
                value={formData.form}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <label>
                <input
                  type="checkbox"
                  name="is_temperature_sensitive"
                  checked={formData.is_temperature_sensitive}
                  onChange={handleInputChange}
                />
                Temperature Sensitive
              </label>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentDrug ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DrugsPage;