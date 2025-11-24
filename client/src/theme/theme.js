import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f5ff',
      light: '#5dfdff',
      dark: '#00c2cc',
    },
    secondary: {
      main: '#ff3366',
      light: '#ff6690',
      dark: '#cc0033',
    },
    background: {
      default: '#0a0e1a',
      paper: 'rgba(15, 23, 42, 0.7)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.75)',
    },
    error: {
      main: '#ff3366',
    },
    success: {
      main: '#00ff88',
    },
    warning: {
      main: '#ffb800',
    },
    info: {
      main: '#00f5ff',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: {
      fontSize: '2.75rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.65,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 245, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 245, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 16px 48px 0 rgba(0, 245, 255, 0.25)',
            border: '1px solid rgba(0, 245, 255, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 245, 255, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '12px 28px',
          fontSize: '0.95rem',
          fontWeight: 700,
          boxShadow: 'none',
          textTransform: 'none',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 245, 255, 0.5)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'linear-gradient(135deg, #00f5ff 0%, #00c2cc 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5dfdff 0%, #00f5ff 100%)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 245, 255, 0.5)',
          color: '#00f5ff',
          borderWidth: '2px',
          '&:hover': {
            borderColor: '#00f5ff',
            borderWidth: '2px',
            background: 'rgba(0, 245, 255, 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(0, 245, 255, 0.12)',
          border: '1px solid rgba(0, 245, 255, 0.4)',
          color: '#00f5ff',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            '& fieldset': {
              borderColor: 'rgba(0, 245, 255, 0.2)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 245, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f5ff',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 245, 255, 0.08)',
        },
        head: {
          fontWeight: 700,
          background: 'rgba(0, 245, 255, 0.08)',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
  },
});

export default theme;
