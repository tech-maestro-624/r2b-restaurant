import { Box, Grid, Paper, Typography } from '@mui/material';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: `${color}20`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$12,345',
      icon: <DollarSign />,
      color: '#2196f3',
    },
    {
      title: 'Total Orders',
      value: '156',
      icon: <ShoppingBag />,
      color: '#4caf50',
    },
    {
      title: 'Total Customers',
      value: '1,245',
      icon: <Users />,
      color: '#ff9800',
    },
    {
      title: 'Growth',
      value: '+15%',
      icon: <TrendingUp />,
      color: '#f44336',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}