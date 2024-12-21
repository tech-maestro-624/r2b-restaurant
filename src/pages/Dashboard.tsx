import React from 'react';
import { Box, Grid, Paper, Typography, Divider } from '@mui/material';
import { 
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

// Example StatCard component from your original code
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

// Dummy data interface
interface IRestaurantSubscriptionStatus {
  _id: string;
  branch: string;
  subscription: string;
  startDate: string;
  endDate: string;
  orderCount: number;
  status: 'active' | 'expired' | 'pending';
}

// Helper function to map status to icon and color
function getStatusIconAndColor(status: IRestaurantSubscriptionStatus['status']) {
  switch (status) {
    case 'active':
      return { icon: <CheckCircle />, color: 'green', label: 'Active' };
    case 'expired':
      return { icon: <XCircle />, color: 'red', label: 'Expired' };
    case 'pending':
      return { icon: <Clock />, color: 'orange', label: 'Pending' };
    default:
      return { icon: <CheckCircle />, color: 'gray', label: 'Unknown' };
  }
}

export default function Dashboard() {
  // Instead of fetching, we have our dummy data here:
  const subscriptionStatus: IRestaurantSubscriptionStatus = {
    _id: 'abcdef123456',
    branch: 'Branch001',
    subscription: 'SubPlanA',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T00:00:00.000Z',
    orderCount: 123,
    status: 'active',
  };

  // Example stats
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

  // Get icon and color for our subscription status
  const { icon, color, label } = getStatusIconAndColor(subscriptionStatus.status);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stat Cards */}
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Subscription Details Card (50% width) */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ width: '50%', p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Subscription Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {/* Branch & Subscription */}
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Branch:</strong> {subscriptionStatus.branch}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Subscription:</strong> {subscriptionStatus.subscription}
          </Typography>
          {/* Dates */}
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Start Date:</strong>{' '}
            {new Date(subscriptionStatus.startDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>End Date:</strong>{' '}
            {new Date(subscriptionStatus.endDate).toLocaleDateString()}
          </Typography>
          {/* Order Count */}
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Order Count:</strong> {subscriptionStatus.orderCount}
          </Typography>
          {/* Status with icon and color */}
          <Box display="flex" alignItems="center" gap={1} mt={2}>
            <Box sx={{ color: color }}>{icon}</Box>
            <Typography variant="body1" sx={{ color: color, fontWeight: 600 }}>
              {label}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
