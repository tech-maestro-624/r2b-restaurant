// src/components/Dialog/purchaseSubscriptionDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { SubscriptionService } from '../../services/subscription.service';

interface PurchaseSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onPurchase: (subscriptionId: string, amount: number) => void;
  error: string | null;
  loading: boolean;
}

const PurchaseSubscriptionDialog: React.FC<PurchaseSubscriptionDialogProps> = ({
  open,
  onClose,
  onPurchase,
  error,
  loading,
}) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>('');
  const [fetchingSubscriptions, setFetchingSubscriptions] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSubscriptions();
    }
  }, [open]);

  useEffect(() => {
    // Reset selection when dialog opens
    if (open) {
      setSelectedSubscriptionId('');
    }
  }, [open]);

  const fetchSubscriptions = async () => {
    setFetchingSubscriptions(true);
    setFetchError(null);
    try {
      const response = await SubscriptionService.getAllSubscriptions();
      if (response.data && response.data.subscriptions) {
        setSubscriptions(response.data.subscriptions);
        
        // If there are subscriptions, preselect the first one
        if (response.data.subscriptions.length > 0) {
          setSelectedSubscriptionId(response.data.subscriptions[0]._id);
        }
      } else {
        setFetchError('No subscription plans available');
      }
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      setFetchError('Failed to fetch subscription plans. Please try again later.');
    } finally {
      setFetchingSubscriptions(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedSubscriptionId) {
      setFetchError('Please select a subscription plan');
      return;
    }
    
    const selectedPlan = subscriptions.find(sub => sub._id === selectedSubscriptionId);
    if (selectedPlan) {
      onPurchase(selectedSubscriptionId, selectedPlan.price);
    }
  };

  const getFeaturesList = (subscription: any) => {
    const features = [];
    
    if (subscription.maxOrders) {
      features.push(`${subscription.maxOrders} order credits`);
    }
    
    if (subscription.durationInDays) {
      features.push(`${subscription.durationInDays} days validity`);
    }
    
    // Add other features based on your subscription model
    if (subscription.features && Array.isArray(subscription.features)) {
      features.push(...subscription.features);
    }
    
    return features;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth   PaperProps={{ sx: { bgcolor: '#2A2D32', color: 'white' } }}>
      <DialogTitle>Purchase Subscription</DialogTitle>
      <DialogContent>
        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {fetchingSubscriptions ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={40} />
          </Box>
        ) : subscriptions.length === 0 ? (
          <Typography variant="body1" align="center" py={2}>
            No subscription plans available.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
              Select a subscription plan to purchase:
            </Typography>
            
            <RadioGroup
              value={selectedSubscriptionId}
              onChange={(e) => setSelectedSubscriptionId(e.target.value)}
            >
              {subscriptions.map((subscription) => (
                <Box
                  key={subscription._id}
                  sx={{
                    mb: 2,
                    border: '1px solid',
                    borderColor: selectedSubscriptionId === subscription._id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    p: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <FormControlLabel
                    value={subscription._id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" component="div">
                            {subscription.planName}
                          </Typography>
                          <Box>
                            <Chip
                              label={`₹${subscription.price}`}
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <List dense disablePadding>
                          {getFeaturesList(subscription).map((feature, idx) => (
                            <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                              <ListItemText primary={feature} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    }
                    sx={{ alignItems: 'flex-start', m: 0 }}
                  />
                </Box>
              ))}
            </RadioGroup>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !selectedSubscriptionId || subscriptions.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Purchase'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseSubscriptionDialog;