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
import { branchService } from '../../services/branch.service';
import { Branch, CreateBranchDto } from '../../types/branch';
import { handleApiError } from '../../utils/error-handler';

interface BranchFormProps {
  branch?: Branch | null;
  onClose: () => void;
}

export default function BranchForm({ branch, onClose }: BranchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBranchDto>({
    defaultValues: branch || {
      name: '',
      address: '',
      phone: '',
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateBranchDto) =>
      branch
        ? branchService.update(branch.id, data)
        : branchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      onClose();
    },
    onError: (error) =>
      handleApiError(
        error,
        `Failed to ${branch ? 'update' : 'create'} branch`
      ),
  });

  const onSubmit = (data: CreateBranchDto) => {
    mutation.mutate(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>
        {branch ? 'Edit Branch' : 'Add Branch'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Branch Name"
            fullWidth
            {...register('name', { required: 'Branch name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            label="Address"
            fullWidth
            multiline
            rows={3}
            {...register('address', { required: 'Address is required' })}
            error={!!errors.address}
            helperText={errors.address?.message}
          />

          <TextField
            label="Phone Number"
            fullWidth
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Please enter a valid 10-digit phone number',
              },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
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
            : branch
            ? 'Update'
            : 'Create'}
        </Button>
      </DialogActions>
    </Box>
  );
}