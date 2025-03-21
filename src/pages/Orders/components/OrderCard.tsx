import { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Stack, 
  Chip, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Order } from '../../../types/order';

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
}

export default function OrderCard({ order, onViewDetails, onStatusChange }: OrderCardProps) {
  const [status, setStatus] = useState<Order['status']>(order.status);

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as Order['status'];
    setStatus(newStatus);
    onStatusChange(order._id, newStatus);
  };

  return (
    <Card 
      sx={{ 
        backgroundColor: '#2A2D32', 
        color: 'white',
        fontSize: '1.1rem',
        borderRadius: '12px',
        cursor: 'pointer'
      }}
      onClick={() => onViewDetails(order)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
            #{order?.orderId}
          </Typography>
          <IconButton size="small" onClick={() => onViewDetails(order)}>
            <Eye size={20} color="white" />
          </IconButton>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={order?.paymentStatus}
            color={order?.paymentStatus === 'paid' ? 'success' : 'warning'}
            size="small"
          />
          <Chip label={order.paymentMethod} variant="outlined" size="small" />
        </Stack>

        {/* New field for Restaurant Name */}
        <Typography variant="body2" sx={{ color: 'white', fontSize: '1.1rem' }} gutterBottom>
          Restaurant: {order?.restaurant?.name || 'N/A'}
        </Typography>

        {/* Customer details */}
        <Typography variant="body2" sx={{ color: 'white', fontSize: '1.1rem' }} gutterBottom>
          Customer: {order?.customer?.name || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'white', fontSize: '1.1rem' }} gutterBottom>
          Phone: {order?.customer?.phoneNumber || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'white', fontSize: '1.1rem' }} gutterBottom>
          Items: {order.items.length}
        </Typography>
        <Typography variant="h6" sx={{ mt: 1, color: 'white', fontSize: '1.3rem' }}>
          Total: ₹ {(order?.grandTotal).toFixed(2)}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'white', fontSize: '0.9rem' }}>
          {format(new Date(order?.createdAt), 'PPp')}
        </Typography>

        <Box sx={{ position: 'relative', mt: 2 }}>
          <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: '50%' }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'white', fontSize: '1.1rem' }}>Status</InputLabel>
              <Select
                value={status}
                onChange={handleStatusChange}
                label="Status"
                sx={{
                  color: 'white',
                  fontSize: '1.1rem',
                  '.MuiSvgIcon-root': { color: 'white' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                }}
              >
                <MenuItem value="Placed">Placed</MenuItem>
                <MenuItem value="Confirmed">Order Accepted</MenuItem>
                <MenuItem value="Preparing">Preparing</MenuItem>
                <MenuItem value="Prepared">Order Prepared</MenuItem>
                <MenuItem value="Picked Up">Picked Up</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Ready to Pickup">Ready to Pickup</MenuItem>
                <MenuItem value="Out For Delivery">Out For Delivery</MenuItem>
                <MenuItem value="Refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
