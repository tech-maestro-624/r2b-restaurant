// src/pages/BranchList.jsx

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Chip,
  Dialog,
  Pagination,
  Alert,
} from '@mui/material';
import { Edit2, Trash2, MapPin, Phone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '../../services/branch.service';
import { Branch } from '../../types/branch';
import PageHeader from '../../components/common/PageHeader';
import BranchForm from './BranchForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { handleApiError } from '../../utils/error-handler';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function BranchList() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch branches with pagination
  const { data: branchData, isLoading } = useQuery({
    queryKey: ['branches', page],
    queryFn: () => branchService.getAll(page).then((res) => res.data),
  });

  // Mutation for creating a branch
  const createBranchMutation = useMutation({
    mutationFn: async (newBranch) => {
      const currentUser = await branchService.getCurrentUser();
      if (currentUser) {
        newBranch.ownerId = currentUser.user._id;
      }
      return branchService.create(newBranch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['branches', page]);
      setOpenForm(false);
    },
    onError: (error) => handleApiError(error, 'Failed to create branch'),
  });

  // Mutation for updating a branch
  const updateBranchMutation = useMutation({
    mutationFn: ({ id, data }) => branchService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['branches', page]);
      setOpenForm(false);
      setSelectedBranch(null);
    },
    onError: (error) => handleApiError(error, 'Failed to update branch'),
  });

  // Mutation for deleting a branch
  const deleteMutation = useMutation({
    mutationFn: (id: string) => branchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['branches', page]);
      setDeleteConfirm(null);
    },
    onError: (error) => handleApiError(error, 'Failed to delete branch'),
  });

  if (isLoading) return <LoadingScreen />;

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setOpenForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedBranch(null);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle form submission for both create and update
  const handleFormSubmit = (processedData) => {
    if (selectedBranch) {
      // Update existing branch
      updateBranchMutation.mutate({
        id: selectedBranch._id,
        data: processedData,
      });
    } else {
      // Create new branch
      createBranchMutation.mutate(processedData);
    }
  };

  // Empty state when no branches are found
  if (!branchData?.branches.length && page === 1) {
    return (
      <Box>
        <PageHeader
          title="Branch Management"
          onAdd={() => setOpenForm(true)}
          buttonText="Add Branch"
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          No branches found. Add your first branch to get started.
        </Alert>

        <Dialog
          open={openForm}
          onClose={handleCloseForm}
          fullWidth
          maxWidth={false}
          PaperProps={{   
            sx: {
              width: '90vw',
              maxWidth: '90vw',
              margin: 'auto',
              bgcolor: '#2A2D32', // Background color
              color: 'white', // Text color
              '& .MuiInputBase-input': {
                color: 'white', // Input text color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)', // Placeholder text color
              },
              '& .MuiFormLabel-root': {
                color: 'white', // Label text color
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: 'white', // Focused label text color
              },
              '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white', // Outline border color
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white', // Focused outline border color
              },
            },
          }}
        >
          <BranchForm onClose={handleCloseForm} onSubmit={handleFormSubmit} />
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Branch Management"
        onAdd={() => setOpenForm(true)}
        buttonText="Add Branch"
      />

      <Grid container spacing={3}>
        {branchData?.branches.map((branch) => (
          <Grid item xs={12} sm={6} md={4} key={branch._id}>
            <Card sx={{ bgcolor: '#2A2D32', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ color: 'white', fontSize: '1.5rem' }}>
                    {branch.name}
                  </Typography>
                  <Chip
                    label={branch.isActive ? 'Active' : 'Inactive'}
                    color={branch.isActive ? 'success' : 'default'}
                    size="small"
                    sx={{border:' 1px solid white'}}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MapPin size={16} />
                  <Typography variant="body2" color="white" sx={{ fontSize: '1rem' }}>
                    {branch.address}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Phone size={16} />
                  <Typography variant="body2" color="white" sx={{ fontSize: '1rem' }}>
                    {branch.phoneNumber}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(branch)}
                    color="primary"
                  >
                    <Edit2 size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(branch._id)}
                    color="error"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {branchData && branchData.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={branchData.totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Dialog for Add/Edit Branch */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '90vw', // 90% of viewport width
            maxWidth: '90vw',
            margin: 'auto',
            bgcolor: '#2A2D32', // Background color
            color: 'white', // Text color
            '& .MuiInputBase-input': {
              color: 'white', // Input text color
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)', // Placeholder text color
            },
            '& .MuiFormLabel-root': {
              color: 'white', // Label text color
            },
            '& .MuiFormLabel-root.Mui-focused': {
              color: 'white', // Focused label text color
            },
            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white', // Outline border color
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white', // Focused outline border color
            },
          },
        }}
      >
        <BranchForm
          branch={selectedBranch}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Branch"
        message="Are you sure you want to delete this branch?"
        onConfirm={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteMutation.isLoading}
      />
    </Box>
  );
}