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

  const { data: branchData, isLoading } = useQuery({
    queryKey: ['branches', page],
    queryFn: () => branchService.getAll(page).then((res) => res.data),
  });

  console.log(branchData)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => branchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
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
          maxWidth="sm"
          fullWidth
        >
          <BranchForm onClose={handleCloseForm} />
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
          <Grid item xs={12} sm={6} md={4} key={branch.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {branch.name}
                  </Typography>
                  <Chip
                    label={branch.isActive ? 'Active' : 'Inactive'}
                    color={branch.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MapPin size={16} />
                  <Typography variant="body2" color="text.secondary">
                    {branch.address}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Phone size={16} />
                  <Typography variant="body2" color="text.secondary">
                    {branch.phone}
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
                    onClick={() => handleDelete(branch.id)}
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

      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <BranchForm
          branch={selectedBranch}
          onClose={handleCloseForm}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Branch"
        message="Are you sure you want to delete this branch?"
        onConfirm={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}