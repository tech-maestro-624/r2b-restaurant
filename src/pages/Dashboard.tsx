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
import DateRangeDialog from '../components/Dialog/filterDialog';

import TopUpDialog from '../components/Dialog/topUpDialog';
import UpgradeDialog from '../components/Dialog/upgradeDialog';
import PurchaseSubscriptionDialog from '../components/Dialog/purchaseDialog';
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
  console.log(selectedBranch);
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
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState<boolean>(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchasingSubscription, setPurchasingSubscription] = useState<boolean>(false);

  // Calculate remaining orders and credits status
  const getRemainingOrders = () => {
    if (!activeSubscription) return 0;
    
    // Get max orders from subscription status if available, otherwise from plan
    const maxOrders = activeSubscription.maxOrders || 
                     activeSubscription.subscriptionDetails?.maxOrders || 100;
    
    // Get current used orders
    const usedOrders = activeSubscription.orderCount || 0;
    
    // Calculate remaining orders
    return Math.max(0, maxOrders - usedOrders);
  };
  
  const getOrderUsagePercentage = () => {
    if (!activeSubscription) return 0;
    
    // Get max orders from subscription status if available, otherwise from plan
    const maxOrders = activeSubscription.maxOrders || 
                     activeSubscription.subscriptionDetails?.maxOrders || 100;
    
    if (maxOrders === 0) return 0; // Avoid division by zero
    
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
      console.log("Stats response:", response.data);
      setStats(response.data);
      // console.log(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      setError('Failed to fetch statistics.');
    } finally {
      setLoading(false);
    }
  };
  console.log('stats',stats);
  // Fetch subscription data
 // Update the fetchSubscription function in Dashboard.tsx to ensure it properly reads maxOrders

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
    
    console.log("Total subscriptions in response:", subscriptions.length);
    
    // IMPORTANT: We need to make sure we're only considering subscriptions for THIS branch
    // Convert selectedBranch._id to string for consistent comparison
    const selectedBranchIdStr = String(selectedBranch._id).trim();
    console.log("Current branch ID we're looking for:", selectedBranchIdStr);
    
    // Log all subscription branch IDs for debugging
    subscriptions.forEach((sub, index) => {
      let branchId = "unknown";
      if (sub.branch) {
        if (typeof sub.branch === 'object' && sub.branch._id) {
          branchId = String(sub.branch._id).trim();
        } else if (typeof sub.branch === 'string') {
          branchId = String(sub.branch).trim();
        }
      }
      console.log(`Subscription ${index} - Branch ID: ${branchId}`);
    });
    
    // Filter to ONLY get subscriptions that EXACTLY match this branch
    const matchingSubscriptions = subscriptions.filter(sub => {
      if (!sub.branch) return false;
      
      let branchId = null;
      if (typeof sub.branch === 'object' && sub.branch._id) {
        branchId = String(sub.branch._id).trim();
      } else if (typeof sub.branch === 'string') {
        branchId = String(sub.branch).trim();
      }
      
      const isMatch = branchId === selectedBranchIdStr;
      console.log(`Checking branch [${branchId}] against [${selectedBranchIdStr}]: ${isMatch}`);
      return isMatch;
    });
    
    console.log(`Found ${matchingSubscriptions.length} subscriptions specifically for this branch`);
    
    // Find the active subscription - prioritize ones with status 'active'
    let foundSubscription = null;
    
    // First try to find an active subscription
    foundSubscription = matchingSubscriptions.find(sub => 
      sub.status && sub.status.toLowerCase() === 'active'
    );
    
    // If no active subscription, try to find any subscription with a valid date range
    if (!foundSubscription) {
      const now = new Date();
      foundSubscription = matchingSubscriptions.find(sub => {
        if (!sub.startDate || !sub.endDate) return false;
        
        const startDate = new Date(sub.startDate);
        const endDate = new Date(sub.endDate);
        return startDate <= now && endDate >= now;
      });
    }
    
    // If still no subscription found, just take the first one if it exists
    if (!foundSubscription && matchingSubscriptions.length > 0) {
      foundSubscription = matchingSubscriptions[0];
    }
    
    // Process the found subscription if it exists
    if (foundSubscription) {
      // Validate that this subscription belongs to the correct branch
      let subscriptionBranchId = null;
      if (typeof foundSubscription.branch === 'object' && foundSubscription.branch._id) {
        subscriptionBranchId = String(foundSubscription.branch._id).trim();
      } else if (typeof foundSubscription.branch === 'string') {
        subscriptionBranchId = String(foundSubscription.branch).trim();
      }
      
      // Final validation check - MUST have matching branch ID
      if (subscriptionBranchId !== selectedBranchIdStr) {
        console.error("Branch ID mismatch in final validation! This should not happen.");
        console.error(`Branch from subscription: ${subscriptionBranchId}`);
        console.error(`Current selected branch: ${selectedBranchIdStr}`);
        setActiveSubscription(null);
        setSubLoading(false);
        return;
      }
      
      console.log("Confirmed subscription for this branch:", foundSubscription);
      
      // Extract subscription details safely
      const subscriptionDetails = foundSubscription.subscription || {};
      const branchDetails = foundSubscription.branch || {};
      
      // Get maxOrders with fallbacks
      const maxOrders = foundSubscription.maxOrders || 
                      (subscriptionDetails.maxOrders ? subscriptionDetails.maxOrders : 100);
      
      // Create the transformed subscription object
      const transformedSubscription = {
        _id: foundSubscription._id,
        branch: typeof branchDetails === 'object' ? branchDetails._id : branchDetails,
        branchName: typeof branchDetails === 'object' ? branchDetails.name : selectedBranch.name,
        subscription: typeof subscriptionDetails === 'object' ? subscriptionDetails._id : subscriptionDetails,
        subscriptionName: typeof subscriptionDetails === 'object' ? 
                        (subscriptionDetails.planName || 'Standard Plan') : 'Standard Plan',
        startDate: foundSubscription.startDate,
        endDate: foundSubscription.endDate,
        orderCount: foundSubscription.orderCount || 0,
        price: typeof subscriptionDetails === 'object' ? 
              (subscriptionDetails.price || 0) : (foundSubscription.price || 0),
        status: foundSubscription.status || 'unknown',
        branchDetails: branchDetails,
        subscriptionDetails: subscriptionDetails,
        maxOrders: maxOrders,
        remainingOrders: Math.max(0, maxOrders - (foundSubscription.orderCount || 0)),
        usagePercentage: maxOrders ? 
          Math.min(100, Math.round(((foundSubscription.orderCount || 0) / maxOrders) * 100)) : 0
      };
      
      console.log("Setting active subscription for branch:", transformedSubscription);
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
      console.log("No valid subscription found for this branch after filtering");
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
      console.log(fetchStats());
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
      
      if (response.data && response.data.razorpayOrderId) {
        console.log("Initiating top-up payment for Razorpay order:", response.data.razorpayOrderId);
        openRazorpayCheckout(response.data.razorpayOrderId, 'topup');
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
      if (!selectedBranch || !selectedBranch._id) {
        alert('No branch selected. Please select a branch first.');
        return;
      }
  
      if (!activeSubscription) {
        alert('No active subscription found to renew.');
        return;
      }
  
      setUpdatingConfig(true);
      
      // Log parameters for debugging
      console.log("Renewing subscription with params:", {
        branchId: selectedBranch._id,
        subscriptionId: activeSubscription.subscription,
        currentSubscriptionId: activeSubscription._id
      });
        
      // Calculate the price - use the subscription details if available, otherwise use the price directly
      let price = 0;
      
      // Check all possible price locations
      if (activeSubscription.subscriptionDetails && typeof activeSubscription.subscriptionDetails === 'object') {
        price = parseFloat(activeSubscription.subscriptionDetails.price || 0);
      } else if (activeSubscription.price) {
        price = parseFloat(activeSubscription.price);
      }
      
      console.log(`Calculated price for renewal: ${price}`);
                    
      if (!price || isNaN(price) || price <= 0) {
        throw new Error('Could not determine a valid subscription price for renewal');
      }
      
      // Create the payload with complete information
      const renewalPayload = {
        branchId: selectedBranch._id,
        subscriptionId: activeSubscription.subscription,
        currentSubscriptionId: activeSubscription._id,
        price: price
      };
      
      console.log("Sending renewal request with payload:", renewalPayload);
      
      // Call the API with complete information
      const response = await SubscriptionService.renewSubscription(
        selectedBranch._id, 
        price,
      );
      
      console.log("Renewal API response:", response);
      
      if (response.data && response.data.razorpayOrderId) {
        console.log("Opening Razorpay checkout for renewal with order ID:", response.data.razorpayOrderId);
        openRazorpayCheckout(response.data.razorpayOrderId, 'renew');
      } else {
        console.error("Missing razorpayOrderId in response:", response);
        alert('Failed to initiate payment: No order ID received from server.');
      }
    } catch (error:any) {
      console.error("Renewal error:", error);
      setConfigError(`Failed to renew subscription: ${error.message || 'Unknown error'}`);
      alert(`Failed to renew subscription: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdatingConfig(false);
    }
  };

  const handleOpenPurchaseDialog = () => {
    setOpenPurchaseDialog(true);
    setPurchaseError(null);
  };

  const handleClosePurchaseDialog = () => {
    setOpenPurchaseDialog(false);
  };

  const handlePurchaseSubscription = async (subscriptionId: string, amount: number) => {
    if (!selectedBranch || !selectedBranch._id) {
      setPurchaseError('No branch selected');
      return;
    }
    
    setPurchasingSubscription(true);
    
    try {
      console.log('Purchasing subscription:', {
        branchId: selectedBranch._id,
        subscriptionId,
        amount
      });
      
      const response = await SubscriptionService.purchaseSubscription(
        selectedBranch._id,
        subscriptionId,
        amount
      );
      
      console.log('Purchase response:', response);
      
      if (response.data && response.data.razorpayOrderId) {
        openRazorpayCheckout(response.data.razorpayOrderId, 'purchase');
      } else {
        setPurchaseError('Failed to initiate payment. Please try again.');
      }
    } catch (error: any) {
      console.error('Error purchasing subscription:', error);
      setPurchaseError(`Failed to purchase subscription: ${error.message || 'Unknown error'}`);
    } finally {
      setPurchasingSubscription(false);
    }
  };

  const openRazorpayCheckout = (razorpayOrderId, paymentType = 'topup') => {
    console.log(`Opening Razorpay for ${paymentType} payment with order ID: ${razorpayOrderId}`);
    
    const options = {
      key: 'rzp_test_LKwcKdhRp0mq9f',
      currency: 'INR',
      name: 'Roll2Bowl Technologies Pvt Ltd',
      description: `Payment for your ${
        paymentType === 'topup' ? 'top-up' : 
        paymentType === 'renew' ? 'subscription renewal' : 
        paymentType === 'upgrade' ? 'subscription upgrade' : 'subscription purchase'
      }`,
      order_id: razorpayOrderId,
      handler: async (response) => {
        try {
          console.log(`${paymentType} payment successful:`, response);
          
          // Create payment verification data object with consistent structure
          const paymentVerificationData = {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            // Add additional fields for renewal if needed
            ...(paymentType === 'renew' && {
              branchId: selectedBranch._id,
              subscriptionId: activeSubscription?.subscription
            })
          };
          
          console.log(`Verification data for ${paymentType}:`, paymentVerificationData);
          
          // Use the appropriate endpoint based on payment type
          let verifyEndpoint = '';
          let successMsg = '';
          
          if (paymentType === 'topup') {
            verifyEndpoint = '/subscription-topup-verify';
            successMsg = `Payment successful! Your top-up of ${quantity} orders has been processed.`;
          } else if (paymentType === 'renew') {
            verifyEndpoint = '/subscription/renew-verify';
            successMsg = 'Payment successful! Your subscription has been renewed.';
          } else if (paymentType === 'upgrade') {
            verifyEndpoint = '/subscription/upgrade-verify';
            successMsg = 'Payment successful! Your subscription has been upgraded.';
          } else {
            verifyEndpoint = '/subscription/purchase-verify';
            successMsg = 'Payment successful! Your subscription has been purchased.';
          }
          
          console.log(`Using verification endpoint for ${paymentType}:`, verifyEndpoint);
          
          // Invoke the payment verification with additionalData if needed
          console.log(`Calling payment verification for ${paymentType}...`);
          const verifyResponse = await PaymentService.verifyPayment(
            paymentVerificationData,
            verifyEndpoint
          );
  
          console.log(`Verification response for ${paymentType}:`, verifyResponse);
  
          if (verifyResponse.status === 200) {
            console.log(`${paymentType} verification successful`);
            alert(successMsg);
            
            // Close any open dialogs
            setOpenConfigDialog(false);
            setOpenUpgradeDialog(false);
            setOpenPurchaseDialog(false);
            
            // Reset any errors
            setConfigError(null);
            setUpgradeError(null);
            setPurchaseError(null);
            
            // Refresh data with slight delay to ensure server has processed the change
            setTimeout(() => {
              fetchStats();
              fetchConfiguration();
              fetchSubscription();
            }, 1000);
            
            // Set success message
            setSuccessMessage(successMsg);
          } else {
            console.error(`${paymentType} verification failed:`, verifyResponse);
            alert('Payment verification failed. Please contact support with your payment reference number.');
          }
        } catch (error) {
          console.error(`Error verifying ${paymentType} payment:`, error);
          console.error('Error details:', error.response?.data || error.message);
          alert(`Error verifying payment: ${error.message || 'Unknown error'}`);
        }
      },
      theme: {
        color: '#53a20e',
      },
      modal: {
        ondismiss: () => {
          console.log(`${paymentType} payment cancelled by user`);
          alert('Payment cancelled.');
        },
      },
    };
  
    try {
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      console.log('Razorpay checkout opened successfully');
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      alert('Could not open payment window. Please try again later.');
    }
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
                        Total: {activeSubscription.maxOrders || 
                                activeSubscription.subscriptionDetails?.maxOrders || 100}
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
                      sx={{ bgcolor: 'green', '&:hover': { bgcolor: 'darkgreen' } }}
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
                    <Button variant="contained" onClick={handleOpenPurchaseDialog}>
                      Purchase Subscription
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        </>
      )}

      {/* Purchase Subscription Dialog */}
      <PurchaseSubscriptionDialog
        open={openPurchaseDialog}
        onClose={handleClosePurchaseDialog}
        onPurchase={handlePurchaseSubscription}
        error={purchaseError}
        loading={purchasingSubscription}
      />
    </Box>
  );
}
