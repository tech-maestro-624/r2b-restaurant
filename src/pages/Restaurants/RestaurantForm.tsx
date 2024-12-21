import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Restaurant,
  CreateRestaurantDto,
  restaurantService,
} from '../../services/restaurant.service';

interface RestaurantFormProps {
  restaurant?: Restaurant | null;
  onClose: () => void;
}

export default function RestaurantForm({
  restaurant,
  onClose,
}: RestaurantFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateRestaurantDto>({
    defaultValues: restaurant || {
      name: '',
      address: '',
      phone: '',
      email: '',
    },
  });
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateRestaurantDto) =>
      restaurant
        ? restaurantService.update(restaurant.id, data)
        : restaurantService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      enqueueSnackbar(
        `Restaurant ${restaurant ? 'updated' : 'created'} successfully`,
        { variant: 'success' }
      );
      onClose();
    },
    onError: () => {
      enqueueSnackbar(
        `Failed to ${restaurant ? 'update' : 'create'} restaurant`,
        { variant: 'error' }
      );
    },
  });

  const onSubmit = (data: CreateRestaurantDto) => {
    mutation.mutate(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>
        {restaurant ? 'Edit Restaurant' : 'Add Restaurant'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            fullWidth
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Address"
            fullWidth
            {...register('address', { required: 'Address is required' })}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
          <TextField
            label="Phone"
            fullWidth
            {...register('phone', { required: 'Phone is required' })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
          <TextField
            label="Email"
            fullWidth
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? 'Saving...'
            : restaurant
            ? 'Update'
            : 'Create'}
        </Button>
      </DialogActions>
    </Box>
  );
}