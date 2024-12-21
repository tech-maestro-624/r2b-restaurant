import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  InputAdornment,
  Alert,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
  Grid,
  Radio,
  RadioGroup,
  FormLabel
} from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../../services/menu.service';
import { MenuItem, CreateMenuItemDto, MenuCategory } from '../../types/menu';
import { handleApiError } from '../../utils/error-handler';
import { useBranch } from '../../contexts/BranchContext';
import { fileService } from '../../services/file.service';

interface MenuFormProps {
  item?: MenuItem | null;
  onClose: () => void;
  categories: MenuCategory[];
}

export default function MenuForm({ item, onClose, categories }: MenuFormProps) {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    console.log(item);
  }, [item]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateMenuItemDto>({
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      category: item?.category?._id || '',
      price: item?.price || 0,
      image: item?.image && Array.isArray(item.image) ? item.image[0] : '',
      dishType: item?.dishType || 'veg',
      taxSlab: item?.taxSlab || 5,
      branchId: selectedBranch?._id || '',
      hasVariants: item?.hasVariants || false,
      variants: item?.variants || [],
      options: item?.options || [],
      addOns: item?.addOns || [],
    },
  });

  const hasVariants = watch('hasVariants');

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: 'variants',
  });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: 'options',
  });

  const {
    fields: addOnFields,
    append: appendAddOn,
    remove: removeAddOn,
  } = useFieldArray({
    control,
    name: 'addOns',
  });

  const mutation = useMutation({
    mutationFn: (data: CreateMenuItemDto) => {
      const payload = {
        ...data,
        branchId: selectedBranch?._id,
      };
      return item
        ? menuService.updateItem(item._id, payload)
        : menuService.createItem(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', selectedBranch?._id] });
      onClose();
    },
    onError: (error) =>
      handleApiError(
        error,
        `Failed to ${item ? 'update' : 'create'} menu item`
      ),
  });

  useEffect(() => {
    const fetchImage = async () => {
      if (item && Array.isArray(item.image) && item.image[0]) {
        try {
          const imageId = item.image[0];
          const response = await fileService.get(imageId);
          const existingImageUrl = response.data.data;
          setValue('image', imageId);
          setImageUrl(existingImageUrl);
        } catch (error) {
          handleApiError(error, 'Failed to fetch image');
        }
      }
    };
    fetchImage();
  }, [item, setValue]);

  if (!selectedBranch) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Please select a branch first
      </Alert>
    );
  }

  const onSubmit = (data: CreateMenuItemDto) => {
    mutation.mutate(data);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await fileService.upload(file, 'menu-item', selectedBranch.name);
        const imageId = response.data.data;
        const localPreviewUrl = URL.createObjectURL(file);
        setValue('image', imageId);
        setImageUrl(localPreviewUrl);
      } catch (error) {
        handleApiError(error, 'Image upload failed');
      }
    }
  };

  const handleImageDelete = async () => {
    const imageId = watch('image');
    if (imageId) {
      try {
        await fileService.deleteFile(imageId);
      } catch (error) {
        handleApiError(error, 'Failed to delete image');
        return;
      }
    }
    setValue('image', '');
    setImageUrl('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>
        {item ? 'Edit Menu Item' : 'Add Menu Item'}
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
            label="Description"
            fullWidth
            multiline
            rows={3}
            {...register('description', { required: 'Description is required' })}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          {/* Dish Type */}
          <Controller
            name="dishType"
            control={control}
            rules={{ required: 'Dish type is required' }}
            render={({ field }) => (
              <FormControl component="fieldset">
                <FormLabel component="legend">Dish Type</FormLabel>
                <RadioGroup row {...field}>
                  <FormControlLabel value="veg" control={<Radio />} label="Vegetarian" />
                  <FormControlLabel value="non-veg" control={<Radio />} label="Non-Vegetarian" />
                </RadioGroup>
                {errors.dishType && (
                  <Typography color="error" variant="body2">
                    {errors.dishType.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Category */}
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select {...field} label="Category">
                  <MuiMenuItem value="">
                    <em>None</em>
                  </MuiMenuItem>
                  {categories.map((cat) => (
                    <MuiMenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MuiMenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography color="error" variant="body2">
                    {errors.category.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Tax Slab as RadioGroup */}
          <Controller
            name="taxSlab"
            control={control}
            rules={{ required: 'Tax slab is required' }}
            render={({ field }) => (
              <FormControl component="fieldset" error={!!errors.taxSlab}>
                <FormLabel component="legend">Tax Slab</FormLabel>
                <RadioGroup
                  row
                  {...field}
                  value={field.value?.toString() || ''}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                >
                  <FormControlLabel value="5" control={<Radio />} label="5%" />
                  <FormControlLabel value="12" control={<Radio />} label="12%" />
                  <FormControlLabel value="18" control={<Radio />} label="18%" />
                  <FormControlLabel value="28" control={<Radio />} label="28%" />
                </RadioGroup>
                {errors.taxSlab && (
                  <Typography color="error" variant="body2">
                    {errors.taxSlab.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Box>
            <Typography variant="subtitle1">Upload Image</Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginTop: '8px' }}
            />
            {imageUrl && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  style={{ maxHeight: '100px' }}
                />
                <IconButton color="error" onClick={handleImageDelete}>
                  <Trash2 size={20} />
                </IconButton>
              </Box>
            )}
            {errors.image && (
              <Typography color="error" variant="body2">
                {errors.image.message}
              </Typography>
            )}
          </Box>

          <FormControlLabel
            control={<Switch checked={watch('hasVariants')} {...register('hasVariants')} />}
            label="Has Variants"
          />

          {!hasVariants && (
            <TextField
              label="Price"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              {...register('price', {
                required: !watch('hasVariants') ? 'Price is required' : false,
                min: { value: 0, message: 'Price must be positive' },
              })}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          )}

          {hasVariants && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Typography variant="subtitle1">Variants</Typography>
                <Button
                  startIcon={<Plus size={20} />}
                  onClick={() => appendVariant({ label: '', price: 0, attributes: {} })}
                >
                  Add Variant
                </Button>
              </Box>
              {variantFields.map((field, index) => (
                <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <TextField
                      label="Label"
                      fullWidth
                      {...register(`variants.${index}.label`)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Price"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      {...register(`variants.${index}.price`)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Serving Size"
                      type="number"
                      fullWidth
                      {...register(`variants.${index}.attributes.servingSize`)}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton onClick={() => removeVariant(index)} color="error">
                      <Trash2 size={20} />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Box>
          )}

          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="subtitle1">Add-ons</Typography>
              <Button
                startIcon={<Plus size={20} />}
                onClick={() => appendAddOn({ name: '', price: 0 })}
              >
                Add Add-on
              </Button>
            </Box>
            {addOnFields.map((field, index) => (
              <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Name"
                    fullWidth
                    {...register(`addOns.${index}.name`)}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Price"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    {...register(`addOns.${index}.price`)}
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton onClick={() => removeAddOn(index)} color="error">
                    <Trash2 size={20} />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Box>

          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="subtitle1">Options</Typography>
              <Button
                startIcon={<Plus size={20} />}
                onClick={() => appendOption({ option: '', choices: [''] })}
              >
                Add Option
              </Button>
            </Box>
            {optionFields.map((field, index) => (
              <Box key={field.id} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={11}>
                    <TextField
                      label="Option Name"
                      fullWidth
                      {...register(`options.${index}.option`)}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton onClick={() => removeOption(index)} color="error">
                      <Trash2 size={20} />
                    </IconButton>
                  </Grid>
                </Grid>
                <TextField
                  label="Choices (comma-separated)"
                  fullWidth
                  sx={{ mt: 1 }}
                  {...register(`options.${index}.choices`)}
                  helperText="Enter choices separated by commas"
                />
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving...' : item ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Box>
  );
}
