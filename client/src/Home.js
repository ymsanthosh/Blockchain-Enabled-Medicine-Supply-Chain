import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Container,
  Grid,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  alpha,
  CardMedia
} from "@mui/material";
import ArrowForward from "@mui/icons-material/ArrowForward";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Inventory from "@mui/icons-material/Inventory";
import Assignment from "@mui/icons-material/Assignment";
import Person from "@mui/icons-material/Person";
import Science from "@mui/icons-material/Science";
import Medication from "@mui/icons-material/Medication";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Store from "@mui/icons-material/Store";


const theme = createTheme({
  palette: {
    primary: {
      main: '#3a7bd5',
      light: '#83b1f5',
      dark: '#0d47a1'
    },
    secondary: {
      main: '#7c4dff',
      light: '#b47cff',
      dark: '#3f1dcb'
    },
    success: {
      main: '#00c853',
      light: '#5efc82',
      dark: '#009624'
    },
    warning: {
      main: '#ff9100',
      light: '#ffc246',
      dark: '#c56200'
    },
    info: {
      main: '#00b0ff',
      light: '#69e2ff',
      dark: '#0081cb'
    },
    background: {
      default: '#2A2A2A',
      paper: '#ffffff'
    }
  },
  shape: {
    borderRadius: 16
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700
    },
    h2: {
      fontWeight: 700
    },
    h3: {
      fontWeight: 600
    },
    h4: {
      fontWeight: 600
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 500
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
          }
        },
        outlined: {
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20
        }
      }
    }
  }
});

