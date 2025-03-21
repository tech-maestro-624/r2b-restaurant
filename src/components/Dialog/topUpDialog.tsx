// src/components/Dialog/TopUpDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
} from '@mui/material';

interface TopUpDialogProps {
  open: boolean;
  onClose: () => void;
  perOrderValue: number; // Current PER_ORDER_VALUE
  onTopUp: (quantity: number, totalCost: number) => void;
  error: string | null;
  loading: boolean;
}

const TopUpDialog: React.FC<TopUpDialogProps> = ({
  open,
  onClose,
  perOrderValue,
  onTopUp,
  error,
  loading,
}) => {
  const [quantity, setQuantity] = useState<string>('1');
  const [localError, setLocalError] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState<number>(perOrderValue);

  useEffect(() => {
    setQuantity('1');
    setTotalCost(perOrderValue);
    setLocalError(null);
  }, [perOrderValue, open]);

  useEffect(() => {
    const qty = parseInt(quantity, 10);
    if (!isNaN(qty) && qty > 0) {
      setTotalCost(perOrderValue * qty);
    } else {
      setTotalCost(0);
    }
  }, [quantity, perOrderValue]);

  const handleApply = () => {
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setLocalError('Please enter a valid number of orders.');
      return;
    }
    setLocalError(null);
    onTopUp(parsedQuantity, perOrderValue * parsedQuantity);
  };

  const handleClose = () => {
    setLocalError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ bgcolor: '#2A2D32', color: 'white' }}>Top Up Orders</DialogTitle>
      <DialogContent sx={{ bgcolor: '#2A2D32', color: 'white' }}>
        <Stack direction="column" spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body1">
            <strong>Per Order Value:</strong> {perOrderValue.toFixed(2)}
          </Typography>
          <TextField
            label="Number of Orders"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: 1,
              step: 1,
            }}
            fullWidth
            sx={{ input: { color: 'white' }, label: { color: 'white' } }}
          />
          <Typography variant="body1">
            <strong>Total Cost:</strong> {totalCost.toFixed(2)}
          </Typography>
        </Stack>
        {(localError || error) && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {localError || error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#2A2D32' }}>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Top Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TopUpDialog;
