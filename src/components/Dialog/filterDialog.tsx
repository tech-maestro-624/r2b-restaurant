// src/components/DateRangeDialog.tsx

import React from 'react';
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

interface DateRangeDialogProps {
  open: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSubmit: () => void;
  error: string | null;
}

const DateRangeDialog: React.FC<DateRangeDialogProps> = ({
  open,
  onClose,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: '#2A2D32', color: 'white' }}>Select Date Range</DialogTitle>
      <DialogContent sx={{ bgcolor: '#2A2D32', color: 'white' }}>
        <Stack direction="column" spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: endDate || undefined,
            }}
            fullWidth
            sx={{ input: { color: 'white' }, label: { color: 'white' } }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: startDate || undefined,
            }}
            fullWidth
            sx={{ input: { color: 'white' }, label: { color: 'white' } }}
          />
        </Stack>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#2A2D32' }}>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateRangeDialog;   