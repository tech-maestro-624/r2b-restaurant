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
// import CouponForm from './CouponForm';
import CouponForm from './elements/createCoupons';
import { Coupons, ICoupon } from '../../services/coupons.service';
import { format } from 'date-fns';

// export interface ICoupon {
//     _id?: string;
//     code: string;
//     description?: string;
//     discountType: 'Percentage' | 'Amount';
//     value: number;
//     validFrom?: Date;
//     validTo?: Date;
//     createdBy: 'Restaurant' | 'Company' | 'Branch';
//     restaurant?: string;        // or mongoose.Schema.Types.ObjectId
//     branches?: string[];        // or mongoose.Schema.Types.ObjectId[]
//     createdAt?: Date;
//     updatedAt?: Date;
// }

// export const Coupons = {
//     getAll: async (): Promise<ICoupon[]> => {
//         try {
//             const response = await api.get<ICoupon[]>('/coupons');
//             return response.data;
//         } catch (error) {
//             console.error("Error fetching coupons:", error);
//             throw error;
//         }
//     },

//     getById: async (id: string): Promise<ICoupon> => {
//         try {
//             const response = await api.get<ICoupon>(`/coupons/${id}`);
//             return response.data;
//         } catch (error) {
//             console.error(`Error fetching coupon with ID ${id}:`, error);
//             throw error;
//         }
//     },

//     create: async (coupon: ICoupon): Promise<ICoupon> => {
//         try {
//             const response = await api.post<ICoupon>('/coupons', coupon);
//             return response.data;
//         } catch (error) {
//             console.error("Error creating coupon:", error);
//             throw error;
//         }
//     },

//     update: async (id: string, coupon: Partial<ICoupon>): Promise<ICoupon> => {
//         try {
//             const response = await api.put<ICoupon>(`/coupons/${id}`, coupon);
//             return response.data;
//         } catch (error) {
//             console.error(`Error updating coupon with ID ${id}:`, error);
//             throw error;
//         }
//     },

//     delete: async (id: string): Promise<void> => {
//         try {
//             await api.delete(`/coupons/${id}`);
//         } catch (error) {
//             console.error(`Error deleting coupon with ID ${id}:`, error);
//             throw error;
//         }
//     }
// };

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
            return format(new Date(params.value), 'dd-MM-yyyy'); // Adjust the format as needed
          },
        },
        {
          field: 'validTo',
          headerName: 'Valid To',
          flex: 1,
          valueFormatter: (params) => {
            return format(new Date(params.value), 'dd-MM-yyyy'); // Adjust the format as needed
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
                <Typography variant="h4">Coupons</Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus />}
                    onClick={() => setOpenForm(true)}
                >
                    Add Coupon
                </Button>
            </Box>

            <Paper sx={{ height: 400, width: '100%' }}>
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

                />
            </Paper>

            <Dialog
                open={openForm}
                onClose={handleCloseForm}
                maxWidth="sm"
                fullWidth
            >
                <CouponForm
                    coupon={selectedCoupon}
                    onClose={handleCloseForm}
                />
            </Dialog>
        </Box>
    );
}
