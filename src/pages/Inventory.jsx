import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  Box,
  TextField,
  Button
} from '@mui/material';
import { getInventory, addToInventory } from '../services/api';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    batch_id: '',
    location_id: '',
    quantity: ''
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await getInventory();
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addToInventory({
        batch_id: parseInt(formData.batch_id),
        location_id: parseInt(formData.location_id),
        quantity: parseInt(formData.quantity)
      });
      // Refresh inventory
      const response = await getInventory();
      setInventory(response.data);
      setFormData({
        batch_id: '',
        location_id: '',
        quantity: ''
      });
    } catch (error) {
      console.error('Error adding to inventory:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add to Inventory
        </Typography>
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ display: 'flex', gap: 2, mb: 2 }}
        >
          <TextField
            name="batch_id"
            label="Batch ID"
            value={formData.batch_id}
            onChange={handleInputChange}
            required
          />
          <TextField
            name="location_id"
            label="Location ID"
            value={formData.location_id}
            onChange={handleInputChange}
            required
          />
          <TextField
            name="quantity"
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            required
          />
          <Button type="submit" variant="contained">
            Add
          </Button>
        </Box>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Drug Name</TableCell>
              <TableCell>Batch Number</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Manufacturing Date</TableCell>
              <TableCell>Expiration Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No inventory items found</TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.batch.drug.name}</TableCell>
                  <TableCell>{item.batch.batch_number}</TableCell>
                  <TableCell>{item.location.name}</TableCell>
                  <TableCell>{item.current_quantity}</TableCell>
                  <TableCell>
                    {new Date(item.batch.manufacturing_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(item.batch.expiration_date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryPage;