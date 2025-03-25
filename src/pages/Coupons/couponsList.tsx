import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Dialog,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import CouponForm from './elements/createCoupons';
import { Coupons, ICoupon } from '../../services/coupons.service';
import { format } from 'date-fns';

export default function CouponsList() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => Coupons.getAll().then((res) => res),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => Coupons.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      enqueueSnackbar('Coupon deleted successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to delete coupon', { variant: 'error' });
    },
  });

  const handleEdit = (coupon: ICoupon) => {
    setSelectedCoupon(coupon);
    setOpenForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedCoupon(null);
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'discountType', headerName: 'Discount Type', flex: 1 },
    { field: 'value', headerName: 'Value', flex: 1 },
    {
      field: 'validFrom',
      headerName: 'Valid From',
      flex: 1,
      valueFormatter: (params) => {
        const value = params.value;
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date.getTime())) return '';
        return format(date, 'dd-MM-yyyy');
      },
    },
    {
      field: 'validTo',
      headerName: 'Valid To',
      flex: 1,
      valueFormatter: (params) => {
        const value = params.value;
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date.getTime())) return '';
        return format(date, 'dd-MM-yyyy');
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            color="primary"
          >
            <Edit2 size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row._id)}
            color="error"
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontSize: '2rem' }}>
          Coupons
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setOpenForm(true)}
        >
          Add Coupon
        </Button>
      </Box>

      <Paper
        sx={{
          height: 400,
          width: '100%',
          bgcolor: '#2A2D32',
          color: 'white',
        }}
      >
        <DataGrid
          rows={coupons || []}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          getRowId={(row) => row._id}
          sx={{
            '& .MuiDataGrid-cell': {
              color: 'white',
              borderRight: '2px solid rgba(255, 255, 255, 0.2)',
              fontSize: '1.2rem',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#2A2D32',
              color: 'white',
              borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
              fontSize: '1.3rem',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: '#2A2D32',
              color: 'white',
              borderTop: '2px solid rgba(255, 255, 255, 0.2)',
              fontSize: '1.2rem',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
          }}
        />
      </Paper>

      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <CouponForm coupon={selectedCoupon} onClose={handleCloseForm} />
      </Dialog>
    </Box>
  );
}
