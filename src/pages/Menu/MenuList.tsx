import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  IconButton,
  Chip,
  Dialog,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Alert,
  Skeleton
} from '@mui/material';
import { Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../../services/menu.service';
import { fileService } from '../../services/file.service';
import { MenuItem, MenuCategory } from '../../types/menu';
import { useBranch } from '../../contexts/BranchContext';
import PageHeader from '../../components/common/PageHeader';
import MenuForm from './MenuForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { handleApiError } from '../../utils/error-handler';
import LoadingScreen from '../../components/common/LoadingScreen';

// A helper component for each menu item card
function MenuItemCard({
  item,
  categories,
  onEdit,
  onDelete,
  onToggleAvailability
}: {
  item: MenuItem;
  categories: MenuCategory[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string, isAvailable: boolean) => void;
}) {
  const imageId = item.image?.[0]; // Assuming item.image is an array of file IDs (strings)

  // Fetch image URL if imageId exists
  const { data: imageUrl, isLoading: imageLoading, isError: imageError } = useQuery({
    queryKey: ['file', imageId],
    queryFn: () => fileService.get(imageId!).then((res) => res.data.data),
    enabled: !!imageId
  });

  const getCategoryName = (cateId: string): string => {
    const category = categories.find((cat) => cat._id === cateId);
    return category?.name || 'Unknown Category';
  };

  return (
    <Card>
      {imageId ? (
        imageLoading ? (
          <Skeleton variant="rectangular" width="100%" height={140} />
        ) : imageError || !imageUrl ? (
          <Typography
            variant="body2"
            sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}
          >
            No Image
          </Typography>
        ) : (
          <CardMedia component="img" height="140" image={imageUrl} alt={item.name} />
        )
      ) : (
        <Typography
          variant="body2"
          sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}
        >
          No Image
        </Typography>
      )}

      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="div">
            {item.name}
          </Typography>
          <Typography variant="h6" color="primary">
            ₹{item.price}
          </Typography>
        </Box>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {item.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip label={getCategoryName(item.category._id)} size="small" />
          {/* Remove preparationTime if not in type */}
          {/* <Chip label={`${item.preparationTime} mins`} size="small" variant="outlined" /> */}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={item.isAvailable}
                onChange={(e) => onToggleAvailability(item._id, e.target.checked)}
              />
            }
            label={item.isAvailable ? 'Available' : 'Unavailable'}
          />
          <Box>
            <IconButton size="small" onClick={() => onEdit(item)} color="primary">
              <Edit2 size={16} />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(item._id)} color="error">
              <Trash2 size={16} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function MenuList() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ['menu-items', selectedBranch?._id],
    queryFn: () =>
      selectedBranch
        ? menuService.getAllItems(selectedBranch._id).then((res) => res.data)
        : Promise.resolve([]),
    enabled: !!selectedBranch,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: () => menuService.getAllCategories().then((res) => res.data.categories),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      selectedBranch ? menuService.deleteItem(selectedBranch._id, id) : Promise.reject('No branch selected'),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items', selectedBranch?._id]); // Pass key array directly
      setDeleteConfirm(null);
    },
    onError: (error) => handleApiError(error, 'Failed to delete menu item'),
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      selectedBranch
        ? menuService.toggleAvailability(selectedBranch._id, id, isAvailable)
        : Promise.reject('No branch selected'),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items', selectedBranch?._id]); // Pass key array directly
    },
    onError: (error) => handleApiError(error, 'Failed to update availability'),
  });

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setOpenForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedItem(null);
  };

  const handleToggleAvailability = (id: string, isAvailable: boolean) => {
    toggleAvailabilityMutation.mutate({ id, isAvailable });
  };

  if (!selectedBranch) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">Please select a branch to manage menu items</Alert>
      </Box>
    );
  }

  if (menuLoading || categoriesLoading) return <LoadingScreen />;

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category._id === selectedCategory);

  return (
    <Box>
      <PageHeader
        title={`Menu Items - ${selectedBranch.name}`}
        onAdd={() => setOpenForm(true)}
        buttonText="Add Menu Item"
      />

      <Tabs
        value={selectedCategory}
        onChange={(_, value) => setSelectedCategory(value)}
        sx={{ mb: 3 }}
      >
        <Tab label="All Items" value="all" />
        {categories.map((category: MenuCategory) => (
          <Tab key={category._id} label={category.name} value={category._id} />
        ))}
      </Tabs>

      <Grid container spacing={3}>
        {filteredItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <MenuItemCard
              item={item}
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <MenuForm
          item={selectedItem}
          onClose={handleCloseForm}
          categories={categories}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item?"
        onConfirm={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        // Use isLoading, not isPending
        loading={deleteMutation.isLoading}
      />
    </Box>
  );
}