function Home() {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  const IconBox = ({ color, icon: Icon }) => (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
        p: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px'
      }}
    >
      {Icon && <Icon sx={{ fontSize: 48, color: 'white' }} />}
    </Box>
  );

  const FlowStep = ({ color, icon: Icon, label }) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", position: 'relative', zIndex: 1 }}>
      <Box
        sx={{
          width: 70,
          height: 70,
          background: `linear-gradient(135deg, ${theme.palette[color].light} 0%, ${theme.palette[color].main} 100%)`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 10px 20px ${alpha(theme.palette[color].main, 0.3)}`,
          mb: 1.5,
          border: '4px solid white'
        }}
      >
        {Icon && <Icon sx={{ fontSize: 32, color: 'white' }} />}
      </Box>
      <Typography variant="subtitle1" fontWeight="600" color="text.primary">
        {label}
      </Typography>
    </Box>
  );

  const ConnectionLine = () => (
    <Box
      sx={{
        height: 3,
        flexGrow: 1,
        background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.primary.main, 0.6)} 50%, ${alpha(theme.palette.primary.main, 0.3)} 100%)`,
        my: 'auto',
        mx: 1,
        display: { xs: 'none', md: 'block' }
      }}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            pt: { xs: 12, md: 16 },
            pb: { xs: 12, md: 20 },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #121212 0%, #2c2c2c 50%, #3a3a3a 100%)',
              zIndex: -2
            }
          }}
        >
          {/* Animated background elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              overflow: 'hidden'
            }}
          >
            {/* Animated circles */}
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  animation: 'float 15s infinite ease-in-out',
                  animationDelay: `${i * 0.8}s`,
                  width: { xs: 100 + i * 20, md: 150 + i * 30 },
                  height: { xs: 100 + i * 20, md: 150 + i * 30 },
                  left: `${10 + i * 15}%`,
                  top: `${5 + i * 12}%`,
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(5deg)' },
                    '100%': { transform: 'translateY(0) rotate(0deg)' }
                  }
                }}
              />
            ))}
          </Box>

          {/* Wave decoration at bottom */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -2,
              left: 0,
              width: '100%',
              height: '15%',
              zIndex: -1
            }}
          >
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              style={{
                width: '100%',
                height: '100%',
                transform: 'rotate(180deg)',
                display: 'block'
              }}
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                fill="#1a1a1a"
              ></path>
            </svg>
          </Box>

          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ position: 'relative' }}>
                  {/* Animated highlight badge - CHANGED COLORS */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: { xs: -40, md: -60 },
                      left: { xs: 0, md: -20 },
                      background: 'rgba(61, 90, 254, 0.3)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(61, 90, 254, 0.5)',
                      borderRadius: 8,
                      py: 1,
                      px: 2,
                      display: 'inline-flex',
                      alignItems: 'center',
                      boxShadow: '0 10px 20px rgba(61, 90, 254, 0.25)',
                      animation: 'pulse 3s infinite',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.05)' },
                        '100%': { transform: 'scale(1)' }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: theme.palette.secondary.light,
                        mr: 1
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      component="span"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600
                      }}
                    >
                      Blockchain-Powered
                    </Typography>
                  </Box>

                  {/* CHANGED GRADIENT FOR BETTER VISIBILITY */}
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      mb: 2,
                      mt: { xs: 4, md: 2 },
                      fontSize: { xs: '2.5rem', md: '4.5rem' },
                      fontWeight: 800,
                      background: 'linear-gradient(90deg, #ffffff 30%, #3F3FFF 100%)',
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 5px 25px rgba(0,0,0,0.2)'
                    }}
                  >
                    Pharmaceutical<br />Supply Chain
                  </Typography>

                  {/* INCREASED OPACITY FOR BETTER READABILITY */}
                  <Typography
                    variant="h5"
                    sx={{
                      maxWidth: 600,
                      mb: 5,
                      color: '#ffffff',
                      opacity: 0.95,
                      fontWeight: 400,
                      lineHeight: 1.6,
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    Secure, transparent, and efficient tracking of pharmaceutical products from production to consumer using cutting-edge blockchain technology.
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    {/* UPDATED PRIMARY BUTTON */}
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigateTo("/track")}
                      sx={{
                        bgcolor: '#3d5afe',
                        color: '#ffffff',
                        '&:hover': {
                          bgcolor: '#536dfe',
                          color: '#ffffff',
                          transform: 'translateY(-5px)'
                        },
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        boxShadow: '0 8px 25px rgba(61, 90, 254, 0.4)'
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Track Medicines
                    </Button>

                    
                  </Box>

                  {/* Stats indicators - IMPROVED CONTRAST */}
                  <Box
                    sx={{
                      mt: 6,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: { xs: 3, md: 5 }
                    }}
                  >
                    {[
                      { value: '100%', label: 'Traceability' },
                      { value: '24/7', label: 'Monitoring' },
                      { value: '0%', label: 'Counterfeit' }
                    ].map((stat, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="h4"
                          sx={{
                            color: '#ffffff',
                            fontWeight: 700,
                            mb: 0.5
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#64b5f6',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: 1
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  display: { xs: 'none', md: 'block' },
                  position: 'relative'
                }}
              >
                {/* 3D Tilting Card Effect */}
                <Box
                  sx={{
                    position: 'relative',
                    perspective: '1500px',
                    width: '100%',
                    height: '100%',
                    '&:hover .card-inner': {
                      transform: 'rotateY(-5deg) rotateX(5deg)',
                    }
                  }}
                >
                  <Box
                    className="card-inner"
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <Box
                      component="img"
                      src="https://www.techtarget.com/rms/onlineImages/erp-supply_chain_management.png"
                      alt="Pharmaceutical supply chain illustration"
                      sx={{
                        width: '90%',
                        maxWidth: 500,
                        borderRadius: 4,
                        boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
                        transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)',
                        transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                        '&:hover': {
                          transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg) translateZ(10px)',
                        }
                      }}
                    />

                    {/* Floating badge decorations - UPDATED COLORS */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '15%',
                        right: '-5%',
                        background: 'rgba(66, 165, 245, 0.95)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(66, 165, 245, 0.5)',
                        borderRadius: '50%',
                        width: 80,
                        height: 80,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 15px 35px rgba(33, 150, 243, 0.4)',
                        animation: 'float 6s infinite ease-in-out',
                        animationDelay: '0.8s'
                      }}
                    >
                      <LocalShipping sx={{ fontSize: 40, color: '#ffffff' }} />
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '-8%',
                        background: 'rgba(83, 109, 254, 0.95)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(83, 109, 254, 0.5)',
                        borderRadius: '50%',
                        width: 70,
                        height: 70,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 15px 35px rgba(61, 90, 254, 0.4)',
                        animation: 'float 5s infinite ease-in-out',
                        animationDelay: '0.3s'
                      }}
                    >
                      <Science sx={{ fontSize: 35, color: '#ffffff' }} />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Main Content */}
        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 8, px: { xs: 2, md: 3 } }}>
          {/* Process Overview - Modern Cards */}
          <Box sx={{ mb: 12 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              align="center"
              sx={{
                mb: { xs: 6, md: 8 },
                color: '#fff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '80px',
                  height: '4px',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.8)})`,
                  mx: 'auto',
                  mt: 3,
                  borderRadius: '2px'
                }
              }}
            >
              End-to-End Supply Chain Solution
            </Typography>

            <Grid container spacing={2} rows={2} columns={16} justifyContent="center">
              {/* Step 1 - Modern Card */}
              <Grid item xs={2} sm={2} md={2}>
                <Card sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.light, 0.3),
                  background: 'linear-gradient(to bottom, #ffffff, #f8faff)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.12)}`
                  }
                }}>
                  <Box sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3
                    }}>
                      <Person sx={{
                        fontSize: 40,
                        color: theme.palette.primary.main
                      }} />
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                      Register
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Securely register all supply chain participants with verified identities !
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigateTo("/roles")}
                      endIcon={<KeyboardArrowRight />}
                      fullWidth
                      sx={{
                        borderWidth: 2,
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderWidth: 2
                        }
                      }}
                    >
                      Get Started
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* Step 2 - Modern Card */}
              <Grid item xs={2} sm={2} md={2}>
                <Card sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.secondary.light, 0.3),
                  background: 'linear-gradient(to bottom, #ffffff, #faf5ff)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 15px 35px ${alpha(theme.palette.secondary.main, 0.12)}`
                  }
                }}>
                  <Box sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3
                    }}>
                      <Inventory sx={{
                        fontSize: 40,
                        color: theme.palette.secondary.main
                      }} />
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                      Order
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Create and manage medicine orders across the network with tracking !
                    </Typography>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigateTo("/ordermed")}
                      endIcon={<KeyboardArrowRight />}
                      fullWidth
                      sx={{
                        borderWidth: 2,
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.secondary.main, 0.05),
                          borderWidth: 2
                        }
                      }}
                    >
                      Place Order
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* Step 3 - Modern Card */}
              <Grid item xs={2} sm={2} md={2}>
                <Card sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.warning.light, 0.3),
                  background: 'linear-gradient(to bottom, #ffffff, #fff8f5)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 15px 35px ${alpha(theme.palette.warning.main, 0.12)}`
                  }
                }}>
                  <Box sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3
                    }}>
                      <LocalShipping sx={{
                        fontSize: 40,
                        color: theme.palette.warning.main
                      }} />
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                      Control
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Monitor and control the flow of medicines through every supply chain.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => navigateTo("/supply")}
                      endIcon={<KeyboardArrowRight />}
                      fullWidth
                      sx={{
                        borderWidth: 2,
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                          borderWidth: 2
                        }
                      }}
                    >
                      Monitor
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* Step 4 - Modern Card */}
              <Grid item xs={2} sm={2} md={2}>
                <Card sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.success.light, 0.3),
                  background: 'linear-gradient(to bottom, #ffffff, #f5fff9)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 15px 35px ${alpha(theme.palette.success.main, 0.12)}`
                  }
                }}>
                  <Box sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3
                    }}>
                      <Assignment sx={{
                        fontSize: 40,
                        color: theme.palette.success.main
                      }} />
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                      Track
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Track medicines and verify its authenticity across all distribution points.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => navigateTo("/track")}
                      endIcon={<KeyboardArrowRight />}
                      fullWidth
                      sx={{
                        borderWidth: 2,
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          borderWidth: 2
                        }
                      }}
                    >
                      Verify Now
                    </Button>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Admin Actions - Modern Split Cards */}
          <Box sx={{ mb: 12 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              align="center"
              sx={{
                mb: { xs: 6, md: 8 },
                color: '#fff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '80px',
                  height: '4px',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.8)})`,
                  mx: 'auto',
                  mt: 3,
                  borderRadius: '2px'
                }
              }}
            >
              Administrative Actions
            </Typography>

            <Grid container spacing={5} justifyContent="center">
              {/* Add Medicine - Modern Split Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  height: '100%',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.light, 0.3),
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: `0 15px 35px ${alpha(theme.palette.info.main, 0.12)}`,
                    transform: 'translateY(-5px)'
                  }
                }}>
                  <Box sx={{
                    width: { xs: '100%', sm: '40%' },
                    background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3
                  }}>
                    <Box sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: alpha('#fff', 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(5px)',
                      border: '2px solid white'
                    }}>
                      <Medication sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                  </Box>
                  <Box sx={{
                    flex: 1,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                      Medicine Registry
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Add new pharmaceutical products along with complete specifications and regulatory details.
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        variant="contained"
                        color="info"
                        onClick={() => navigateTo("/addmed")}
                        endIcon={<ArrowForward />}
                        fullWidth
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: `0 5px 15px ${alpha(theme.palette.info.main, 0.4)}`
                        }}
                      >
                        Register Medicine
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              {/* Add Raw Material - Modern Split Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  height: '100%',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.secondary.light, 0.3),
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: `0 15px 35px ${alpha(theme.palette.secondary.main, 0.12)}`,
                    transform: 'translateY(-5px)'
                  }
                }}>
                  <Box sx={{
                    width: { xs: '100%', sm: '40%' },
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3
                  }}>
                    <Box sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: alpha('#fff', 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(5px)',
                      border: '2px solid white'
                    }}>
                      <Science sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                  </Box>
                  <Box sx={{
                    flex: 1,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                      Raw Material Inventory
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Manage raw material stock with batch tracking and complete quality control documentation.
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigateTo("/addRM")}
                        endIcon={<ArrowForward />}
                        fullWidth
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: `0 5px 15px ${alpha(theme.palette.secondary.main, 0.4)}`
                        }}
                      >
                        Add Materials
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Supply Chain Visualization - Modern Design */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              mb: 8,
              background: 'white',
              borderRadius: 4,
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                opacity: 0.8
              }
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="overline"
                component="div"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  letterSpacing: 1,
                  mb: 1
                }}
              >
                END-TO-END VISIBILITY
              </Typography>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(90deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent'
                }}
              >
                Supply Chain Journey
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  color: 'text.secondary',
                  fontSize: '1.1rem'
                }}
              >
                Track every step of your pharmaceutical products from raw materials to end consumers
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                position: 'relative',
                py: 4
              }}
            >
              {/* Animated connection line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
                  display: { xs: 'none', md: 'block' },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    animation: 'progress 8s infinite ease-in-out',
                    '@keyframes progress': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' }
                    }
                  }
                }}
              />

              {[
                { color: "primary", icon: Science, label: "Raw Materials" },
                { color: "secondary", icon: Inventory, label: "Manufacturing" },
                { color: "warning", icon: LocalShipping, label: "Distribution" },
                { color: "success", icon: Store, label: "Retail" },
                { color: "info", icon: Assignment, label: "Verification" }
              ].map((step, index) => (
                <React.Fragment key={index}>
                  <FlowStep
                    color={step.color}
                    icon={step.icon}
                    label={step.label}
                  />
                  {index < 4 && <ConnectionLine />}
                </React.Fragment>
              ))}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigateTo("/track")}
                sx={{
                  px: 6,
                  py: 1.5,
                  fontWeight: 600,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  boxShadow: `0 5px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                  }
                }}
              >
                View Full Supply Chain
              </Button>
            </Box>
          </Paper>
        </Container>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: "#1a237e",
            color: "white",
            py: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.7)} 100%)`,
              zIndex: 0
            }
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h6"
              align="center"
              sx={{
                fontWeight: 500,
                letterSpacing: 1
              }}
            >
              &copy;2025 Pharmaceutical Supply Chain
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Home;