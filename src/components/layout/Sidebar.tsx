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
  Settings,
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
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    {
      label: 'Restaurant',
      icon: <Store size={20} />,
      children: [
        { path: '/restaurants', label: 'Restaurants', icon: <Store size={20} /> },
        { path: '/branches', label: 'Branches', icon: <Map size={20} /> },
      ],
    },
    { path: '/menu', label: 'Menu', icon: <MenuIcon size={20} /> },
    { path: '/orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
    { path: '/coupons', label: 'Coupons', icon: <ShoppingBag size={20} /> },

    // { path: '/customers', label: 'Customers', icon: <Users size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const drawer = (
    <Box sx={{ mt: 1 }}>
      <List>
        {menuItems.map((item) =>
          item.children ? (
            <Box key={item.label}>
              <ListItemButton onClick={() => setMenuOpen(!menuOpen)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {menuOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </ListItemButton>
              <Collapse in={menuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      sx={{ pl: 4 }}
                      selected={location.pathname === child.path}
                      onClick={() => handleNavigation(child.path)}
                    >
                      <ListItemIcon>{child.icon}</ListItemIcon>
                      <ListItemText primary={child.label} />
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
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
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
        },
      }}
    >
      {drawer}
    </Drawer>
  );
}