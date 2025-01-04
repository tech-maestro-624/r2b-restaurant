// src/components/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Stack,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ShoppingBag,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
} from 'lucide-react';

import { branchService } from '../services/branch.service';
import { useBranch } from '../contexts/BranchContext';
import { SubscriptionService } from '../services/subscription.service';
import { ConfigurationService } from '../services/configuration.service';
import DateRangeDialog from './Dialog/filterDialog';
import TopUpDialog from './Dialog/topUpDialog';
import { PaymentService } from '../services/payment.service';
import { TopupService } from '../services/topup.service';

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

// Subscription Status Interface and Helper
interface IRestaurantSubscriptionStatus {
  _id: string;
  branch: string;
  subscription: string;
  startDate: string;
  endDate: string;
  orderCount: number;
  status: 'active' | 'expired' | 'pending';
}

function getStatusIconAndColor(
  status: IRestaurantSubscriptionStatus['status']
) {
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

// Define BranchStats Interface
interface BranchStats {
  totalRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingPreparingOrders: number;
  cancelledOrders: number;
  previousPayout: number;
  nextPayout?: {
    netPayout: number;
  };
}

interface Configuration {
  _id: string;
  name: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
export default function Dashboard() {
  const { selectedBranch } = useBranch();
  const [stats, setStats] = useState<BranchStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const subscriptionStatus: IRestaurantSubscriptionStatus = {
    _id: 'abcdef123456',
    branch: 'Branch001',
    subscription: 'SubPlanA',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T00:00:00.000Z',
    orderCount: 123,
    status: 'active',
  };

  // Initial Dates
  const initialStartDate = subscriptionStatus.startDate.slice(0, 10);
  const initialEndDate = subscriptionStatus.endDate.slice(0, 10);

  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);

  // Dialog States
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogStartDate, setDialogStartDate] = useState<string>(startDate);
  const [dialogEndDate, setDialogEndDate] = useState<string>(endDate);

  // Configuration States
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [configError, setConfigError] = useState<string | null>(null);
  const [openConfigDialog, setOpenConfigDialog] = useState<boolean>(false);
  const [perOrderValue, setPerOrderValue] = useState<number>(7); // Default value

  // Limit States
  const [isLimitExceeded, setIsLimitExceeded] = useState<boolean>(false);
  const [limitThreshold, setLimitThreshold] = useState<number>(100); // Example threshold

  // Feedback States
  const [updatingConfig, setUpdatingConfig] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState([])

  const fetchStats = async (start: string, end: string) => {
    if (!selectedBranch?._id) {
      setError('No branch selected.');
      setLoading(false);
      return;
    }

    if (!start || !end) {
      setError('Start date and End date must be selected.');
      setLoading(false);
      return;
    }

    if (start > end) {
      setError('Start Date cannot be after End Date.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await branchService.getStats(selectedBranch._id, {
        startDate: start,
        endDate: end,
      });
      setStats(response.data); // Set stats from API response
      setError(null);

      // Check if pendingPreparingOrders exceed the threshold
      if (response.data.pendingPreparingOrders > limitThreshold) {
        setIsLimitExceeded(true);
        setOpenConfigDialog(true); // Automatically open Top-Up dialog
      } else {
        setIsLimitExceeded(false);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch statistics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await SubscriptionService.getSubscriptionStatus(
        selectedBranch?._id
      );
      console.log(response);
      setSubscription(response.data)
      // Optionally, update subscriptionStatus with response data
    } catch (error) {
      console.log(error);
    }
  };

  const fetchConfiguration = async () => {
    try {
      const response = await ConfigurationService.getConfiguration();
      setConfigurations(response.data.configurations); 
      const perOrderConfig = response.data.configurations.find(
        (config: Configuration) => config.name === 'PER_ORDER_VALUE'
      );
      if (perOrderConfig) {
        setPerOrderValue(perOrderConfig.value);
      }
      setConfigError(null);
    } catch (error: any) {
      console.error(error);
      setConfigError('Failed to fetch configurations.');
    }
  };

  useEffect(() => {
    // Load Razorpay script when the component mounts
    loadRazorpayScript()
      .then(() => {
        console.log('Razorpay script loaded successfully');
      })
      .catch((error) => {
        console.error('Error loading Razorpay script:', error);
      });

    fetchStats(startDate, endDate);
    fetchSubscription();
    fetchConfiguration();
  }, [selectedBranch, limitThreshold]);

  const handleOpenDialog = () => {
    setDialogStartDate(startDate);
    setDialogEndDate(endDate);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmitDates = () => {
    // Validate dates
    if (!dialogStartDate || !dialogEndDate) {
      setError('Start date and End date must be selected.');
      return;
    }

    if (dialogStartDate > dialogEndDate) {
      setError('Start Date cannot be after End Date.');
      return;
    }

    // Update the main dates and fetch stats
    setStartDate(dialogStartDate);
    setEndDate(dialogEndDate);
    fetchStats(dialogStartDate, dialogEndDate);

    setOpenDialog(false);
  };

  const handleOpenConfigDialog = () => {
    setOpenConfigDialog(true);
  };

  const handleCloseConfigDialog = () => {
    setOpenConfigDialog(false);
  };

  const handleUpdatePerOrderValue = async (quantity: number, totalCost: number) => {
    console.log(totalCost, quantity );
    
    setUpdatingConfig(true);
    try {
      const response1 = await TopupService.topUp({branchId: selectedBranch._id, additionaOrders:quantity})
      console.log(response1);

      // const response = await PaymentService.verifyPayment({branchId: selectedBranch._id, quantity});
      // const { razorpayOrderId, amount, currency } = response.data || {};

      if (response1.data) {
        openRazorpayCheckout(response1.data);
      } else {
        alert('Failed to initiate payment. Please try again.');
        setUpdatingConfig(false);
      }
    } catch (error: any) {
      console.error(error);
      setConfigError('Failed to top up orders.');
      setUpdatingConfig(false);
    }
  };

  const openRazorpayCheckout = (razorpayOrderId: string) => {
    const options = {
      key_id: 'rzp_test_LKwcKdhRp0mq9f', // Replace with your Razorpay Key ID
      // amount: amount * 100, // Razorpay accepts amounts in paise
      currency: 'INR',
      name: 'Roll2Bowl Technologies Pvt Ltd',
      description: 'Payment for your top-up',
      order_id: razorpayOrderId, // Razorpay Order ID from backend
      handler: async (response: any) => {
        try {
          // Call backend to verify payment
          const verifyResponse = await PaymentService.verifyPayment({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
  
          if (verifyResponse.status === 200) {
            alert('Payment successful! Your top-up has been processed.');
            fetchStats(startDate, endDate); // Refetch stats
            fetchConfiguration(); // Refetch configurations
            setSuccessMessage(
              `Successfully topped up ${quantity} orders for a total of ${totalCost.toFixed(2)}%.`
            );
            setOpenConfigDialog(false);
            setIsLimitExceeded(false);
            setConfigError(null);
          } else {
            alert('Payment verification failed.');
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          alert('Error verifying payment. Please contact support.');
        }
      },
      theme: {
        color: '#53a20e',
      },
      modal: {
        ondismiss: () => {
          alert('Payment cancelled.');
        },
      },
    };
  
    const razorpay = new window.Razorpay(options);
    razorpay.open()
  };
  


  const statsData = stats
    ? [
        {
          title: 'Total Revenue',
          value: stats.totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          icon: <DollarSign />,
          color: '#2196f3',
        },
        {
          title: 'Total Orders',
          value: stats.totalOrders.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          icon: <ShoppingBag />,
          color: '#4caf50',
        },
        {
          title: 'Delivered Orders',
          value: stats.deliveredOrders.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          icon: <CheckCircle />,
          color: '#76c7c0',
        },
        {
          title: 'Pending Orders',
          value: stats.pendingPreparingOrders.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          icon: <Clock />,
          color: '#ff9800',
        },
        {
          title: 'Cancelled Orders',
          value: stats.cancelledOrders.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          icon: <XCircle />,
          color: '#f44336',
        },
        {
          title: 'Previous Payout',
          value: stats.previousPayout
            ? stats.previousPayout.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '0.00',
          icon: <DollarSign />,
          color: '#2196f3',
        },
        {
          title: 'Next Payout',
          value: stats.nextPayout?.netPayout
            ? stats.nextPayout.netPayout.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '0.00',
          icon: <DollarSign />,
          color: '#2196f3',
        },
      ]
    : [];

  const { icon, color, label } = getStatusIconAndColor(
    subscription?.status
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          startIcon={<Calendar />}
          onClick={handleOpenDialog}
        >
          Select Date Range
        </Button>
      </Box>

      {/* Date Selection Dialog */}
      <DateRangeDialog
        open={openDialog}
        onClose={handleCloseDialog}
        startDate={dialogStartDate}
        endDate={dialogEndDate}
        onStartDateChange={setDialogStartDate}
        onEndDateChange={setDialogEndDate}
        onSubmit={handleSubmitDates}
        error={error}
      />

      {/* Top-Up Dialog */}
      <TopUpDialog
        open={openConfigDialog}
        onClose={handleCloseConfigDialog}
        perOrderValue={perOrderValue}
        onTopUp={handleUpdatePerOrderValue}
        error={configError}
        loading={updatingConfig}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {loading ? (
        <Typography variant="body1">Loading statistics...</Typography>
      ) : error ? (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {statsData.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Paper sx={{ width: '100%', maxWidth: 600, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Subscription Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Branch:</strong> {subscription?.branch?.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Subscription:</strong> {subscription?.subscription?.planName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Start Date:</strong>{' '}
                {new Date(subscription?.startDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>End Date:</strong>{' '}
                {new Date(subscription?.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Order Count:</strong> {subscription?.orderCount}
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
                mt={2}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ color: color, mr: 2 }}>{icon}</Box>
                  <Typography
                    variant="body1"
                    sx={{ color: color, fontWeight: 600 }}
                  >
                    {label}
                  </Typography>
                </Box>
                {/* {isLimitExceeded && ( */}
                  <Button variant="contained" onClick={handleOpenConfigDialog}>
                    Top Up
                  </Button>
                {/* )} */}
              </Box>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
}
