import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";

import QRCode from 'qrcode';
import {
  Box, Container, Typography, Paper, Grid, Button, TextField, Card, CardHeader,
  CardContent, CardActions, Alert, Snackbar, Divider, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Chip, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Badge, LinearProgress, Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  Science as ScienceIcon,
  Factory as FactoryIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
  ShoppingCart as CartIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  AddCircle as AddCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const roleColors = {
  OWNER: "#8e24aa",
  REGULATOR: "#5e35b1",
  RMS: "#d81b60",
  MAN: "#1976d2",
  DIS: "#00897b",
  RET: "#43a047",
  CUST: "#ff8f00",
  "Not Registered": "#757575"
};

const stageColors = {
  "Medicine Ordered": "#e0e0e0",
  "Raw Material Supplied": "#bbdefb",
  "Manufacturing Process": "#90caf9",
  "In Distribution": "#64b5f6",
  "At Retail Store": "#42a5f5",
  "Medicine Sold": "#2196f3"
};

function Supply() {
  const navigate = useNavigate();

  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState({});
  const [rawM, setRawM] = useState({});
  const [ID, setID] = useState("");
  const [rawMaterialID, setRawMaterialID] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [ORD, setORD] = useState({});
  const [ORDStage, setORDStage] = useState({});
  const [RMS, setRMS] = useState({});
  const [MAN, setMAN] = useState({});
  const [DIS, setDIS] = useState({});
  const [RET, setRET] = useState({});
  const [CUST, setCUST] = useState({});
  const [userRole, setUserRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [availableRawMaterials, setAvailableRawMaterials] = useState([]);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (selectedOrderDetails?.orderId) {
      QRCode.toDataURL(selectedOrderDetails.orderId)
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error('Failed to generate QR code', err);
        });
    }
  }, [selectedOrderDetails?.orderId]);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      setError("Non-Ethereum browser detected. You should consider trying MetaMask!");
      setOpenError(true);
    }
  };

  const loadBlockchaindata = async () => {
    setloader(true);
    setRefreshing(true);
    try {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      setCurrentaccount(account);
      const networkId = await web3.eth.net.getId();
      const networkData = SupplyChainABI.networks[networkId];

      if (networkData) {
        const supplychain = new web3.eth.Contract(
          SupplyChainABI.abi,
          networkData.address
        );
        setSupplyChain(supplychain);

        const orderCtr = await supplychain.methods.orderCtr().call();
        const orders = {};
        const orderStages = {};

        for (let i = 0; i < orderCtr; i++) {
          orders[i + 1] = await supplychain.methods.orders(i + 1).call();
          orderStages[i + 1] = await supplychain.methods.showStage(i + 1).call();
        }
        setORD(orders);
        setORDStage(orderStages);

        const medicineCtr = await supplychain.methods.medicineCtr().call();
        const medicines = {};
        for (let i = 0; i < medicineCtr; i++) {
          const medId = i + 1;
          const medicineData = await supplychain.methods.medicines(medId).call();
          const rawMaterials = await supplychain.methods.getRequiredRawMaterials(medId).call();

          medicines[medId] = {
            ...medicineData,
            requiredRawMaterials: rawMaterials,
          };
        }
        setMED(medicines);

        // Load Raw Materials
        const rmCtr = await supplychain.methods.rawMaterialCtr().call();
        const rawMaterials = {};
        for (let i = 0; i < rmCtr; i++) {
          rawMaterials[i + 1] = await supplychain.methods.rawMaterials(i + 1).call();
        }
        setRawM(rawMaterials);

        // Load Supply Chain Participants
        const rmsCtr = await supplychain.methods.rmsCtr().call();
        const rmsEntities = {};
        for (let i = 0; i < rmsCtr; i++) {
          rmsEntities[i + 1] = await supplychain.methods.RMS(i + 1).call();
          if (rmsEntities[i + 1].addr.toLowerCase() === account.toLowerCase()) {
            setUserRole("RMS");
          }
        }
        setRMS(rmsEntities);

        const manCtr = await supplychain.methods.manCtr().call();
        const manEntities = {};
        for (let i = 0; i < manCtr; i++) {
          manEntities[i + 1] = await supplychain.methods.MAN(i + 1).call();
          if (manEntities[i + 1].addr.toLowerCase() === account.toLowerCase()) {
            setUserRole("MAN");
          }
        }
        setMAN(manEntities);

        const disCtr = await supplychain.methods.disCtr().call();
        const disEntities = {};
        for (let i = 0; i < disCtr; i++) {
          disEntities[i + 1] = await supplychain.methods.DIS(i + 1).call();
          if (disEntities[i + 1].addr.toLowerCase() === account.toLowerCase()) {
            setUserRole("DIS");
          }
        }
        setDIS(disEntities);

        const retCtr = await supplychain.methods.retCtr().call();
        const retEntities = {};
        for (let i = 0; i < retCtr; i++) {
          retEntities[i + 1] = await supplychain.methods.RET(i + 1).call();
          if (retEntities[i + 1].addr.toLowerCase() === account.toLowerCase()) {
            setUserRole("RET");
          }
        }
        setRET(retEntities);

        const custCtr = await supplychain.methods.custCtr().call();
        const custEntities = {};
        for (let i = 0; i < custCtr; i++) {
          custEntities[i + 1] = await supplychain.methods.CUST(i + 1).call();
          if (custEntities[i + 1].addr.toLowerCase() === account.toLowerCase()) {
            setUserRole("CUST");
          }
        }
        setCUST(custEntities);

        const owner = await supplychain.methods.Owner().call();
        if (owner.toLowerCase() === account.toLowerCase()) {
          setUserRole("OWNER");
        } else {
          const isRegulator = await supplychain.methods.regulators(account).call();
          if (isRegulator) {
            setUserRole("REGULATOR");
          }
        }

        setloader(false);
        setRefreshing(false);
      } else {
        setError("The smart contract is not deployed to current network");
        setOpenError(true);
        setloader(false);
        setRefreshing(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error loading blockchain data");
      setOpenError(true);
      setloader(false);
      setRefreshing(false);
    }
  };

  const getAvailableRawMaterials = async (orderId) => {
    if (!ORD[orderId] || !MED[ORD[orderId].MedicineId]) {
      setAvailableRawMaterials([]);
      return;
    }

    const medicine = MED[ORD[orderId].MedicineId];
    console.log(medicine);
    const requiredRawMaterials = medicine.requiredRawMaterials;

    const suppliedMaterials = [];
    for (let i = 0; i < requiredRawMaterials.length; i++) {
      const rmId = requiredRawMaterials[i];
      const isSupplied = await SupplyChain.methods.rawMaterialsSupplied(orderId, rmId).call();
      if (isSupplied) {
        suppliedMaterials.push(rmId);
      }
    }

    const availableMaterials = requiredRawMaterials.filter(
      rmId => !suppliedMaterials.includes(rmId)
    ).map(rmId => ({
      id: rmId,
      name: rawM[rmId] ? rawM[rmId].name : `Unknown (ID: ${rmId})`,
      isPrecursor: rawM[rmId] ? rawM[rmId].isPrecursor : false
    }));

    setAvailableRawMaterials(availableMaterials);
  };

  const redirect_to_home = () => {
    navigate("/");
  };
  const isValidOrder = (orderId) => {
    return ORD[orderId] !== undefined;
  };

  const isOrderInStage = (orderId, requiredStage) => {
    if (!ORDStage[orderId]) return false;
    return ORDStage[orderId] === requiredStage;
  };
  const handleChangeID = (event) => {
    const id = event.target.value;
    setID(id);
    if (id && ORD[id] && userRole === "RMS") {
      getAvailableRawMaterials(id);
    }
  };

  const handleChangeRawMaterialID = (event) => {
    setRawMaterialID(event.target.value);
  };

  const handleChangeCustomerID = (event) => {
    setCustomerID(event.target.value);
  };

  const handleSupplyRawMaterial = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
  
    if (!ID || !rawMaterialID) {
      setError("Please enter both Order ID and select a Raw Material");
      setOpenError(true);
      return;
    }
    if (!isValidOrder(ID)) {
      setError("Invalid Order ID");
      setOpenError(true);
      return;
    }
  
    if (!isOrderInStage(ID, "Medicine Ordered")) {
      setError("Order is not in 'Medicine Ordered' stage");
      setOpenError(true);
      return;
    }
    try {
      const receipt = await SupplyChain.methods
        .supplyRawMaterials(ID, rawMaterialID)
        .send({ from: currentaccount, gas: 6721975 });
  
      if (receipt) {
        setSuccess(`Raw material ${rawMaterialID} successfully supplied for order ${ID}`);
        setOpenSuccess(true);
        await loadBlockchaindata();
        if (ID) {
          getAvailableRawMaterials(ID);
        }
      }
    } catch (err) {
      console.error(err);
      let errorMessage = "Error supplying raw material";
      
      if (err.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Unauthorized transaction: You don't have permission to supply raw materials";
      } else if (err.message.includes("revert")) {
        const revertReason = err.message.match(/reason string: '(.+)'/);
        errorMessage = revertReason 
          ? `Transaction reverted: ${revertReason[1]}`
          : "Transaction was reverted";
      } else if (err.message.includes("User denied transaction")) {
        errorMessage = "Transaction was rejected by user";
      }
      
      setError(errorMessage);
      setOpenError(true);
    }
  };

  const handleManufacture = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!ID) {
      setError("Please enter Order ID");
      setOpenError(true);
      return;
    }
    if (!isValidOrder(ID)) {
      setError("Invalid Order ID");
      setOpenError(true);
      return;
    }

    if (!isOrderInStage(ID, "Raw Material Supplied")) {
      setError("Order is not in Supplied stage");
      setOpenError(true);
      return;
    }
    try {
      const receipt = await SupplyChain.methods
        .manufacture(ID)
        .send({ from: currentaccount, gas: 6721975 });

      if (receipt) {
        setSuccess(`Order ${ID} successfully manufactured`);
        setOpenSuccess(true);
        loadBlockchaindata();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error during manufacturing. Make sure you are a registered manufacturer.");
      setOpenError(true);
    }
  };

  const handleDistribute = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!ID) {
      setError("Please enter Order ID");
      setOpenError(true);
      return;
    }
    if (!isValidOrder(ID)) {
      setError("Invalid Order ID");
      setOpenError(true);
      return;
    }

    if (!isOrderInStage(ID, "Manufacturing Process")) {
      setError("Order has not been Manufactured ");
      setOpenError(true);
      return;
    }
    try {
      const receipt = await SupplyChain.methods
        .distribute(ID)
        .send({ from: currentaccount, gas: 6721975 });

      if (receipt) {
        setSuccess(`Order ${ID} successfully moved to distribution`);
        setOpenSuccess(true);
        loadBlockchaindata();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error during distribution. Make sure you are a registered distributor.");
      setOpenError(true);
    }
  };

  const handleRetail = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!ID) {
      setError("Please enter Order ID");
      setOpenError(true);
      return;
    }
    if (!isValidOrder(ID)) {
      setError("Invalid Order ID");
      setOpenError(true);
      return;
    }

    if (!isOrderInStage(ID, "In Distribution")) {
      setError("Order has not been Distributed Yet");
      setOpenError(true);
      return;
    }
    try {
      const receipt = await SupplyChain.methods
        .retail(ID)
        .send({ from: currentaccount, gas: 6721975 });

      if (receipt) {
        setSuccess(`Order ${ID} successfully moved to retail`);
        setOpenSuccess(true);
        loadBlockchaindata();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error during retail process. Make sure you are a registered retailer.");
      setOpenError(true);
    }
  };

  const handleSell = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!ID || !customerID) {
      setError("Please enter both Order ID and Customer ID");
      setOpenError(true);
      return;
    }
    if (!isValidOrder(ID)) {
      setError("Invalid Order ID");
      setOpenError(true);
      return;
    }

    if (!isOrderInStage(ID, "At Retail Store")) {
      setError("Order is not in Retail Stage Yet");
      setOpenError(true);
      return;
    }
    try {
      const receipt = await SupplyChain.methods
        .sell(ID, customerID)
        .send({ from: currentaccount, gas: 6721975 });

      if (receipt) {
        setSuccess(`Order ${ID} successfully sold to customer ${customerID}`);
        setOpenSuccess(true);
        loadBlockchaindata();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error during selling. Make sure you are a registered retailer.");
      setOpenError(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSuccess(false);
    setOpenError(false);
  };

  const getMedicineRequiredRawMaterials = (medicineId) => {
    if (!MED[medicineId] || !MED[medicineId].requiredRawMaterials) return "None";

    return MED[medicineId].requiredRawMaterials.map(rmId => {
      return rawM[rmId] ? `${rawM[rmId].name} (ID: ${rmId})` : `ID: ${rmId}`;
    }).join(", ");
  };

  const getRawMaterialSuppliers = async (orderId) => {
    if (!ORD[orderId] || !MED[ORD[orderId].MedicineId]) return "None";

    const medicine = MED[ORD[orderId].MedicineId];
    const requiredRawMaterials = medicine.requiredRawMaterials;
    const supplierInfo = [];

    for (let i = 0; i < requiredRawMaterials.length; i++) {
      const rmId = requiredRawMaterials[i];
      const isSupplied = await SupplyChain.methods.rawMaterialsSupplied(orderId, rmId).call();
      if (isSupplied) {
        // Get supplier ID for this specific raw material
        const supplierId = await SupplyChain.methods.rawMaterialsSupplier(orderId, rmId).call();
        const rmName = rawM[rmId] ? rawM[rmId].name : `Unknown (ID: ${rmId})`;
        const supplierName = RMS[supplierId] ? RMS[supplierId].name : `Unknown (ID: ${supplierId})`;
        supplierInfo.push({
          rmId,
          rmName,
          supplierId,
          supplierName
        });
      }
    }

    return supplierInfo;
  };

  const viewOrderDetails = async (orderId) => {
    if (!ORD[orderId]) return;

    const medicineId = ORD[orderId].MedicineId;
    const medicine = MED[medicineId] || {};
    const rawMaterialSuppliers = await getRawMaterialSuppliers(orderId);

    const details = {
      orderId: orderId,
      medicineId: medicineId,
      medicineName: medicine.name || "Unknown",
      medicineDescription: medicine.description || "No description",
      isPrecursor: medicine.isPrecursor || false,
      requiredRawMaterials: getMedicineRequiredRawMaterials(medicineId),
      rawMaterialSuppliers: rawMaterialSuppliers,
      stage: ORDStage[orderId] || "Unknown",
      manufacturer: ORD[orderId].MANid ? (MAN[ORD[orderId].MANid]?.name || `ID: ${ORD[orderId].MANid}`) : "Not assigned",
      distributor: ORD[orderId].DISid ? (DIS[ORD[orderId].DISid]?.name || `ID: ${ORD[orderId].DISid}`) : "Not assigned",
      retailer: ORD[orderId].RETid ? (RET[ORD[orderId].RETid]?.name || `ID: ${ORD[orderId].RETid}`) : "Not assigned",
      customer: ORD[orderId].CUSTid ? (CUST[ORD[orderId].CUSTid]?.name || `ID: ${ORD[orderId].CUSTid}`) : "Not sold"
    };

    setSelectedOrderDetails(details);
    setOrderDetailsOpen(true);
  };

  if (loader) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5'
      }}>
        <CircularProgress size={80} sx={{ mb: 4 }} />
        <Typography variant="h4" gutterBottom>
          Loading Blockchain Data
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Please wait while we connect to the blockchain
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          background: 'linear-gradient(to right, #1976d2, #2196f3)',
          borderRadius: 0,
          mb: 4,
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight="bold">
              Pharmaceutical Supply Chain Management
            </Typography>
            <Box>
              <Tooltip title="Refresh Data">
                <IconButton
                  color="inherit"
                  onClick={loadBlockchaindata}
                  disabled={refreshing}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Return Home">
                <IconButton color="inherit" onClick={redirect_to_home}>
                  <HomeIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {/* Account Information */}
        <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{
            p: 2,
            background: roleColors[userRole] || roleColors["Not Registered"],
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6">Account Information</Typography>
            <Chip
              label={userRole || "Not Registered"}
              color="default"
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="body1">
                  <strong>Connected Address:</strong> {currentaccount}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1">
                  <strong>Role:</strong> {userRole || "Not Registered"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Supply Chain Flow */}
        <Paper elevation={3} sx={{ mb: 4, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Supply Chain Flow</Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Chip icon={<AddCircleIcon />} label="ORDER" color="primary" />
            <ArrowForwardIcon color="action" />
            <Chip icon={<ScienceIcon />} label="RMS" sx={{ bgcolor: roleColors.RMS, color: 'white' }} />
            <ArrowForwardIcon color="action" />
            <Chip icon={<FactoryIcon />} label="MAN" sx={{ bgcolor: roleColors.MAN, color: 'white' }} />
            <ArrowForwardIcon color="action" />
            <Chip icon={<ShippingIcon />} label="DIS" sx={{ bgcolor: roleColors.DIS, color: 'white' }} />
            <ArrowForwardIcon color="action" />
            <Chip icon={<StoreIcon />} label="RET" sx={{ bgcolor: roleColors.RET, color: 'white' }} />
            <ArrowForwardIcon color="action" />
            <Chip icon={<CartIcon />} label="SOLD" sx={{ bgcolor: roleColors.CUST, color: 'white' }} />
          </Box>
        </Paper>

        {/* Active Orders */}
        <Paper elevation={3} sx={{ mb: 4 }}>
          <Box sx={{ p: 2, bgcolor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Active Orders</Typography>
            <Badge
              badgeContent={Object.keys(ORD).length}
              color="error"
              sx={{ '& .MuiBadge-badge': { bgcolor: 'white', color: '#1976d2' } }}
            >
              <DashboardIcon />
            </Badge>
          </Box>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Precursor</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(ORD).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="subtitle1" color="textSecondary" sx={{ py: 4 }}>
                        No active orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.keys(ORD).map((key) => {
                    const medicineId = ORD[key].MedicineId;
                    if (!MED[medicineId]) return null;

                    const stage = ORDStage[key] || "Unknown";

                    return (
                      <TableRow key={key} sx={{
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}>
                        <TableCell>#{key}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {MED[medicineId].name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {MED[medicineId].description.length > 50
                              ? MED[medicineId].description.substring(0, 50) + '...'
                              : MED[medicineId].description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {MED[medicineId].isPrecursor ? (
                            <Chip
                              size="small"
                              label="Precursor"
                              color="error"
                              icon={<WarningIcon />}
                            />
                          ) : (
                            <Chip
                              size="small"
                              label="Standard"
                              color="success"
                              icon={<CheckIcon />}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={stage}
                            size="small"
                            sx={{
                              bgcolor: stageColors[stage] || '#e0e0e0',
                              color: stage === "Medicine Ordered" ? '#616161' : '#0d47a1'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => viewOrderDetails(key)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Supply Chain Actions */}
        <Typography variant="h6" gutterBottom>
          Supply Chain Actions
        </Typography>

        <Grid container spacing={3}>
          {/* Step 1: Supply Raw Materials */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                border: userRole === "RMS" ? `2px solid ${roleColors.RMS}` : 'none'
              }}
            >
              <CardHeader
                avatar={<ScienceIcon sx={{ color: roleColors.RMS }} />}
                title="Step 1: Supply Raw Materials"
                subheader="Only registered Raw Material Suppliers can perform this step"
                sx={{
                  bgcolor: userRole === "RMS" ? `${roleColors.RMS}15` : 'transparent',
                  borderBottom: '1px solid #f0f0f0'
                }}
              />
              <CardContent>
                <form onSubmit={handleSupplyRawMaterial}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Order ID"
                        variant="outlined"
                        fullWidth
                        value={ID}
                        onChange={handleChangeID}
                        required
                        disabled={userRole !== "RMS"}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl variant="outlined" fullWidth disabled={userRole !== "RMS" || !ID || availableRawMaterials.length === 0}>
                        <InputLabel>Select Raw Material</InputLabel>
                        <Select
                          value={rawMaterialID}
                          onChange={handleChangeRawMaterialID}
                          label="Select Raw Material"
                        >
                          {availableRawMaterials.length === 0 ? (
                            <MenuItem value="" disabled>
                              {ID ? "No available raw materials for this order" : "Enter Order ID first"}
                            </MenuItem>
                          ) : (
                            availableRawMaterials.map((rm) => (
                              <MenuItem key={rm.id} value={rm.id}>
                                {rm.name} {rm.isPrecursor && "⚠️ (Precursor)"}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant={userRole === "RMS" ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      disabled={userRole !== "RMS"}
                      startIcon={<ScienceIcon />}
                    >
                      Supply Raw Material
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Step 2: Manufacture */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                border: userRole === "MAN" ? `2px solid ${roleColors.MAN}` : 'none'
              }}
            >
              <CardHeader
                avatar={<FactoryIcon sx={{ color: roleColors.MAN }} />}
                title="Step 2: Manufacture"
                subheader="Only registered Manufacturers can perform this step"
                sx={{
                  bgcolor: userRole === "MAN" ? `${roleColors.MAN}15` : 'transparent',
                  borderBottom: '1px solid #f0f0f0'
                }}
              />
              <CardContent>
                <form onSubmit={handleManufacture}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Order ID"
                        variant="outlined"
                        fullWidth
                        value={ID}
                        onChange={handleChangeID}
                        required
                        disabled={userRole !== "MAN"}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant={userRole === "MAN" ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      disabled={userRole !== "MAN"}
                      startIcon={<FactoryIcon />}
                    >
                      Start Manufacturing
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Step 3: Distribute */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                border: userRole === "DIS" ? `2px solid ${roleColors.DIS}` : 'none'
              }}
            >
              <CardHeader
                avatar={<ShippingIcon sx={{ color: roleColors.DIS }} />}
                title="Step 3: Distribute"
                subheader="Only registered Distributors can perform this step"
                sx={{
                  bgcolor: userRole === "DIS" ? `${roleColors.DIS}15` : 'transparent',
                  borderBottom: '1px solid #f0f0f0'
                }}
              />
              <CardContent>
                <form onSubmit={handleDistribute}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Order ID"
                        variant="outlined"
                        fullWidth
                        value={ID}
                        onChange={handleChangeID}
                        required
                        disabled={userRole !== "DIS"}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant={userRole === "DIS" ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      disabled={userRole !== "DIS"}
                      startIcon={<ShippingIcon />}
                    >
                      Start Distribution
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Step 4: Retail */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                border: userRole === "RET" ? `2px solid ${roleColors.RET}` : 'none'
              }}
            >
              <CardHeader
                avatar={<StoreIcon sx={{ color: roleColors.RET }} />}
                title="Step 4: Retail"
                subheader="Only registered Retailers can perform this step"
                sx={{
                  bgcolor: userRole === "RET" ? `${roleColors.RET}15` : 'transparent',
                  borderBottom: '1px solid #f0f0f0'
                }}
              />
              <CardContent>
                <form onSubmit={handleRetail}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Order ID"
                        variant="outlined"
                        fullWidth
                        value={ID}
                        onChange={handleChangeID}
                        required
                        disabled={userRole !== "RET"}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant={userRole === "RET" ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      disabled={userRole !== "RET"}
                      startIcon={<StoreIcon />}
                    >
                      Move to Retail
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Step 5: Sell to Customer */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                border: userRole === "RET" ? `2px solid ${roleColors.RET}` : 'none'
              }}
            >
              <CardHeader
                avatar={<CartIcon sx={{ color: roleColors.CUST }} />}
                title="Step 5: Sell to Customer"
                subheader="Only registered Retailers can sell to customers"
                sx={{
                  bgcolor: userRole === "RET" ? `${roleColors.RET}15` : 'transparent',
                  borderBottom: '1px solid #f0f0f0'
                }}
              />
              <CardContent>
                <form onSubmit={handleSell}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Order ID"
                        variant="outlined"
                        fullWidth
                        value={ID}
                        onChange={handleChangeID}
                        required
                        disabled={userRole !== "RET"}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Customer ID"
                        variant="outlined"
                        fullWidth
                        value={customerID}
                        onChange={handleChangeCustomerID}
                        required
                        disabled={userRole !== "RET"}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant={userRole === "RET" ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      disabled={userRole !== "RET"}
                      startIcon={<CartIcon />}
                    >
                      Sell Medicine
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Order Details Dialog */}
        <Dialog open={orderDetailsOpen} onClose={() => setOrderDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
            Order Details: #{selectedOrderDetails?.orderId}
          </DialogTitle>
          <DialogContent dividers>
            {selectedOrderDetails && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Medicine Information</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Typography variant="body1"><strong>Medicine ID:</strong> {selectedOrderDetails.medicineId}</Typography>
                    <Typography variant="body1"><strong>Name:</strong> {selectedOrderDetails.medicineName}</Typography>
                    <Typography variant="body1"><strong>Description:</strong> {selectedOrderDetails.medicineDescription}</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>Classification:</strong>{" "}
                      {selectedOrderDetails.isPrecursor ? (
                        <Chip size="small" color="error" label="Precursor" icon={<WarningIcon />} />
                      ) : (
                        <Chip size="small" color="success" label="Standard" icon={<CheckIcon />} />
                      )}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Order Status</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Typography variant="body1">
                      <strong>Current Stage:</strong>{" "}
                      <Chip
                        label={selectedOrderDetails.stage}
                        size="small"
                        sx={{
                          bgcolor: stageColors[selectedOrderDetails.stage] || '#e0e0e0',
                          color: selectedOrderDetails.stage === "Medicine Ordered" ? '#616161' : '#0d47a1'
                        }}
                      />
                    </Typography>
                  </Paper>
                </Grid>
                

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Raw Materials</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Typography variant="body1" gutterBottom><strong>Required Raw Materials:</strong> {selectedOrderDetails.requiredRawMaterials}</Typography>

                    <Typography variant="body1" gutterBottom><strong>Supplied Raw Materials:</strong></Typography>
                    {selectedOrderDetails.rawMaterialSuppliers && selectedOrderDetails.rawMaterialSuppliers.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Raw Material</strong></TableCell>
                              <TableCell><strong>Supplied By</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedOrderDetails.rawMaterialSuppliers.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.rmName} (ID: {item.rmId})</TableCell>
                                <TableCell>{item.supplierName} (ID: {item.supplierId})</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="textSecondary">No raw materials supplied yet</Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Supply Chain Participants</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body1"><strong>Manufacturer:</strong> {selectedOrderDetails.manufacturer}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body1"><strong>Distributor:</strong> {selectedOrderDetails.distributor}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body1"><strong>Retailer:</strong> {selectedOrderDetails.retailer}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body1"><strong>Customer:</strong> {selectedOrderDetails.customer}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">QR Code for Order ID</Typography>
                  {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={{ marginTop: '10px', width: '150px' }} />}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderDetailsOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars for success/error messages */}
        <Snackbar
          open={openSuccess}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={openError}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Supply;