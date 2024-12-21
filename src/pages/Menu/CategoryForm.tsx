import { useForm } from 'react-hook-form';
import { Dialog,DialogTitle,DialogContent, TextField,DialogActions,Button } from '@mui/material';
export default function CategoryForm({ onClose, onCategoryCreated }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await categoryService.createCategory(data);
      onCategoryCreated(response.data.data);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  return (
    <Dialog open>
      <DialogTitle>Create a Category</DialogTitle>
      <DialogContent>
        <TextField
          label="Category Name"
          fullWidth
          {...register('name', { required: 'Name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
