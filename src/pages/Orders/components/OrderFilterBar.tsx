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
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                label="Status"
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  status: e.target.value as OrderStatus || undefined 
                })}
              >
                <MenuItem value="">All</MenuItem>
                {orderStatuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status?.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={filters.paymentStatus || ''}
                label="Payment Status"
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  paymentStatus: e.target.value as PaymentStatus || undefined 
                })}
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
              InputLabelProps={{ shrink: true }}
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value || undefined })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value || undefined })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}