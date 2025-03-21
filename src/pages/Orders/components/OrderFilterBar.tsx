import { Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { OrderFilterParams, OrderStatus, PaymentStatus } from '../../../types/order';

interface OrderFilterBarProps {
  filters: OrderFilterParams;
  onFilterChange: (filters: OrderFilterParams) => void;
}

export default function OrderFilterBar({ filters, onFilterChange }: OrderFilterBarProps) {
  const orderStatuses: OrderStatus[] = [
    'Placed',
    'Confirmed',
    'Preparing',
    'Prepared',
    'Picked Up',
    'Delivered',
    'Cancelled',
    'Ready to Pickup',
    'Out For Delivery',
    'Refunded'
  ];

  const paymentStatuses: PaymentStatus[] = [
    'pending',
    'paid',
    'failed'
  ];

  return (
    <Card sx={{ 
      mb: 3, 
      backgroundColor: '#2A2D32', 
      color: 'white', 
      fontSize: '1.1rem' 
    }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'white', fontSize: '1.1rem' }}>Status</InputLabel>
              <Select
                value={filters.status || ''}
                label="Status"
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  status: (e.target.value as OrderStatus) || undefined 
                })}
                sx={{
                  color: 'white',
                  fontSize: '1.1rem',
                  '.MuiSvgIcon-root': { color: 'white' },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                {orderStatuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'white', fontSize: '1.1rem' }}>Payment Status</InputLabel>
              <Select
                value={filters.paymentStatus || ''}
                label="Payment Status"
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  paymentStatus: (e.target.value as PaymentStatus) || undefined 
                })}
                sx={{
                  color: 'white',
                  fontSize: '1.1rem',
                  '.MuiSvgIcon-root': { color: 'white' },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                {paymentStatuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              InputLabelProps={{ 
                shrink: true, 
                sx: { color: 'white', fontSize: '1.1rem' } 
              }}
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value || undefined })}
              sx={{
                input: { color: 'white', fontSize: '1.1rem' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              InputLabelProps={{ 
                shrink: true, 
                sx: { color: 'white', fontSize: '1.1rem' } 
              }}
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value || undefined })}
              sx={{
                input: { color: 'white', fontSize: '1.1rem' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              }}
            />
          </Grid>
              <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Customer Name"
                value={filters.customerName || ''}
                onChange={(e) => onFilterChange({ ...filters, customerName: e.target.value || undefined })}
                sx={{
                input: { color: 'white', fontSize: '1.1rem' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '& .MuiInputLabel-root': { color: 'white', fontSize: '1.1rem' },
                }}
              />
              </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Customer Phone"
              value={filters.customerPhone || ''}
              onChange={(e) => onFilterChange({ ...filters, customerPhone: e.target.value || undefined })}
              sx={{
                input: { color: 'white', fontSize: '1.1rem' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '& .MuiInputLabel-root': { color: 'white', fontSize: '1.1rem' },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}