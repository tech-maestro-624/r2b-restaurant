import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: '#2A2D32', color: 'white' }}>{title}</DialogTitle>
      <DialogContent sx={{ bgcolor: '#2A2D32', color: 'white' }}>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#2A2D32' }}>
        <Button
          onClick={onCancel}
          color="success"
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: 'green', color: 'white', '&:hover': { bgcolor: 'darkgreen' } }}
        >
          {loading ? 'Processing...' : 'Cancel'}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: 'red', color: 'white' }}
        >
          {loading ? 'Processing...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}