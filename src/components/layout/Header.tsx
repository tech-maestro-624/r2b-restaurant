import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { Menu as MenuIcon, User, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import BranchSelector from './BranchSelector';
import { useNavigate } from 'react-router-dom';

// Add a style element to the document with !important rules
const addGlobalStyle = () => {
  const styleId = 'custom-menu-styles';
  
  // Remove any existing style with this ID to prevent duplicates
  if (document.getElementById(styleId)) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    .MuiPopover-root .MuiPaper-root {
      background-color: #0F1215 !important;
      color: white !important;
    }
    
    .MuiMenu-list {
      background-color: #0F1215 !important;
      padding: 0 !important;
    }
    
    .MuiMenuItem-root {
      background-color: #0F1215 !important;
      color: white !important;
    }
    
    .MuiMenuItem-root:hover {
      background-color: #1C1F23 !important;
    }
  `;
  
  document.head.appendChild(style);
};

// Create a custom theme for the menu
const darkMenuTheme = createTheme({
  components: {
    MuiMenu: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            backgroundColor: '#0F1215',
            color: 'white',
          },
        },
        list: {
          backgroundColor: '#0F1215',
          padding: 0,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: '#0F1215',
          color: 'white',
          '&:hover': {
            backgroundColor: '#1C1F23',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#0F1215',
          color: 'white',
        },
      },
    },
  },
});

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Apply global styles on component mount
  useEffect(() => {
    addGlobalStyle();
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    navigate('profile');
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };
  
  // Style object with !important flags for direct application
  const menuPaperStyle = {
    backgroundColor: '#0F1215 !important' as any,
    color: 'white !important' as any,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const menuItemStyle = {
    backgroundColor: '#0F1215 !important' as any,
    color: 'white !important' as any,
    '&:hover': {
      backgroundColor: '#1C1F23 !important' as any,
    },
  };
  
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#0F1215',
        color: 'white',
      }}
      elevation={1}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon color="white" />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ mr: 3, color: 'white' }}>
          {isMobile ? 'Admin' : 'Restaurant Admin'}
        </Typography>
        <BranchSelector />
        <Box sx={{ flexGrow: 1 }} />

       

<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <IconButton
    color="inherit"
    aria-label="account"
    onClick={handleMenu}
  >
    <User size={20} color="white" />
  </IconButton>
</Box>


        <ThemeProvider theme={darkMenuTheme}>
          <Menu
            disablePortal
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            MenuListProps={{
              style: { backgroundColor: '#0F1215', color: 'white' },
            }}
            PaperProps={{
              style: menuPaperStyle,
              elevation: 0,
              sx: menuPaperStyle,
            }}
            PopoverClasses={{
              paper: 'custom-menu-paper',
            }}
            className="custom-menu"
          >
            <MenuItem 
              onClick={handleClose}
              style={{ backgroundColor: '#0F1215', color: 'white' }}
              sx={menuItemStyle}
            >
              Profile
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              style={{ backgroundColor: '#0F1215', color: 'white' }}
              sx={menuItemStyle}
            >
              Logout
            </MenuItem>
          </Menu>
        </ThemeProvider>
      </Toolbar>
    </AppBar>
  );
}