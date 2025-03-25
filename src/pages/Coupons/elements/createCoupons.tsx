import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  Checkbox,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Coupons, ICoupon } from '../../../services/coupons.service';
import { branchService } from '../../../services/branch.service';

interface CouponFormProps {
  coupon: ICoupon | null;
  onClose: () => void;
}

const CouponForm: React.FC<CouponFormProps> = ({ coupon, onClose }) => {
  const [formData, setFormData] = useState<ICoupon>({
    code: '',
    description: '',
    discountType: 'Percentage',
    value: 0,
    validFrom: undefined,
    validTo: undefined,
    createdBy: 'Company',
    branches: [],
    minCartValue: 0,
    freeShipping: false,
  });

  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  console.log('CouponForm mounted. coupon prop:', coupon);

  const { data: branchData, isLoading: isBranchLoading, error: branchError } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getAll().then((res) => res.data),
  });

  // Log when coupon prop changes and update form state accordingly
  useEffect(() => {
    console.log('coupon prop updated:', coupon);
    if (coupon) {
      setFormData({
        ...coupon,
        validFrom: coupon.validFrom ? new Date(coupon.validFrom) : undefined,
        validTo: coupon.validTo ? new Date(coupon.validTo) : undefined,
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discountType: 'Percentage',
        value: 0,
        validFrom: undefined,
        validTo: undefined,
        createdBy: 'Company',
        branches: [],
        minCartValue: 0,
        freeShipping: false,
      });
    }
  }, [coupon]);

  // Log component unmounting
  useEffect(() => {
    return () => {
      console.log('CouponForm unmounting');
    };
  }, []);

  const mutation = useMutation({
    mutationFn: (newCoupon: ICoupon) =>
      coupon?._id ? Coupons.update(coupon._id, newCoupon) : Coupons.create(newCoupon),
    onSuccess: () => {
      queryClient.invalidateQueries(['coupons']);
      enqueueSnackbar(
        coupon ? 'Coupon updated successfully' : 'Coupon created successfully',
        { variant: 'success' }
      );
      console.log('Mutation successful. Disabling form close for debugging.');
      // Comment out the onClose call to see if the form stays visible:
      // onClose();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      enqueueSnackbar('Failed to save coupon', { variant: 'error' });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    if (name === 'validFrom' || name === 'validTo') {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));
    }
  };

  const handleBranchChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      branches: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);
    if (!formData.branches || formData.branches.length === 0) {
      enqueueSnackbar('Please select at least one branch', { variant: 'error' });
      return;
    }
    mutation.mutate(formData);
  };

  if (isBranchLoading) {
    return <div>Loading branch data...</div>;
  }

  if (branchError) {
    console.error('Error fetching branch data:', branchError);
    return <div>Error loading branch data</div>;
  }

  if (!branchData || !branchData.branches) {
    console.warn('No branch data available:', branchData);
    return <div>No branch data available</div>;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 3, bgcolor: '#2A2D32', color: 'white' }}
    >
      <TextField
        label="Code"
        name="code"
        value={formData.code}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
        InputProps={{ style: { color: 'white' } }}
        InputLabelProps={{ style: { color: 'white' } }}
      />
      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 2 }}
        InputProps={{ style: { color: 'white' } }}
        InputLabelProps={{ style: { color: 'white' } }}
      />
      <TextField
        label="Discount Type"
        name="discountType"
        value={formData.discountType}
        onChange={handleChange}
        select
        fullWidth
        required
        sx={{ mb: 2 }}
        InputProps={{ style: { color: 'white' } }}
        InputLabelProps={{ style: { color: 'white' } }}
      >
        <MenuItem value="Percentage">Percentage</MenuItem>
        <MenuItem value="Amount">Amount</MenuItem>
        <MenuItem value="Free Shipping">Free Shipping</MenuItem>
      </TextField>
      <TextField
        label="Value"
        name="value"
        type="number"
        value={formData.value}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
        InputProps={{ style: { color: 'white' } }}
        InputLabelProps={{ style: { color: 'white' } }}
      />
      <TextField
        label="Valid From"
        name="validFrom"
        type="date"
        value={formData.validFrom ? formData.validFrom.toISOString().split('T')[0] : ''}
        onChange={handleChange}
        fullWidth
        InputLabelProps={{ shrink: true, style: { color: 'white' } }}
        sx={{ mb: 2 }}
        InputProps={{ style: { color: 'white' } }}
      />
      <TextField
        label="Valid To"
        name="validTo"
        type="date"
        value={formData.validTo ? formData.validTo.toISOString().split('T')[0] : ''}
        onChange={handleChange}
        fullWidth
        InputLabelProps={{ shrink: true, style: { color: 'white' } }}
        sx={{ mb: 2 }}
        InputProps={{ style: { color: 'white' } }}
      />
      <TextField
        label="Min Cart Value"
        name="minCartValue"
        type="number"
        value={formData.minCartValue}
        onChange={handleChange}
        fullWidth
        InputLabelProps={{ shrink: true, style: { color: 'white' } }}
        sx={{ mb: 2 }}
        InputProps={{ style: { color: 'white' } }}
      />
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={!!formData.freeShipping}
              onChange={handleChange}
              name="freeShipping"
              color="primary"
            />
          }
          label="Free Shipping Coupon?"
          sx={{ color: 'white' }}
        />
      </FormGroup>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="branch-select-label" sx={{ color: 'white' }}>
          Branches
        </InputLabel>
        <Select
          labelId="branch-select-label"
          multiple
          value={formData.branches}
          onChange={handleBranchChange}
          input={<OutlinedInput label="Branches" />}
          renderValue={(selected) =>
            (selected as string[])
              .map((branchId) => {
                const branch = branchData.branches.find((br: any) => br._id === branchId);
                return branch ? branch.name : branchId;
              })
              .join(', ')
          }
          sx={{ color: 'white' }}
        >
          {branchData.branches.map((branch: any) => (
            <MenuItem key={branch._id} value={branch._id}>
              <Checkbox checked={formData.branches.includes(branch._id)} />
              <ListItemText primary={branch.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" type="submit" fullWidth>
        {coupon ? 'Update Coupon' : 'Create Coupon'}
      </Button>
    </Box>
  );
};

export default CouponForm;

