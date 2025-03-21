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
  Skeleton,
  TablePagination
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
  const imageId = item.image?.[0];

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
    <Card
      sx={{
        bgcolor: '#2A2D32',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 0 5px rgba(255, 255, 255, 0.1)',
      }}
    >
      {imageId ? (
        imageLoading ? (
          <Skeleton variant="rectangular" width="100%" height={300} />
        ) : imageError || !imageUrl ? (
          <Box
            sx={{
              height: 300,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
            }}
          >
            <Typography variant="body2">No Image</Typography>
          </Box>
        ) : (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={item.name}
            sx={{
              height: 300,
              width: '100%',
              objectFit: 'cover',
            }}
          />
        )
      ) : (
        <Box
          sx={{
            height: 300,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            color: "black"
          }}
        >
          <Typography variant="body2">No Image</Typography>
        </Box>
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
        <Typography
          sx={{
            mb: 2,
            color: 'white',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '60px', // Ensures 3 lines of text
          }}
        >
          {item.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip label={getCategoryName(item.category?._id)} size="small" />
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

  // Use TablePagination states: page (zero-based) and rowsPerPage
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: menuItems = {}, isLoading: menuLoading } = useQuery({
    queryKey: ['menu-items', selectedBranch?._id],
    queryFn: () =>
      selectedBranch
        ? menuService.getAllItems(selectedBranch._id).then((res) => res.data)
        : Promise.resolve({}),
    enabled: !!selectedBranch,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['menu-categories', selectedBranch?._id],
    queryFn: () =>
      menuService.getAllCategories(selectedBranch._id).then((res) => res.data.categories),
    enabled: !!selectedBranch,
  });

  // Flatten the menu items from the object structure
  const flattenedMenuItems = Object.values(menuItems).flat();

  // Filter items by category
  const filteredItems =
    selectedCategory === 'all'
      ? flattenedMenuItems
      : flattenedMenuItems.filter((item) => item.category?._id === selectedCategory);

  // Slice items for the current page
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Calculate how many pages we have
  const totalCount = filteredItems.length;

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      selectedBranch ? menuService.deleteItem(selectedBranch._id, id) : Promise.reject('No branch selected'),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items', selectedBranch?._id]);
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
      queryClient.invalidateQueries(['menu-items', selectedBranch?._id]);
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

  // Reset to the first page whenever the category changes
  const handleCategoryChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
    setPage(0);
  };

  // Handlers for TablePagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!selectedBranch) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">Please select a branch to manage menu items</Alert>
      </Box>
    );
  }

  if (menuLoading || categoriesLoading) return <LoadingScreen />;

  return (
    <Box>
      <PageHeader
        title={`Menu Items - ${selectedBranch.name}`}
        onAdd={() => setOpenForm(true)}
        buttonText="Add Menu Item"
      />

      <Tabs
        value={selectedCategory}
        onChange={handleCategoryChange}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="All Items" value="all" sx={{ color: 'white' }} />
        {categories.map((category: MenuCategory) => (
          <Tab key={category._id} label={category.name} value={category._id} sx={{ color: 'white' }} />
        ))}
      </Tabs>

      <Grid container spacing={3}>
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <MenuItemCard
                item={item}
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleAvailability={handleToggleAvailability}
              />
            </Grid>
          ))
        ) : (
          <Typography variant="body2" sx={{ mt: 2 }}>
            No items available in this category.
          </Typography>
        )}
      </Grid>

      {/* TablePagination UI */}
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[3, 9, 15, 30]}
        labelRowsPerPage="Items per page:"
        sx={{ mt: 3 }}
      />

      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="lg" fullWidth>
        <MenuForm item={selectedItem} onClose={handleCloseForm} categories={categories} />
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item?"
        onConfirm={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteMutation.isLoading}
      />
    </Box>
  );
}
