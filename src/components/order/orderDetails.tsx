import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function OrderDetailsPage() {
  const { id } = useParams(); // Extract order ID from URL
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching order details</div>;

  const order = data?.data; // Access the order data from the response
  console.log(order);
  

  if (!order) return <div>Order not found</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
       <ArrowBackIcon sx={{cursor : 'pointer'}} onClick={()=> navigate(-1)} /> Order 
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Order Items
      </Typography>
      {order.items && order.items.length > 0 ? (
        order.items.map((item) => (
          <Box key={item._id} sx={{ mb: 2 }}>
            <Typography>
              {item.quantity}x {item.foodItem?.name || 'Unnamed Item'}
            </Typography>
            {item.addOns && item.addOns.length > 0 && (
              <Box sx={{ pl: 2 }}>
                <Typography variant="subtitle2">Add-Ons:</Typography>
                {item.addOns.map((addOn) => (
                  <Typography key={addOn._id}>
                    - {addOn.name} (₹{addOn.price})
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ))
      ) : (
        <Typography>No items found in this order.</Typography>
      )}

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Order Summary
      </Typography>
      <Typography>Subtotal: ₹{order.subTotal}</Typography>
      {order.taxDetails && order.taxDetails.length > 0 && (
        <Box sx={{ pl: 2 }}>
          <Typography variant="subtitle2">Tax Details:</Typography>
          {order.taxDetails.map((tax) => (
            <Typography key={tax._id}>
              - {tax.name} ({tax.rate}%): ₹{tax.amount}
            </Typography>
          ))}
        </Box>
      )}
      <Typography>Delivery Charge: ₹{order.deliveryCharge}</Typography>
      <Typography>Service Charge: ₹{order.serviceCharge}</Typography>
      <Typography>Discount: -₹{order.discount}</Typography>
      <Typography variant="h6">Grand Total: ₹{order.grandTotal}</Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Payment Details
      </Typography>
      <Typography>Payment Method: {order.paymentMethod}</Typography>
      <Typography>Payment Status: {order.paymentStatus}</Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Order Status
      </Typography>
      <Typography>Status: {order.status}</Typography>
      <Typography>Order Type: {order.orderType}</Typography>
      {order.deliveryPartner && (
        <Typography>Delivery Partner: {order.deliveryPartner}</Typography>
      )}

<Typography variant="h6" gutterBottom>
        Customer Details
      </Typography>
      <Typography>Name: {order.customer?.name || 'N/A'}</Typography>
      {order.customer?.address && (
        <Typography>Address: {order.customer.address}</Typography>
      )}
    </Box>
  );
}
