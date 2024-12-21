import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Order } from '../../../types/order';

interface OrderDetailsDialogProps {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
}

export default function OrderDetailsDialog({ 
  order, 
  onClose, 
  onStatusChange 
}: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog
      open={!!order}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Order #{order.orderNumber}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Customer Details
          </Typography>
          <Typography>Name: {order.customer.name}</Typography>
          <Typography>Phone: {order.customer.phone}</Typography>
          {order.customer.address && (
            <Typography>Address: {order.customer.address}</Typography>
          )}

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Order Items
          </Typography>
          {order.items.map((item) => (
            <Box key={item._id} sx={{ mb: 2 }}>
              <Typography>
                {item.quantity}x {item.menuItem.name}
                {item.variant && ` (${item.variant.label})`}
              </Typography>
              {item.addOns?.map((addon) => (
                <Typography key={addon.name} variant="body2" color="text.secondary">
                  + {addon.name}
                </Typography>
              ))}
              <Typography variant="body2">
                ₹{item.totalPrice}
              </Typography>
            </Box>
          ))}

          <Box sx={{ mt: 3 }}>
            <Typography>Subtotal: ₹{order.subtotal}</Typography>
            <Typography>Tax: ₹{order.tax}</Typography>
            {order.deliveryFee && (
              <Typography>Delivery Fee: ₹{order.deliveryFee}</Typography>
            )}
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total: ₹{order.total}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Update Status</InputLabel>
              <Select
                value={order.status}
                label="Update Status"
                onChange={(e) => onStatusChange(order._id, e.target.value as Order['status'])}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="preparing">Preparing</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}