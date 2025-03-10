// src/components/Dashboard.tsx - With Remaining Order Count and Low Credits Warning

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  IndianRupeeIcon,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

import { branchService } from '../services/branch.service';
import { useBranch } from '../contexts/BranchContext';
import { SubscriptionService } from '../services/subscription.service';
import { ConfigurationService } from '../services/configuration.service';
import DateRangeDialog from './Dialog/filterDialog';

import TopUpDialog from './Dialog/topUpDialog';
import UpgradeDialog from './Dialog/upgradeDialog';
import { PaymentService } from '../services/payment.service';
import { TopupService } from '../services/topup.service';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function StatCard({ title, value, icon, color, onClick }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: '#2A2D32', // Lighter background color
        color: 'white',
        backdropFilter: 'blur(10px)', // Blur effect
        border: '1px solid rgba(255, 255, 255, 0.1)', // Border shadow effect
        boxShadow: '0 0 5px rgba(255, 255, 255, 0.1)', // Reduced glow effect
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: `${color}20`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {React.cloneElement(icon as React.ReactElement, { color: 'white' })}
      </Box>
      <Box>
        <Typography color="white" variant="body2" sx={{ fontSize: '0.875rem' }}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold" color="white">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

function getStatusIconAndColor(status: string) {
  switch (status) {
    case 'active':
      return { icon: <CheckCircle />, color: 'green', label: 'Active' };
    case 'expired':
      return { icon: <XCircle />, color: 'red', label: 'Expired' };
    case 'pending':
      return { icon: <Clock />, color: 'orange', label: 'Pending' };
    default:
      return { icon: <Clock />, color: 'gray', label: 'Unknown' };
  }
}

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Dashboard() {
  const { selectedBranch } = useBranch();
  const [stats, setStats] = useState<any>(null);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [subLoading, setSubLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // State declarations
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dialogStartDate, setDialogStartDate] = useState<string>(startDate);
  const [dialogEndDate, setDialogEndDate] = useState<string>(endDate);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openConfigDialog, setOpenConfigDialog] = useState<boolean>(false);
  const [perOrderValue, setPerOrderValue] = useState<number>(7);
  const [updatingConfig, setUpdatingConfig] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState<boolean>(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradingSubscription, setUpgradingSubscription] = useState<boolean>(false);

  // Calculate remaining orders and credits status
  const getRemainingOrders = () => {
    if (!activeSubscription) return 0;
    
    // Get max orders from subscription plan
    const maxOrders = activeSubscription.subscriptionDetails?.maxOrders || 
                     activeSubscription.maxOrders || 100;
    
    // Get current used orders
    const usedOrders = activeSubscription.orderCount || 0;
    
    // Calculate remaining orders
    return Math.max(0, maxOrders - usedOrders);
  };
  
  const getOrderUsagePercentage = () => {
    if (!activeSubscription) return 0;
    
    // Get max orders from subscription plan
    const maxOrders = activeSubscription.subscriptionDetails?.maxOrders || 
                     activeSubscription.maxOrders || 100;
    
    // Get current used orders
    const usedOrders = activeSubscription.orderCount || 0;
    
    // Calculate usage percentage
    return Math.min(100, Math.round((usedOrders / maxOrders) * 100));
  };
  
  // Check if credits are low
  const isCreditsLow = () => {
    const remainingOrders = getRemainingOrders();
    const usagePercentage = getOrderUsagePercentage();
    
    // Consider credits low if less than 20% remaining or less than 10 orders left
    return usagePercentage >= 80 || remainingOrders <= 10;
  };
  
  // Check if credits are depleted
  const isCreditsExhausted = () => {
    return getRemainingOrders() <= 0;
  };
  
  // Fetch branch stats
  const fetchStats = async () => {
    if (!selectedBranch || !selectedBranch._id) {
      setError('No branch selected.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await branchService.getStats(selectedBranch._id);
      console.log("Stats response:", response);
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      setError('Failed to fetch statistics.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch subscription data
  const fetchSubscription = async () => {
    if (!selectedBranch || !selectedBranch._id) {
      console.log("No branch selected, skipping subscription fetch");
      setActiveSubscription(null);
      return;
    }
    
    setSubLoading(true);
    
    try {
      console.log(`Fetching subscription for branch: ${selectedBranch._id}`);
      
      // Reset the state before fetching
      setActiveSubscription(null);
      
      // Fetch data from API
      const response = await SubscriptionService.getSubscriptionStatus(selectedBranch._id);
      console.log("API Response:", response);
      
      // Check if we have a valid response
      if (!response || !response.data) {
        console.log("No data in API response");
        setActiveSubscription(null);
        setSubLoading(false);
        return;
      }
      
      // Get the data array from the response
      const subscriptions = response.data;
      
      // Check if we have an empty array (no subscriptions)
      if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
        console.log("No subscriptions in API response (empty array)");
        setActiveSubscription(null);
        setSubLoading(false);
        return;
      }
      
      console.log("Found subscriptions:", subscriptions.length);
      
      // Find the subscription that matches our branch ID
      let foundSubscription = null;
      
      for (const subscription of subscriptions) {
        console.log("Checking subscription:", subscription._id);
        
        // Check if branch exists and has an _id
        if (subscription.branch && subscription.branch._id) {
          console.log("Subscription branch ID:", subscription.branch._id);
          
          // Check if this subscription's branch._id matches our selectedBranchId
          if (String(subscription.branch._id) === String(selectedBranch._id)) {
            console.log("Found matching subscription!");
            foundSubscription = subscription;
            break;
          }
        }
      }
      
      if (foundSubscription) {
        console.log("Setting active subscription:", foundSubscription);
        
        // Create a transformed subscription object that maintains our expected structure
        const transformedSubscription = {
          _id: foundSubscription._id,
          branch: foundSubscription.branch._id,
          branchName: foundSubscription.branch.name,
          subscription: foundSubscription.subscription._id,
          subscriptionName: foundSubscription.subscription.planName,
          startDate: foundSubscription.startDate,
          endDate: foundSubscription.endDate,
          orderCount: foundSubscription.orderCount,
          price:foundSubscription.price,
          status: foundSubscription.status,
          branchDetails: foundSubscription.branch,
          subscriptionDetails: foundSubscription.subscription,
          maxOrders: foundSubscription.subscription.maxOrders || 100
        };
        
        // Set the transformed subscription
        setActiveSubscription(transformedSubscription);
        
        // Update date range based on subscription
        if (foundSubscription.startDate && foundSubscription.endDate) {
          const start = new Date(foundSubscription.startDate).toISOString().slice(0, 10);
          const end = new Date(foundSubscription.endDate).toISOString().slice(0, 10);
          setStartDate(start);
          setEndDate(end);
          setDialogStartDate(start);
          setDialogEndDate(end);
        }
      } else {
        console.log("No matching subscription found for branch", selectedBranch._id);
        setActiveSubscription(null);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setActiveSubscription(null);
    } finally {
      setSubLoading(false);
    }
  };
  
  // Fetch configuration
  const fetchConfiguration = async () => {
    try {
      const response = await ConfigurationService.getConfiguration();
      if (response.data && response.data.configurations) {
        const perOrderConfig = response.data.configurations.find(
          (config: any) => config.name === 'PER_ORDER_VALUE'
        );
        if (perOrderConfig) {
          setPerOrderValue(perOrderConfig.value);
        }
      }
    } catch (error) {
      console.error("Error fetching configuration:", error);
    }
  };
  
  // Load initial data when branch changes
  useEffect(() => {
    console.log("Selected branch changed:", selectedBranch?._id);
    
    // Reset subscription
    setActiveSubscription(null);
    
    // Load data for this branch
    if (selectedBranch && selectedBranch._id) {
      // Load Razorpay script
      loadRazorpayScript();
      
      // Fetch data with a small delay to ensure DOM is ready
      setTimeout(() => {
        fetchStats();
        fetchSubscription();
        fetchConfiguration();
      }, 100);
    }
  }, [selectedBranch]);
  
  // Fetch stats when dates change
  useEffect(() => {
    if (startDate && endDate && selectedBranch) {
      fetchStats();
    }
  }, [startDate, endDate]);
  
  // Dialog handlers
  const handleOpenDialog = () => {
    setDialogStartDate(startDate);
    setDialogEndDate(endDate);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmitDates = () => {
    if (dialogStartDate > dialogEndDate) {
      setError('Start Date cannot be after End Date.');
      return;
    }

    setStartDate(dialogStartDate);
    setEndDate(dialogEndDate);
    fetchStats();
    setOpenDialog(false);
  };

  const handleOpenConfigDialog = () => {
    setOpenConfigDialog(true);
  };

  const handleCloseConfigDialog = () => {
    setOpenConfigDialog(false);
  };
  
  const handleOpenUpgradeDialog = () => {
    setOpenUpgradeDialog(true);
    setUpgradeError(null);
  };

  const handleCloseUpgradeDialog = () => {
    setOpenUpgradeDialog(false);
  };

  const handleUpgradeSubscription = async (newSubscriptionId: string, amount: number) => {
    if (!selectedBranch || !selectedBranch._id) {
      setUpgradeError('No branch selected');
      return;
    }
    
    setUpgradingSubscription(true);
    
    try {
      const response = await SubscriptionService.upgradeSubscription(
        selectedBranch._id,
        newSubscriptionId,
        amount
      );
      
      if (response.data && response.data.razorpayOrderId) {
        openRazorpayCheckout(response.data.razorpayOrderId, 'upgrade');
      } else {
        setUpgradeError('Failed to initiate payment. Please try again.');
      }
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      setUpgradeError(`Failed to upgrade subscription: ${error.message || 'Unknown error'}`);
    } finally {
      setUpgradingSubscription(false);
    }
  };

  const handleRefreshData = () => {
    fetchSubscription();
  };

  // Top-up handler
  const handleUpdatePerOrderValue = async (quantity: number, totalCost: number) => {
    console.log("Topping up:", quantity, totalCost);
    setQuantity(quantity);
    setTotalCost(totalCost);
    
    setUpdatingConfig(true);
    try {
      const response = await TopupService.topUp({
        branchId: selectedBranch._id, 
        additionalOrders: quantity
      });
      
      if (response.data) {
        openRazorpayCheckout(response.data);
      } else {
        alert('Failed to initiate payment. Please try again.');
      }
    } catch (error: any) {
      console.error("Top-up error:", error);
      setConfigError('Failed to top up orders.');
    } finally {
      setUpdatingConfig(false);
    }
  };


  const handleRenewSubscription = async () => {
    try {
      setUpdatingConfig(true);
      
      // Calculate the price - use the subscription details if available, otherwise use the price directly
      const price = activeSubscription.subscriptionDetails?.price || 
                    activeSubscription.price || 
                    0;
                    
      if (!price) {
        throw new Error('Could not determine subscription price for renewal');
      }
      
      const response = await SubscriptionService.renewSubscription(
        selectedBranch._id, 
        parseFloat(price)
      );
      
      if (response.data && response.data.razorpayOrderId) {
        openRazorpayCheckout(response.data.razorpayOrderId, 'renew');
      } else {
        alert('Failed to initiate payment. Please try again.');
      }
    } catch (error: any) {
      console.error("Renew error", error);
      setConfigError(`Failed to renew subscription: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdatingConfig(false);
    }
  };

  // Razorpay checkout handler
  const openRazorpayCheckout = (razorpayOrderId: string, paymentType: 'topup' | 'renew' | 'upgrade' = 'topup') => {
    const options: any = {
      key: 'rzp_test_LKwcKdhRp0mq9f',
      currency: 'INR',
      name: 'Roll2Bowl Technologies Pvt Ltd',
      description: `Payment for your ${paymentType === 'topup' ? 'top-up' : paymentType === 'renew' ? 'renewal' : 'upgrade'}`,
      order_id: razorpayOrderId,
      handler: async (response: any) => {
        try {
          console.log('Payment response:', response);
          
          let verifyEndpoint = '/subscription-topup-verify'; // Default for top-up
          
          if (paymentType === 'upgrade') {
            verifyEndpoint = '/subscription/upgrade-verify';
          } else if (paymentType === 'renew') {
            verifyEndpoint = '/subscription/renew-verify';
          }
          
          const verifyResponse = await PaymentService.verifyPayment({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          }, verifyEndpoint);

          if (verifyResponse.status === 200) {
            let successMsg = '';
            
            if (paymentType === 'topup') {
              successMsg = `Payment successful! Your top-up of ${quantity} orders has been processed.`;
            } else if (paymentType === 'renew') {
              successMsg = 'Payment successful! Your subscription has been renewed.';
            } else {
              successMsg = 'Payment successful! Your subscription has been upgraded.';
            }
            
            alert(successMsg);
            
            // Close any open dialogs
            setOpenConfigDialog(false);
            setOpenUpgradeDialog(false);
            
            // Reset any errors
            setConfigError(null);
            setUpgradeError(null);
            
            // Refresh data
            fetchStats();
            fetchConfiguration();
            fetchSubscription();
            
            // Set success message
            setSuccessMessage(successMsg);
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

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  // Build stats data
  const statsData = stats
    ? [
        {
          title: 'Total Earnings',
          value: stats.totalRevenue?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || '0.00',
          icon: <IndianRupeeIcon />,
          color: '#2196f3',
        },
        {
          title: 'Total Orders',
          value: stats.totalOrders?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || '0',
          icon: <ShoppingBag />,
          color: '#4caf50',
          onClick: () => navigate('/orders')
        },
        {
          title: 'Delivered Orders',
          value: stats.deliveredOrders?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || '0',
          icon: <CheckCircle />,
          color: '#76c7c0',
        },
        {
          title: 'Pending Orders',
          value: stats.pendingPreparingOrders?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || '0',
          icon: <Clock />,
          color: '#ff9800',
        },
        {
          title: 'Cancelled Orders',
          value: stats.cancelledOrders?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || '0',
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
          icon: <IndianRupeeIcon />,
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
          icon: <IndianRupeeIcon />,
          color: '#2196f3',
        },
      ]
    : [];

  // Get status info from subscription
  const statusInfo = activeSubscription?.status
    ? getStatusIconAndColor(activeSubscription.status)
    : { icon: <Clock />, color: 'gray', label: 'Unknown' };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontSize: '2rem' }}>
        Dashboard {selectedBranch && `- ${selectedBranch.name}`}
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshCw size={18} />}
          onClick={handleRefreshData}
          disabled={subLoading}
        >
          {subLoading ? "Refreshing..." : "Refresh Data"}
        </Button>
        
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
      
      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={openUpgradeDialog}
        onClose={handleCloseUpgradeDialog}
        currentSubscriptionId={activeSubscription?.subscription || null}
        onUpgrade={handleUpgradeSubscription}
        error={upgradeError}
        loading={upgradingSubscription}
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
        <Typography variant="body1" sx={{ fontSize: '1rem' }}>Loading statistics...</Typography>
      ) : error ? (
        <Typography variant="body1" color="error" sx={{ fontSize: '1rem' }}>
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
            <Paper sx={{ width: '100%', maxWidth: 600, p: 3, bgcolor: '#2A2D32', color: 'white' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Subscription Details {selectedBranch && `for ${selectedBranch.name}`}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {subLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={30} />
                </Box>
              ) : activeSubscription ? (
                <>
                  <Typography variant="body1" sx={{ mb: 1, color: 'white', fontSize: '1rem' }}>
                    <strong>Branch:</strong> {
                      activeSubscription.branchName || 
                      activeSubscription.branchDetails?.name || 
                      (selectedBranch ? selectedBranch.name : 'Unknown')
                    }
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: 'white', fontSize: '1rem' }}>
                    <strong>Subscription Plan:</strong> {
                      activeSubscription.subscriptionName || 
                      activeSubscription.subscriptionDetails?.planName || 
                      'Standard Plan'
                    }
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: 'white', fontSize: '1rem' }}>
                    <strong>Start Date:</strong>{' '}
                    {new Date(activeSubscription.startDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: 'white', fontSize: '1rem' }}>
                    <strong>End Date:</strong>{' '}
                    {new Date(activeSubscription.endDate).toLocaleDateString()}
                  </Typography>
                  
                  {/* Order Credits Section with Progress Bar */}
                  <Box sx={{ mb: 3, mt: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body1" fontWeight="medium" sx={{ color: 'white', fontSize: '1rem' }}>
                        Order Credits
                      </Typography>
                      <Box>
                        <Chip 
                          label={`${getRemainingOrders()} remaining`} 
                          color={isCreditsLow() ? "warning" : "success"}
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={getOrderUsagePercentage()} 
                      color={isCreditsLow() ? "warning" : "success"}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="white">
                        Used: {activeSubscription.orderCount || 0}
                      </Typography>
                      <Typography variant="caption" color="white">
                        Total: {activeSubscription.subscriptionDetails?.maxOrders || 
                                activeSubscription.maxOrders || 100}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Warning message for low credits */}
                  {isCreditsLow() && (
                    <Alert 
                      severity={isCreditsExhausted() ? "error" : "warning"} 
                      icon={<AlertTriangle size={18} />}
                      sx={{ mb: 3 }}
                    >
                      {isCreditsExhausted() 
                        ? "You have used all your order credits. Please recharge now to continue accepting orders."
                        : "You're running low on order credits. Consider recharging to ensure uninterrupted service."}
                    </Alert>
                  )}
                  
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={1}
                    mt={2}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ color: statusInfo.color, mr: 2 }}>{statusInfo.icon}</Box>
                      <Typography
                        variant="body1"
                        sx={{ color: statusInfo.color, fontWeight: 600 }}
                      >
                        {statusInfo.label}
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      onClick={handleOpenConfigDialog}
                      color={isCreditsLow() ? "warning" : "primary"}
                    >
                      {isCreditsExhausted() ? "Recharge Now" : "Top Up"}
                    </Button>
                  </Box>

                  <Box display="flex" gap={1} mt={2}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleRenewSubscription()}  
                    >
                      Renew Subscription
                    </Button>
                  </Box>

                  <Box display="flex" gap={1} mt={2}>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={handleOpenUpgradeDialog}
                    >
                      Upgrade Subscription
                    </Button>
                  </Box>
                </>
              ) : (
                <Box py={2}>
                  <Typography variant="body1" align="center" sx={{ mb: 2, color: 'white' }}>
                    No active subscription found for this branch.
                  </Typography>
                  <Box display="flex" justifyContent="center">
                    <Button variant="contained" onClick={handleOpenConfigDialog}>
                      Purchase Subscription
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
}
