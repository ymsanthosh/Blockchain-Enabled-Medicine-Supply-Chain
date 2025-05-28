import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import QrReader from "react-qr-scanner";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  useTheme,
  Avatar,
  alpha,
  Slide,
  Grow,
  Zoom,
  Skeleton,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search,
  LocalPharmacy,
  Factory,
  LocalShipping,
  Store,
  ShoppingCart,
  Science,
  Verified,
  GppBad,
  ErrorOutline,
  CheckCircleOutline,
  FactoryOutlined,
  LocalShippingOutlined,
  StorefrontOutlined,
  PersonOutlined,
  ScienceOutlined,
  QrCodeScanner,
  Timeline,
  AccountTree,
  Receipt,
  Inventory,
  Medication,
  Security,
  Home,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const AnimatedCard = motion(Card);
const AnimatedButton = motion(Button);

function Track() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [supplyChain, setSupplyChain] = useState(null);
  const [orders, setOrders] = useState({});
  const [orderStages, setOrderStages] = useState({});
  const [rawMaterials, setRawMaterials] = useState({});
  const [medicines, setMedicines] = useState({});
  const [orderId, setOrderId] = useState("");
  const [rmsEntities, setRMSEntities] = useState({});
  const [manufacturers, setManufacturers] = useState({});
  const [distributors, setDistributors] = useState({});
  const [retailers, setRetailers] = useState({});
  const [customers, setCustomers] = useState({});
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [error, setError] = useState("");
  const [requiredRawMaterials, setRequiredRawMaterials] = useState([]);
  const [rawMaterialSuppliers, setRawMaterialSuppliers] = useState([]);
  const [stageTimestamps, setStageTimestamps] = useState({});
  const [scanResult, setScanResult] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      setError(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const loadBlockchainData = async () => {
    setLoading(true);
    try {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      setCurrentAccount(account);
      const networkId = await web3.eth.net.getId();
      const networkData = SupplyChainABI.networks[networkId];

      if (networkData) {
        const supplychain = new web3.eth.Contract(
          SupplyChainABI.abi,
          networkData.address
        );
        setSupplyChain(supplychain);

        // Load Orders
        const orderCtr = await supplychain.methods.orderCtr().call();
        const orders = {};
        const orderStages = {};

        for (let i = 0; i < orderCtr; i++) {
          orders[i + 1] = await supplychain.methods.orders(i + 1).call();
          orderStages[i + 1] = await supplychain.methods
            .showStage(i + 1)
            .call();
        }
        setOrders(orders);
        setOrderStages(orderStages);

        // Load Medicines
        const medicineCtr = await supplychain.methods.medicineCtr().call();
        const medicines = {};
        for (let i = 0; i < medicineCtr; i++) {
          medicines[i + 1] = await supplychain.methods.medicines(i + 1).call();
        }
        setMedicines(medicines);

        // Load Raw Materials
        const rmCtr = await supplychain.methods.rawMaterialCtr().call();
        const rawMaterials = {};
        for (let i = 0; i < rmCtr; i++) {
          rawMaterials[i + 1] = await supplychain.methods
            .rawMaterials(i + 1)
            .call();
        }
        setRawMaterials(rawMaterials);

        // Load Supply Chain Participants
        const rmsCtr = await supplychain.methods.rmsCtr().call();
        const rmsEntities = {};
        for (let i = 0; i < rmsCtr; i++) {
          rmsEntities[i + 1] = await supplychain.methods.RMS(i + 1).call();
        }
        setRMSEntities(rmsEntities);

        const manCtr = await supplychain.methods.manCtr().call();
        const manEntities = {};
        for (let i = 0; i < manCtr; i++) {
          manEntities[i + 1] = await supplychain.methods.MAN(i + 1).call();
        }
        setManufacturers(manEntities);

        const disCtr = await supplychain.methods.disCtr().call();
        const disEntities = {};
        for (let i = 0; i < disCtr; i++) {
          disEntities[i + 1] = await supplychain.methods.DIS(i + 1).call();
        }
        setDistributors(disEntities);

        const retCtr = await supplychain.methods.retCtr().call();
        const retEntities = {};
        for (let i = 0; i < retCtr; i++) {
          retEntities[i + 1] = await supplychain.methods.RET(i + 1).call();
        }
        setRetailers(retEntities);

        const custCtr = await supplychain.methods.custCtr().call();
        const custEntities = {};
        for (let i = 0; i < custCtr; i++) {
          custEntities[i + 1] = await supplychain.methods.CUST(i + 1).call();
        }
        setCustomers(custEntities);

        setLoading(false);
      } else {
        setError("The smart contract is not deployed to current network");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      setError(
        "Failed to load blockchain data. Please check console for details."
      );
      setLoading(false);
    }
  };

  const getRawMaterialSuppliers = async (orderId) => {
    if (
      !supplyChain ||
      !orders[orderId] ||
      !medicines[orders[orderId].MedicineId]
    ) {
      return [];
    }

    const medicineId = orders[orderId].MedicineId;
    const medicine = medicines[medicineId];

    try {
      const requiredRMs = await supplyChain.methods
        .getRequiredRawMaterials(medicineId)
        .call();
      const supplierInfo = [];
      for (let i = 0; i < requiredRMs.length; i++) {
        const rmId = requiredRMs[i];
        const isSupplied = await supplyChain.methods
          .rawMaterialsSupplied(orderId, rmId)
          .call();

        if (isSupplied) {
          const supplierId = await supplyChain.methods
            .rawMaterialsSupplier(orderId, rmId)
            .call();
          const rmName = rawMaterials[rmId]
            ? rawMaterials[rmId].name
            : `Unknown (ID: ${rmId})`;
          const supplier = rmsEntities[supplierId];

          supplierInfo.push({
            rmId,
            rmName,
            supplierId,
            supplier,
          });
        }
      }

      return supplierInfo;
    } catch (error) {
      console.error("Error fetching raw material suppliers:", error);
      return [];
    }
  };

  const fetchStageTimestamps = async (orderId) => {
    if (!supplyChain) return {};

    try {
      const timestamps = await supplyChain.methods
        .getAllTimestamps(orderId)
        .call();
      return {
        "Medicine Ordered": timestamps[0],
        "Raw Material Supplied": timestamps[1],
        "Manufacturing Process": timestamps[2],
        "In Distribution": timestamps[3],
        "At Retail Store": timestamps[4],
        "Medicine Sold": timestamps[5],
      };
    } catch (error) {
      console.error("Error fetching timestamps:", error);
      return {};
    }
  };

  const handleTrackOrder = async (id) => {
    if(isNaN(id)) id=orderId;
    console.log("order id",orderId);
    console.log("id = ",id);
    if (!id || id <= 0 || !orders[id]) {
      setError("Please enter a valid Order ID");
      setTrackingDetails(null);
      return;
    }
    if(!id || id==null) id=orderId;
    setError("");
    try {
      const medicineId = orders[id].MedicineId;
      if (supplyChain && medicineId) {
        const requiredRMs = await supplyChain.methods
          .getRequiredRawMaterials(medicineId)
          .call();
        setRequiredRawMaterials(requiredRMs);

        const supplierInfo = await getRawMaterialSuppliers(id);
        setRawMaterialSuppliers(supplierInfo);

        const timestamps = await fetchStageTimestamps(id);
        setStageTimestamps(timestamps);
      }
      setTrackingDetails(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch detailed order information");
    }
  };

  const handleScan = (result) => {
    if (result) {
      try {
        // Try to parse as JSON first
        const parsedData = JSON.parse(result.text);
        if (parsedData) {
          setOrderId(parsedData);
          console.log("order id =", orderId);
          setShowScanner(false);
          handleTrackOrder(parsedData);
          return;
        }
      } catch (e) {
        // If not JSON, check if it's a direct order ID
        if (result.text && !isNaN(result.text)) {
          setOrderId(result.text);
          setShowScanner(false);
          handleTrackOrder();
          return;
        }
      }

      // If we get here, the QR didn't contain a valid order ID
      setError("QR code doesn't contain a valid order ID");
      setShowScanner(false);
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
    if (err.name === "NotAllowedError") {
      setError("Camera access was denied. Please enable camera permissions.");
    } else {
      setError("Failed to scan QR code. Please try again.");
    }
    setShowScanner(false);
  };

  const getStepIndex = (stage) => {
    const stages = {
      "Medicine Ordered": 0,
      "Raw Material Supplied": 1,
      "Manufacturing Process": 2,
      "In Distribution": 3,
      "At Retail Store": 4,
      "Medicine Sold": 5,
    };
    return stages[stage] || 0;
  };

  const stageSteps = [
    "Medicine Ordered",
    "Raw Material Supplied",
    "Manufacturing Process",
    "In Distribution",
    "At Retail Store",
    "Medicine Sold",
  ];

  const renderRawMaterialSuppliers = () => {
    if (!rawMaterialSuppliers || rawMaterialSuppliers.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Inventory color="disabled" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No raw material suppliers assigned yet
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ py: 0 }}>
        {rawMaterialSuppliers.map((item, index) => {
          if (!item.supplier) return null;

          return (
            <Grow in={true} key={index} timeout={(index + 1) * 200}>
              <ListItem
                divider={index !== rawMaterialSuppliers.length - 1}
                sx={{
                  py: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                  >
                    <ScienceOutlined color="primary" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight="medium">
                      {item.supplier.name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Supplied: {item.rmName}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip
                          icon={
                            item.supplier.urnVerified ? (
                              <Verified fontSize="small" />
                            ) : (
                              <GppBad fontSize="small" />
                            )
                          }
                          label={
                            item.supplier.urnVerified
                              ? "Verified"
                              : "Unverified"
                          }
                          color={
                            item.supplier.urnVerified ? "success" : "default"
                          }
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`ID: ${item.supplierId}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </>
                  }
                />
              </ListItem>
            </Grow>
          );
        })}
      </List>
    );
  };

  const renderRequiredRawMaterials = () => {
    if (!requiredRawMaterials || requiredRawMaterials.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <ScienceOutlined color="disabled" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No raw materials required for this medicine
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ py: 0 }}>
        {requiredRawMaterials.map((rmId, index) => {
          const rawMaterial = rawMaterials[rmId];
          if (!rawMaterial) return null;

          const isSupplied = rawMaterialSuppliers.some(
            (item) => item.rmId === rmId
          );

          return (
            <Grow in={true} key={index} timeout={(index + 1) * 200}>
              <ListItem
                divider={index !== requiredRawMaterials.length - 1}
                sx={{
                  py: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: rawMaterial.isPrecursor
                        ? alpha(theme.palette.warning.main, 0.1)
                        : alpha(theme.palette.info.main, 0.1),
                    }}
                  >
                    <Science
                      color={rawMaterial.isPrecursor ? "warning" : "info"}
                    />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight="medium">
                      {rawMaterial.name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        ID: {rawMaterial.id}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip
                          icon={
                            rawMaterial.isPrecursor ? (
                              <ErrorOutline fontSize="small" />
                            ) : (
                              <CheckCircleOutline fontSize="small" />
                            )
                          }
                          label={
                            rawMaterial.isPrecursor ? "Precursor" : "Standard"
                          }
                          color={rawMaterial.isPrecursor ? "warning" : "info"}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={
                            isSupplied ? (
                              <CheckCircleOutline fontSize="small" />
                            ) : (
                              <ErrorOutline fontSize="small" />
                            )
                          }
                          label={isSupplied ? "Supplied" : "Not supplied"}
                          color={isSupplied ? "success" : "default"}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </>
                  }
                />
              </ListItem>
            </Grow>
          );
        })}
      </List>
    );
  };

  const EntityCard = ({
    title,
    entity,
    icon,
    active,
    precursorRelevant = false,
    timestamp,
  }) => {
    const Icon = icon;

    if (!entity || entity.id <= 0) {
      return (
        <AnimatedCard
          elevation={2}
          sx={{
            height: "100%",
            opacity: 0.7,
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.3s ease",
          }}
          whileHover={{ scale: 1.02 }}
        >
          <CardHeader
            title={title}
            sx={{
              bgcolor: "action.hover",
              color: "text.secondary",
              "& .MuiCardHeader-avatar": { color: "text.secondary" },
            }}
            avatar={<Icon />}
          />
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              Not assigned yet
            </Typography>
          </CardContent>
        </AnimatedCard>
      );
    }

    return (
      <AnimatedCard
        elevation={3}
        sx={{
          height: "100%",
          border: active ? 2 : 1,
          borderColor: active ? "primary.main" : "divider",
          transition: "all 0.3s ease",
        }}
        whileHover={{ scale: 1.02 }}
      >
        <CardHeader
          title={title}
          sx={{
            bgcolor: active ? "primary.main" : "background.paper",
            color: active ? "primary.contrastText" : "text.primary",
            "& .MuiCardHeader-avatar": {
              color: active ? "primary.contrastText" : "primary.main",
            },
          }}
          avatar={
            <Avatar
              sx={{
                bgcolor: active
                  ? "primary.contrastText"
                  : alpha(theme.palette.primary.main, 0.1),
                color: active ? "primary.main" : "primary.main",
              }}
            >
              <Icon />
            </Avatar>
          }
        />
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            {entity.name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              "& > div": {
                display: "flex",
                alignItems: "center",
                gap: 1,
              },
            }}
          >
            <div>
              <Typography variant="caption" color="text.secondary">
                ID:
              </Typography>
              <Chip label={entity.id} size="small" variant="outlined" />
            </div>
            {entity.place && (
              <div>
                <Typography variant="caption" color="text.secondary">
                  Location:
                </Typography>
                <Chip label={entity.place} size="small" variant="outlined" />
              </div>
            )}
            {entity.email && (
              <div>
                <Typography variant="caption" color="text.secondary">
                  Email:
                </Typography>
                <Chip label={entity.email} size="small" variant="outlined" />
              </div>
            )}
            {precursorRelevant && "urnVerified" in entity && (
              <div>
                <Typography variant="caption" color="text.secondary">
                  Status:
                </Typography>
                <Chip
                  icon={
                    entity.urnVerified ? (
                      <Verified fontSize="small" />
                    ) : (
                      <GppBad fontSize="small" />
                    )
                  }
                  label={entity.urnVerified ? "Verified" : "Unverified"}
                  color={entity.urnVerified ? "success" : "default"}
                  size="small"
                />
              </div>
            )}
          </Box>
          {/* ... existing content ... */}
          {timestamp && timestamp !== "0" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Timestamp:
              </Typography>
              <Typography variant="body2">
                {new Date(timestamp * 1000).toLocaleString()}
              </Typography>
            </Box>
          )}
        </CardContent>
      </AnimatedCard>
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <LocalPharmacy sx={{ fontSize: 80, color: "primary.main" }} />
        </motion.div>
        <Typography variant="h4" sx={{ mt: 4, fontWeight: "bold" }}>
          Loading Blockchain Data...
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Securely connecting to the pharmaceutical supply chain network
        </Typography>
        <CircularProgress size={60} thickness={4} sx={{ mt: 4 }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Slide direction="down" in={true} mountOnEnter unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            position: "relative",
            overflow: "hidden",
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
              zIndex: 1,
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 3,
            }}
          >
            <AnimatedButton
              variant="outlined"
              color="inherit"
              startIcon={<Home />}
              onClick={() => (window.location.href = "/")} // Replace with your route if using React Router
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Home
            </AnimatedButton>
          </Box>
          <Box position="relative" zIndex={2}>
            <Typography
              variant="h2"
              align="center"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Pharmaceutical Supply Chain Tracker
            </Typography>
            <Typography variant="h6" align="center" sx={{ opacity: 0.9 }}>
              Transparent, Secure & Immutable Medicine Tracking Powered by
              Blockchain
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
                "& > *": {
                  mx: 1,
                },
              }}
            >
              <Chip
                icon={<Security />}
                label="Secure"
                color="default"
                variant="outlined"
                sx={{ color: "white" }}
              />
              <Chip
                icon={<Timeline />}
                label="Transparent"
                color="default"
                variant="outlined"
                sx={{ color: "white" }}
              />
              <Chip
                icon={<AccountTree />}
                label="Immutable"
                color="default"
                variant="outlined"
                sx={{ color: "white" }}
              />
            </Box>
          </Box>
        </Paper>
      </Slide>

      {error && (
        <Zoom in={!!error}>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        </Zoom>
      )}

      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(to right, #ffffff, #f9f9f9)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Track Your Medicine
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Enter your Order ID to view the complete journey of your
                medicine through the supply chain
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Order ID"
                  variant="outlined"
                  type="number"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  InputProps={{
                    startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                    sx: { borderRadius: 2 },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "divider",
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
                <AnimatedButton
                  variant="contained"
                  size="large"
                  onClick={handleTrackOrder}
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Track Order
                </AnimatedButton>
              </Box>
            </Grid>
            <Button
                variant="outlined"
                startIcon={<QrCodeScanner />}
                onClick={() => setShowScanner(!showScanner)}
              >
                {showScanner ? "Close Scanner" : "Scan QR"}
              </Button>

              {showScanner && (
                <Box mt={2}>
                  <QrReader
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: "100%" }}
                  />
                </Box>
              )}
          </Grid>
        </Paper>
      </Slide>

      {trackingDetails && orders[orderId] && (
        <Fade in={!!trackingDetails}>
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                background: "linear-gradient(to right, #ffffff, #f9f9f9)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 3,
                      "& svg": {
                        fontSize: 40,
                        mr: 2,
                        color: "primary.main",
                      },
                    }}
                  >
                    <Medication />
                    <Typography variant="h4" fontWeight="bold">
                      {medicines[orders[orderId].MedicineId]?.name ||
                        "Medicine"}
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                    {medicines[orders[orderId].MedicineId]?.description ||
                      "No description available"}
                  </Typography>
                  {medicines[orders[orderId].MedicineId]?.isPrecursor && (
                    <Alert
                      severity="warning"
                      icon={<Security />}
                      sx={{ mb: 3 }}
                    >
                      Precursor Medicine - Special Handling Required
                    </Alert>
                  )}

                  <Box
                    sx={{
                      p: 2,
                      background: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Order Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Order ID:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {orders[orderId].orderId}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Medicine ID:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {orders[orderId].MedicineId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Current Stage:
                        </Typography>
                        <Chip
                          label={orderStages[orderId]}
                          color="primary"
                          size="medium"
                          sx={{ fontWeight: "bold" }}
                        />
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Stage Timestamps
                      </Typography>
                      <List dense sx={{ py: 0 }}>
                        {Object.entries(stageTimestamps).map(
                          ([stage, timestamp]) =>
                            timestamp !== "0" && (
                              <ListItem key={stage} divider sx={{ py: 1 }}>
                                <ListItemText
                                  primary={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {stage}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {new Date(
                                          timestamp * 1000
                                        ).toLocaleString()}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            )
                        )}
                      </List>
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 3,
                      background: alpha(theme.palette.primary.main, 0.03),
                      borderRadius: 3,
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="h5"
                      gutterBottom
                      fontWeight="bold"
                      sx={{ mb: 3 }}
                    >
                      Supply Chain Journey
                    </Typography>
                    <Stepper
                      activeStep={getStepIndex(orderStages[orderId])}
                      alternativeLabel
                      sx={{
                        "& .MuiStepLabel-label": {
                          fontWeight: "500",
                        },
                      }}
                    >
                      {stageSteps.map((label, index) => (
                        <Step key={label}>
                          <StepLabel
                            sx={{
                              "& .MuiStepIcon-root": {
                                color:
                                  getStepIndex(orderStages[orderId]) >= index
                                    ? theme.palette.primary.main
                                    : theme.palette.action.disabled,
                                "&.Mui-completed": {
                                  color: theme.palette.primary.main,
                                },
                                "&.Mui-active": {
                                  color: theme.palette.primary.main,
                                },
                              },
                            }}
                          >
                            <Box>
                              {label}
                              {stageTimestamps[label] &&
                                stageTimestamps[label] !== "0" && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    color="text.secondary"
                                  >
                                    {new Date(
                                      stageTimestamps[label] * 1000
                                    ).toLocaleString()}
                                  </Typography>
                                )}
                            </Box>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    <Box
                      sx={{
                        mt: 4,
                        p: 3,
                        background: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body1" fontWeight="medium">
                        {getStepIndex(orderStages[orderId]) ===
                        stageSteps.length - 1
                          ? "Your medicine has been successfully delivered!"
                          : `Your medicine is currently at: ${orderStages[orderId]}`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                mb: 3,
                "& .MuiTabs-indicator": {
                  height: 4,
                  borderRadius: 2,
                },
              }}
            >
              <Tab
                label="Raw Materials"
                icon={<ScienceOutlined />}
                iconPosition="start"
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              />
              <Tab
                label="Supply Chain"
                icon={<AccountTree />}
                iconPosition="start"
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              />
            </Tabs>

            {tabValue === 0 && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <AnimatedCard
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      background: "linear-gradient(to right, #ffffff, #f9f9f9)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      fontWeight="bold"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <ScienceOutlined sx={{ mr: 1 }} color="primary" />
                      Required Raw Materials
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    {renderRequiredRawMaterials()}
                  </AnimatedCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <AnimatedCard
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      background: "linear-gradient(to right, #ffffff, #f9f9f9)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      fontWeight="bold"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <FactoryOutlined sx={{ mr: 1 }} color="primary" />
                      Raw Material Suppliers
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    {renderRawMaterialSuppliers()}
                  </AnimatedCard>
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  fontWeight="bold"
                  sx={{ mb: 3 }}
                >
                  Supply Chain Participants
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} lg={3}>
                    <EntityCard
                      title="Manufacturer"
                      entity={manufacturers[orders[orderId].MANid]}
                      icon={FactoryOutlined}
                      active={
                        orderStages[orderId] === "Manufacturing Process" ||
                        orderStages[orderId] === "In Distribution" ||
                        orderStages[orderId] === "At Retail Store" ||
                        orderStages[orderId] === "Medicine Sold"
                      }
                      precursorRelevant={
                        medicines[orders[orderId].MedicineId]?.isPrecursor
                      }
                      timestamp={stageTimestamps["Manufacturing Process"]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <EntityCard
                      title="Distributor"
                      entity={distributors[orders[orderId].DISid]}
                      icon={LocalShippingOutlined}
                      active={
                        orderStages[orderId] === "In Distribution" ||
                        orderStages[orderId] === "At Retail Store" ||
                        orderStages[orderId] === "Medicine Sold"
                      }
                      precursorRelevant={
                        medicines[orders[orderId].MedicineId]?.isPrecursor
                      }
                      timestamp={stageTimestamps["In Distribution"]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <EntityCard
                      title="Retailer"
                      entity={retailers[orders[orderId].RETid]}
                      icon={StorefrontOutlined}
                      active={
                        orderStages[orderId] === "At Retail Store" ||
                        orderStages[orderId] === "Medicine Sold"
                      }
                      precursorRelevant={
                        medicines[orders[orderId].MedicineId]?.isPrecursor
                      }
                      timestamp={stageTimestamps["At Retail Store"]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <EntityCard
                      title="Customer"
                      entity={customers[orders[orderId].CUSTid]}
                      icon={PersonOutlined}
                      active={orderStages[orderId] === "Medicine Sold"}
                      timestamp={stageTimestamps["Medicine Sold"]}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box
              sx={{
                textAlign: "center",
                mb: 4,
                "& button": {
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: "bold",
                  textTransform: "none",
                },
              }}
            >
              <AnimatedButton
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => setTrackingDetails(null)}
                startIcon={<Receipt />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start New Tracking
              </AnimatedButton>
            </Box>
          </Box>
        </Fade>
      )}
    </Container>
  );
}

export default Track;
