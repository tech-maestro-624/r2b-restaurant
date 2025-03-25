import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from 'react';

export default function OrderDetailsPage() {
  // Ensure the parameter name matches your route definition.
  // For a route defined as /order/:id, this is correct.
  const { id } = useParams<{ id: string }>();
  console.log('OrderDetailsPage: order id from params:', id);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Order id is missing');
      }
      return orderService.getById(id);
    },
    enabled: Boolean(id), // Only run the query if id is defined
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching order details</div>;

  // Adjust this extraction based on your API response shape.
  // For instance, if your API returns { order: { ... } } instead of { data: { ... } }
  const order = data?.data || data?.order || data;
  console.log('OrderDetailsPage: order data:', order);

  // Check if order is missing or empty
  if (!order || Object.keys(order).length === 0) return <div>Order not found</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <ArrowBackIcon sx={{ cursor: 'pointer' }} onClick={() => navigate(-1)} /> Order
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Order Items
      </Typography>
      {order.items && order.items.length > 0 ? (
        order.items.map((item: any) => (
          <Box key={item._id} sx={{ mb: 2 }}>
            <Typography>
              {item.quantity}x {item.foodItem?.name || 'Unnamed Item'}
            </Typography>
            {item.addOns && item.addOns.length > 0 && (
              <Box sx={{ pl: 2 }}>
                <Typography variant="subtitle2">Add-Ons:</Typography>
                {item.addOns.map((addOn: any) => (
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
          {order.taxDetails.map((tax: any) => (
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
