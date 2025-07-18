import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, Box } from '@mui/material';
import { verifyDrug } from '../services/api';

const DrugVerification = () => {
  const [ndc, setNdc] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const result = await verifyDrug(ndc);
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({ error: 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Verify Drug Authenticity
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Enter NDC Code"
          variant="outlined"
          fullWidth
          value={ndc}
          onChange={(e) => setNdc(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={!ndc || loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </Box>
      
      {verificationResult && (
        <Box sx={{ mt: 2 }}>
          {verificationResult.error ? (
            <Typography color="error">{verificationResult.error}</Typography>
          ) : (
            <>
              <Typography>
                <strong>Drug Name:</strong> {verificationResult.drug_name}
              </Typography>
              <Typography>
                <strong>Manufacturer:</strong> {verificationResult.manufacturer}
              </Typography>
              <Typography color={verificationResult.is_valid ? 'success.main' : 'error.main'}>
                <strong>Status:</strong> {verificationResult.is_valid ? 'VALID' : 'INVALID'}
              </Typography>
              <Typography variant="caption" display="block">
                Blockchain ID: {verificationResult.blockchain_id}
              </Typography>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default DrugVerification;