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
  });

  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: branchData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getAll().then((res) => res.data),
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        validFrom: coupon.validFrom ? new Date(coupon.validFrom) : undefined,
        validTo: coupon.validTo ? new Date(coupon.validTo) : undefined,
      });
    }
  }, [coupon]);

  const mutation = useMutation({
    mutationFn: (newCoupon: ICoupon) =>
      coupon?._id
        ? Coupons.update(coupon._id, newCoupon)
        : Coupons.create(newCoupon),
    onSuccess: () => {
      queryClient.invalidateQueries(['coupons']);
      enqueueSnackbar(
        coupon ? 'Coupon updated successfully' : 'Coupon created successfully',
        { variant: 'success' }
      );
      onClose();
    },
    onError: () => {
      enqueueSnackbar('Failed to save coupon', { variant: 'error' });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'validFrom' || name === 'validTo') {
      setFormData((prev) => ({ ...prev, [name]: new Date(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.branches || formData.branches.length === 0) {
      enqueueSnackbar('Please select at least one branch', { variant: 'error' });
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <TextField
        label="Code"
        name="code"
        value={formData.code}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
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
      >
        <MenuItem value="Percentage">Percentage</MenuItem>
        <MenuItem value="Amount">Amount</MenuItem>
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
      />
      <TextField
        label="Valid From"
        name="validFrom"
        type="date"
        value={
          formData.validFrom
            ? formData.validFrom.toISOString().split('T')[0]
            : ''
        }
        onChange={handleChange}
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Valid To"
        name="validTo"
        type="date"
        value={
          formData.validTo
            ? formData.validTo.toISOString().split('T')[0]
            : ''
        }
        onChange={handleChange}
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />
      {branchData?.branches && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="branch-select-label">Branches</InputLabel>
          <Select
            labelId="branch-select-label"
            multiple
            value={formData.branches}
            onChange={handleBranchChange}
            input={<OutlinedInput label="Branches" />}
            renderValue={(selected) => {
              return (selected as string[])
                .map((branchId) => {
                  const b = branchData.branches.find(
                    (br: any) => br._id === branchId
                  );
                  return b ? b.name : branchId;
                })
                .join(', ');
            }}
          >
            {branchData.branches.map((branch: any) => (
              <MenuItem key={branch._id} value={branch._id}>
                <Checkbox checked={formData.branches.includes(branch._id)} />
                <ListItemText primary={branch.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Button variant="contained" color="primary" type="submit" fullWidth>
        {coupon ? 'Update Coupon' : 'Create Coupon'}
      </Button>
    </Box>
  );
};

export default CouponForm;
