// src/components/Dialog/upgradeDialog.tsx
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

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  currentSubscriptionId: string | null;
  onUpgrade: (subscriptionId: string, amount: number) => void;
  error: string | null;
  loading: boolean;
}

const UpgradeDialog: React.FC<UpgradeDialogProps> = ({
  open,
  onClose,
  currentSubscriptionId,
  onUpgrade,
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
        // Filter out the current subscription
        const filteredSubscriptions = response.data.subscriptions.filter(
          (sub: any) => sub._id !== currentSubscriptionId
        );
        setSubscriptions(filteredSubscriptions);
        
        // If there are subscriptions, preselect the first one
        if (filteredSubscriptions.length > 0) {
          setSelectedSubscriptionId(filteredSubscriptions[0]._id);
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
      onUpgrade(selectedSubscriptionId, selectedPlan.price);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#2A2D32', color: 'white' }}>Upgrade Subscription</DialogTitle>
      <DialogContent sx={{ bgcolor: '#2A2D32', color: 'white' }}>
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
            No other subscription plans available for upgrade.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
              Select a subscription plan to upgrade to:
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
                    bgcolor: '#2A2D32',
                    color: 'white',
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
      <DialogActions sx={{ bgcolor: '#2A2D32' }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !selectedSubscriptionId || subscriptions.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Upgrade'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpgradeDialog;