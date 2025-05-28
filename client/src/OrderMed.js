import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";

// Material UI imports
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  FormHelperText
} from "@mui/material";

// Material UI Icons
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import FactoryIcon from "@mui/icons-material/Factory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Science from "@mui/icons-material/Science";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Inventory from "@mui/icons-material/Inventory";
import Check from "@mui/icons-material/Check";
import Warning from "@mui/icons-material/Warning";
import Verified from "@mui/icons-material/Verified";

function OrderMed() {
  const navigate = useNavigate();
  
  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setLoader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadWeb3 = async () => {
    setError("");
    try {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        setError("Non-Ethereum browser detected. Consider using MetaMask!");
      }
    } catch (err) {
      setError("Error connecting to MetaMask: " + err.message);
    }
  };

  const loadBlockchaindata = async () => {
    setLoader(true);
    setError("");
    try {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setCurrentaccount(accounts[0]);
      const networkId = await web3.eth.net.getId();
      const networkData = SupplyChainABI.networks[networkId];
      
      if (networkData) {
        const supplychain = new web3.eth.Contract(
          SupplyChainABI.abi,
          networkData.address
        );
        setSupplyChain(supplychain);
        
        // Load medicines
        const medicineCtr = await supplychain.methods.medicineCtr().call();
        const medicineList = [];
        for (let i = 0; i < medicineCtr; i++) {
          const medicine = await supplychain.methods.medicines(i + 1).call();
          medicineList.push(medicine);
        }
        setMedicines(medicineList);
        
        // Load orders
        const orderCtr = await supplychain.methods.orderCtr().call();
        const fetchedOrders = [];
        for (let i = 0; i < orderCtr; i++) {
          const order = await supplychain.methods.orders(i + 1).call();
          fetchedOrders.push(order);
        }
        setOrders(fetchedOrders);
        
        setLoader(false);
      } else {
        setError("Smart contract not deployed on current network");
        setLoader(false);
      }
    } catch (err) {
      setError("Error loading blockchain data: " + err.message);
      setLoader(false);
    }
  };

  const handleMedicineChange = (event) => {
    setSelectedMedicineId(event.target.value);
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    
    if (!selectedMedicineId) {
      setError("Please select a medicine");
      setSubmitting(false);
      return;
    }
    
    try {
      await SupplyChain.methods
        .addOrder(selectedMedicineId)
        .send({ from: currentaccount });
      setSuccess("Order placed successfully!");
      setSelectedMedicineId("");
      await loadBlockchaindata();
    } catch (err) {
      setError("Error placing order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to get the stage name from enum value
  const getStageText = (stage) => {
    const stages = [
      "Initialized",
      "Raw Material Supply",
      "Manufacturing",
      "Distribution",
      "Retail",
      "Sold"
    ];
    return stages[stage] || "Unknown";
  };

  // Function to get appropriate icon for each stage
  const getStageIcon = (stage) => {
    switch(parseInt(stage)) {
      case 0: return <ShoppingCartIcon sx={{ fontSize: '14px !important' }} />;
      case 1: return <FactoryIcon sx={{ fontSize: '14px !important' }} />;
      case 2: return <MedicalServicesIcon sx={{ fontSize: '14px !important' }} />;
      case 3: return <LocalShippingIcon sx={{ fontSize: '14px !important' }} />;
      case 4: return <StoreIcon sx={{ fontSize: '14px !important' }} />;
      case 5: return <PersonIcon sx={{ fontSize: '14px !important' }} />;
      default: return <ShoppingCartIcon sx={{ fontSize: '14px !important' }} />;
    }
  };

  // Function to get color for stage chip
  const getStageColor = (stage) => {
    switch(parseInt(stage)) {
      case 0: return "default";
      case 1: return "primary";
      case 2: return "secondary";
      case 3: return "warning";
      case 4: return "info";
      case 5: return "success";
      default: return "default";
    }
  };

  // Get medicine name by ID
  const getMedicineName = (id) => {
    const medicine = medicines.find(med => med.id === id);
    return medicine ? medicine.name : `Medicine ${id}`;
  };

  if (loader) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: "primary.main",
              mb: 3
            }} 
          />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Loading Blockchain Data...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connecting to the Ethereum network
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    }}>
      {/* Header */}
      <Paper 
        elevation={3}
        sx={{
          background: "linear-gradient(45deg, #2e7d32 0%, #66bb6a 100%)",
          color: "white",
          py: 3,
          mb: 3
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              <MedicalServicesIcon sx={{ verticalAlign: "middle", mr: 1 }} />
              Pharmaceutical Supply Chain
            </Typography>
            <Button 
              onClick={() => navigate("/")}
              variant="contained"
              color="secondary"
              startIcon={<ArrowBack />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: 2
              }}
            >
              Home
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Account Info */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Card elevation={3}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ bgcolor: "success.light", mr: 2 }}>
                <Inventory sx={{ color: "success.dark" }} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Connected Account
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: "monospace",
                    fontWeight: 500,
                    wordBreak: "break-word"
                  }}
                >
                  {currentaccount}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      </Container>

      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Place Order Form */}
          <Grid item xs={12} md={5}>
            <Card elevation={3}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <AddCircleIcon sx={{ color: "primary.dark" }} />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Place New Order
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Box 
                  component="form" 
                  onSubmit={handleSubmitOrder} 
                  sx={{ mt: 2 }}
                >
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel id="medicine-select-label">Select Medicine</InputLabel>
                    <Select
                      labelId="medicine-select-label"
                      id="medicine-select"
                      value={selectedMedicineId}
                      label="Select Medicine"
                      onChange={handleMedicineChange}
                      startAdornment={
                        <MedicalServicesIcon color="action" sx={{ mr: 1 }} />
                      }
                    >
                      {medicines.length === 0 ? (
                        <MenuItem disabled>No medicines available</MenuItem>
                      ) : (
                        medicines.map((medicine) => (
                          <MenuItem key={medicine.id} value={medicine.id}>
                            {medicine.name} {medicine.isPrecursor && "(Precursor)"}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {medicines.length === 0 && (
                      <FormHelperText>
                        No medicines available. Add medicines first.
                      </FormHelperText>
                    )}
                  </FormControl>
                  
                  {submitting && <LinearProgress sx={{ mb: 2 }} />}
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    disabled={submitting || medicines.length === 0}
                    sx={{ 
                      mt: 3,
                      py: 1.5,
                      borderRadius: 1,
                      fontSize: "1rem"
                    }}
                  >
                    {submitting ? "Processing..." : "Place Order"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Orders List */}
          <Grid item xs={12} md={7}>
            <Card elevation={3}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "info.light" }}>
                    <ShoppingCartIcon sx={{ color: "info.dark" }} />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Order History
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                {orders.length > 0 ? (
                  <Box sx={{ overflow: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Medicine</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>RMS IDs</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Stages</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order, index) => (
                          <TableRow 
                            key={index} 
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell>{order.orderId}</TableCell>
                            <TableCell>
                              <Tooltip title={`Medicine ID: ${order.MedicineId}`}>
                                <span>{getMedicineName(order.MedicineId)}</span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              {order.RMSid && order.RMSid.length > 0 ? (
                                order.RMSid.map((id, idx) => (
                                  <Chip 
                                    key={idx} 
                                    label={id} 
                                    size="small"
                                    sx={{ m: 0.2 }} 
                                  />
                                ))
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {order.MANid > 0 && <Tooltip title="Manufacturer"><FactoryIcon color="primary" fontSize="small" sx={{ mx: 0.5 }} /></Tooltip>}
                                {order.DISid > 0 && <Tooltip title="Distributor"><LocalShippingIcon color="warning" fontSize="small" sx={{ mx: 0.5 }} /></Tooltip>}
                                {order.RETid > 0 && <Tooltip title="Retailer"><StoreIcon color="info" fontSize="small" sx={{ mx: 0.5 }} /></Tooltip>}
                                {order.CUSTid > 0 && <Tooltip title="Customer"><PersonIcon color="success" fontSize="small" sx={{ mx: 0.5 }} /></Tooltip>}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                icon={getStageIcon(order.stage)} 
                                label={getStageText(order.stage)} 
                                color={getStageColor(order.stage)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 6,
                      textAlign: "center"
                    }}
                  >
                    <Warning 
                      color="disabled" 
                      sx={{ 
                        fontSize: 48,
                        mb: 2
                      }} 
                    />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No Orders Found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 300 }}>
                      There are no orders placed yet. Use the form to place your first order.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default OrderMed;