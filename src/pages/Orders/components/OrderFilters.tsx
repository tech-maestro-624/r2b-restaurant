import { Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { OrderFilters } from '../../../types/order';

interface OrderFiltersProps {
  filters: OrderFilters;
  onFilterChange: (filters: OrderFilters) => void;
}

export default function OrderFilters({ filters, onFilterChange }: OrderFiltersProps) {
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
                onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="preparing">Preparing</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'white', fontSize: '1.1rem' }}>Payment Status</InputLabel>
              <Select
                value={filters.paymentStatus || ''}
                label="Payment Status"
                onChange={(e) => onFilterChange({ ...filters, paymentStatus: e.target.value })}
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
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
              onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
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
              onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
              sx={{
                input: { color: 'white', fontSize: '1.1rem' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
