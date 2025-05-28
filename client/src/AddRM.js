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
  TextField,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Divider,
  Card,
  Grid,
  CardHeader,
  CardContent,
  LinearProgress
} from "@mui/material";
import {
  Home,
  Science,
  Add,
  Check,
  Warning,
  ArrowBack,
  Inventory,
  Verified
} from "@mui/icons-material";

function AddRM() {
  const navigate = useNavigate();
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [rawMaterials, setRawMaterials] = useState([]);
  const [RawName, setRawName] = useState("");
  const [isPrecursor, setIsPrecursor] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else {
      window.alert("Non-Ethereum browser detected. Consider using MetaMask!");
    }
  };

  const loadBlockchaindata = async () => {
    setloader(true);
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
      } else {
        window.alert("Smart contract not deployed to current network");
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    } finally {
      setloader(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    
    try {
      await SupplyChain.methods
        .addRawMaterial(RawName, isPrecursor)
        .send({ from: currentaccount });
      
      // Reset form
      setRawName("");
      setIsPrecursor(false);
      
      // Refresh data
      await loadBlockchaindata();
    } catch (err) {
      console.error("Error submitting transaction:", err);
      alert("An error occurred while registering the raw material!");
    } finally {
      setSubmitting(false);
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
              <Science sx={{ verticalAlign: "middle", mr: 1 }} />
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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={4}>
          {/* Add Raw Material Form */}
          <Grid item xs={12} md={5}>
            <Card elevation={3}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <Add sx={{ color: "primary.dark" }} />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Register New Raw Material
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Box 
                  component="form" 
                  onSubmit={handleSubmit} 
                  sx={{ mt: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Raw Material Name"
                    variant="outlined"
                    value={RawName}
                    onChange={(e) => setRawName(e.target.value)}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <Science color="action" sx={{ mr: 1 }} />
                      )
                    }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPrecursor}
                        onChange={() => setIsPrecursor(!isPrecursor)}
                        color="primary"
                      />
                    }
                    label="Is a Precursor Material"
                    sx={{ mt: 1, mb: 2 }}
                  />
                  
                  {submitting && <LinearProgress sx={{ mb: 2 }} />}
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    startIcon={<Check />}
                    disabled={submitting}
                    sx={{ 
                      mt: 1,
                      py: 1.5,
                      borderRadius: 1,
                      fontSize: "1rem"
                    }}
                  >
                    {submitting ? "Registering..." : "Register Material"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Registered Raw Materials */}
          <Grid item xs={12} md={7}>
            <Card elevation={3}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "info.light" }}>
                    <Science sx={{ color: "info.dark" }} />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Registered Raw Materials
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                {rawMaterials.length > 0 ? (
                  <Box sx={{ overflow: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Precursor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rawMaterials.map((material) => (
                          <TableRow 
                            key={material.id} 
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell>{material.id}</TableCell>
                            <TableCell>{material.name}</TableCell>
                            <TableCell>
                              {material.isPrecursor ? (
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
                      No Raw Materials Registered
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 300 }}>
                      There are no raw materials registered yet. Use the form to add your first material.
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

export default AddRM;