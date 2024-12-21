import { Box, Typography, Button } from '@mui/material';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onAdd?: () => void;
  buttonText?: string;
}

export default function PageHeader({ title, onAdd, buttonText }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
      }}
    >
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {onAdd && (
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={onAdd}
        >
          {buttonText || 'Add New'}
        </Button>
      )}
    </Box>
  );
}