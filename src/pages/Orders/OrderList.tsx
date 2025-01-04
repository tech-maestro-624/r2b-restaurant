import { useState } from 'react';
import { Box, Typography, Grid, Alert, Pagination } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { Order, OrderFilterParams } from '../../types/order';
import { useBranch } from '../../contexts/BranchContext';
import LoadingScreen from '../../components/common/LoadingScreen';
import { handleApiError } from '../../utils/error-handler';
import OrderCard from './components/OrderCard';
import OrderFilterBar from './components/OrderFilterBar';
import { useNavigate } from 'react-router-dom';

export default function OrderList() {
  const { selectedBranch } = useBranch();
  const [filters, setFilters] = useState<OrderFilterParams>({});
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['orders', selectedBranch?._id, filters, page],
    queryFn: () => 
      selectedBranch 
        ? orderService.getAll(selectedBranch._id, filters, page).then((res) => res.data)
        : Promise.resolve(null),
    enabled: !!selectedBranch,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      selectedBranch
        ? orderService.updateStatus(orderId, status)
        : Promise.reject('No branch selected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', selectedBranch?._id] });
    },
    onError: (error) => handleApiError(error, 'Failed to update order status'),
  });

  if (!selectedBranch) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          Please select a branch to view orders
        </Alert>
      </Box>
    );
  }

  if (isLoading) return <LoadingScreen />;

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateStatusMutation.mutate({ orderId, status });
  };
  

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Orders - {selectedBranch.name}
      </Typography>

      <OrderFilterBar 
        filters={filters} 
        onFilterChange={setFilters} 
      />

      {orderData?.orders.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No orders found matching the selected filters
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {orderData?.orders.map((order) => (
            <Grid item xs={12} md={6} key={order._id}>
              <OrderCard
                order={order}
                onViewDetails={() => navigate(`/orders/${order._id}`)}
                onStatusChange={handleStatusChange} // Pass the function here

              />
            </Grid>
          ))}
        </Grid>
      )}

      {orderData && orderData.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={orderData.totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      /> */}
    </Box>
  );
}