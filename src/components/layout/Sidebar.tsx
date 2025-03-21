import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Store,
  Map,
  Menu as MenuIcon,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'temporary';
}

const drawerWidth = 240;

export default function Sidebar({ open, onClose, variant }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} color="#4caf50" /> },
    {
      label: 'Restaurant',
      icon: <Store size={20} color="#ff9800" />,
      children: [
        { path: '/branches', label: 'Branches', icon: <Map size={20} color="#2196f3" /> },
      ],
    },
    { path: '/menu', label: 'Menu', icon: <MenuIcon size={20} color="#f44336" /> },
    { path: '/orders', label: 'Orders', icon: <ShoppingBag size={20} color="#9c27b0" /> },
    { path: '/coupons', label: 'Coupons', icon: <ShoppingBag size={20} color="#3f51b5" /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const drawer = (
    <Box sx={{ mt: 1, bgcolor: '#0F1215', color: 'white' }}>
      <List>
        {menuItems.map((item) =>
          item.children ? (
            <Box key={item.label}>
              <ListItemButton
                onClick={() => setMenuOpen(!menuOpen)}
                sx={{
                  '&:hover': {
                    backgroundColor: '#1c1f23',
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.icon.props.color, '&:hover': { color: '#ffffff' } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ color: 'white' }} />
                {menuOpen ? <ChevronDown size={20} color="white" /> : <ChevronRight size={20} color="white" />}
              </ListItemButton>
              <Collapse in={menuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      sx={{
                        pl: 4,
                        '&:hover': {
                          backgroundColor: '#1c1f23',
                        },
                      }}
                      selected={location.pathname === child.path}
                      onClick={() => handleNavigation(child.path)}
                    >
                      <ListItemIcon sx={{ color: child.icon.props.color, '&:hover': { color: '#ffffff' } }}>
                        {child.icon}
                      </ListItemIcon>
                      <ListItemText primary={child.label} sx={{ color: 'white' }} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          ) : (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&:hover': {
                    backgroundColor: '#1c1f23',
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.icon.props.color, '&:hover': { color: '#ffffff' } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ color: 'white' }} />
              </ListItemButton>
            </ListItem>
          )
        )}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: '64px',
          height: 'calc(100% - 64px)',
          backgroundColor: '#0F1215',
        },
        borderRight:'1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      {drawer}
    </Drawer>
  );
}