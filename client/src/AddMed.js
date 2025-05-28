import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Autocomplete,
  Checkbox,
  ListItemText
} from "@mui/material";
import {
  Home,
  Inventory,
  Check,
  Warning,
  ArrowBack,
  Add,
  MedicalServices,
  Science,
  Description,
  Verified
} from "@mui/icons-material";

function AddMed() {
  const navigate = useNavigate();
  
  // State variables
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState({});
  const [MedName, setMedName] = useState("");
  const [MedDes, setMedDes] = useState("");
  const [isPrecursor, setIsPrecursor] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [selectedRawMaterials, setSelectedRawMaterials] = useState([]);

  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  // Update isPrecursor whenever selectedRawMaterials changes
  useEffect(() => {
    if (selectedRawMaterials.length > 0) {
      const hasPrecursor = selectedRawMaterials.some(material => 
        rawMaterials.find(rm => rm.id === material.id)?.isPrecursor
      );
      setIsPrecursor(hasPrecursor);
    } else {
      setIsPrecursor(false);
    }
  }, [selectedRawMaterials, rawMaterials]);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const loadBlockchaindata = async () => {
    setloader(true);
    const web3 = window.web3;
    
    try {
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
        
        // Load medicines
        const medCtr = await supplychain.methods.medicineCtr().call();
        const med = {};
        for (let i = 0; i < medCtr; i++) {
          med[i] = await supplychain.methods.medicines(i + 1).call();
        }
        setMED(med);
        
        // Load raw materials with precursor status
        const rawMatCtr = await supplychain.methods.rawMaterialCtr().call();
        const rawMaterialsList = [];
        for (let i = 0; i < rawMatCtr; i++) {
          const rawMaterial = await supplychain.methods.rawMaterials(i + 1).call();
          rawMaterialsList.push({ 
            id: i + 1, 
            name: rawMaterial.name,
            isPrecursor: rawMaterial.isPrecursor
          });
        }
        setRawMaterials(rawMaterialsList);
        
        setloader(false);
      } else {
        window.alert("The smart contract is not deployed to current network");
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      setloader(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!MedName || !MedDes || selectedRawMaterials.length === 0) {
      alert("Please fill all required fields");
      return;
    }
    
    try {
      // Convert selected raw materials to array of IDs
      const rawMaterialIds = selectedRawMaterials.map(rm => rm.id);
      
      const receipt = await SupplyChain.methods
        .addMedicine(MedName, MedDes, rawMaterialIds, isPrecursor)
        .send({ from: currentaccount });
        
      if (receipt) {
        // Reset form fields
        setMedName("");
        setMedDes("");
        setSelectedRawMaterials([]);
        
        // Reload data
        loadBlockchaindata();
      }
    } catch (err) {
      console.error("Transaction error:", err);
      alert("Transaction failed. See console for details.");
    }
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
          background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)"
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
          <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}>
            Loading Blockchain Data...
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Please wait while we connect to the network
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)"
    }}>
      {/* Header */}
      <Paper 
        elevation={3}
        sx={{
          background: "linear-gradient(45deg, #00796b 0%, #26a69a 100%)",
          color: "white",
          py: 3,
          px: 2,
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
              <MedicalServices sx={{ verticalAlign: "middle", mr: 1 }} />
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
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
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
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { md: "right" } }}>
                <Chip
                  label={SupplyChain ? "Contract Connected" : "Contract Not Connected"}
                  color={SupplyChain ? "success" : "error"}
                  size="small"
                  sx={{ 
                    px: 1,
                    fontSize: "0.75rem",
                    height: 24
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Container>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Register Medicine Form */}
          <Grid item xs={16} md={10}>
            <Card elevation={3}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <Add sx={{ color: "primary.dark" }} />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Register New Medicine
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 6 }}>
                  {/* Medicine Name */}
                  <TextField
                    fullWidth
                    label="Medicine Name"
                    variant="outlined"
                    value={MedName}
                    onChange={(e) => setMedName(e.target.value)}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <MedicalServices color="action" sx={{ mr: 1 }} />
                      )
                    }}
                  />
                  
                  {/* Medicine Description */}
                  <TextField
                    fullWidth
                    label="Medicine Description"
                    variant="outlined"
                    value={MedDes}
                    onChange={(e) => setMedDes(e.target.value)}
                    margin="normal"
                    required
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: (
                        <Description color="action" sx={{ mr: 1 }} />
                      )
                    }}
                  />
                  
                  {/* Raw Materials Selection */}
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Required Raw Materials*
                  </Typography>
                  <Autocomplete
                    multiple
                    options={rawMaterials}
                    getOptionLabel={(option) => option.name}
                    value={selectedRawMaterials}
                    onChange={(event, newValue) => {
                      setSelectedRawMaterials(newValue);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        <ListItemText 
                          primary={option.name}
                          secondary={option.isPrecursor ? "Controlled Substance/Precursor" : "Regular Material"}
                          secondaryTypographyProps={{
                            color: option.isPrecursor ? "warning.main" : "text.secondary",
                            fontSize: '0.75rem'
                          }}
                        />
                        {option.isPrecursor && (
                          <Warning 
                            color="warning" 
                            fontSize="small" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Select raw materials"
                      />
                    )}
                    sx={{ mb: 2 }}
                  />
                  
                  {/* Precursor Status Display */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: isPrecursor ? 'warning.light' : 'success.light'
                  }}>
                    {isPrecursor ? (
                      <>
                        <Warning color="warning" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="warning.dark">
                          This medicine contains controlled substances/precursors
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Verified color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="success.dark">
                          This medicine does not contain controlled substances
                        </Typography>
                      </>
                    )}
                  </Box>
                  
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    startIcon={<Check />}
                    sx={{ 
                      mt: 1,
                      py: 1.5,
                      borderRadius: 1,
                      fontSize: "1rem"
                    }}
                  >
                    Register Medicine
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Registered Medicines */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "info.light" }}>
                    <MedicalServices sx={{ color: "info.dark" }} />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Registered Medicines
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                {Object.keys(MED).length > 0 ? (
                  <Box sx={{ overflow: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Precursor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.keys(MED).map((key) => (
                          <TableRow 
                            key={key} 
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell>{MED[key].id}</TableCell>
                            <TableCell>{MED[key].name}</TableCell>
                            <TableCell>{MED[key].description}</TableCell>
                            <TableCell>
                              {MED[key].isPrecursor ? (
                                <Chip 
                                  label="Yes" 
                                  size="small" 
                                  color="warning"
                                  icon={<Warning sx={{ fontSize: '14px !important' }} />}
                                />
                              ) : (
                                <Chip 
                                  label="No" 
                                  size="small" 
                                  color="success"
                                  icon={<Verified sx={{ fontSize: '14px !important' }} />}
                                />
                              )}
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
                      No Medicines Registered
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 300 }}>
                      There are no medicines registered in the system yet. Use the form to add your first medicine.
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

export default AddMed;