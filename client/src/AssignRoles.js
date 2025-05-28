import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Card,
  CardHeader,
  CardContent,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Fade,
  Grow,
  Collapse
} from "@mui/material";
import {
  Home,
  Factory,
  LocalShipping,
  Store,
  Science,
  Check,
  ArrowBack,
  AccountCircle,
  LocationOn,
  Fingerprint,
  Add,
  Refresh,
  Email,
  KeyboardArrowDown,
  KeyboardArrowUp
} from "@mui/icons-material";

// Isolated Input Component
// Controlled from parent but maintains its own internal state
const IsolatedInput = React.memo(({ id, label, initialValue, onChangeCommitted, startIcon, fullWidth = true }) => {
  // Internal state to prevent parent re-renders
  const [internalValue, setInternalValue] = useState(initialValue || "");
  
  // Update internal value when prop changes (for resets)
  useEffect(() => {
    setInternalValue(initialValue || "");
  }, [initialValue]);
  
  const handleChange = (e) => {
    setInternalValue(e.target.value);
  };
  
  // Only propagate change to parent on blur or enter key
  const handleBlur = () => {
    if (internalValue !== initialValue) {
      onChangeCommitted(id, internalValue);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (internalValue !== initialValue) {
        onChangeCommitted(id, internalValue);
      }
      e.target.blur();
    }
  };
  
  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      InputProps={{
        startAdornment: startIcon && React.cloneElement(startIcon, { color: "action", sx: { mr: 1 } })
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          "&:hover fieldset": {
            borderColor: "primary.main",
            transition: "all 0.3s ease-in-out"
          },
        }
      }}
    />
  );
});

// Isolated Switch Component
const IsolatedSwitch = React.memo(({ id, label, initialChecked, onChangeCommitted, color }) => {
  const [internalChecked, setInternalChecked] = useState(initialChecked || false);
  
  useEffect(() => {
    setInternalChecked(initialChecked || false);
  }, [initialChecked]);
  
  const handleChange = (e) => {
    const newValue = e.target.checked;
    setInternalChecked(newValue);
    onChangeCommitted(id, newValue);
  };
  
  return (
    <FormControlLabel
      control={
        <Switch
          checked={internalChecked}
          onChange={handleChange}
          color={color}
        />
      }
      label={label}
      sx={{ mt: 1 }}
    />
  );
});

// Table component for displaying role data
const RoleTable = React.memo(({ collection, roleType }) => {
  const [expanded, setExpanded] = useState(true);
  
  if (Object.keys(collection).length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
        <Typography variant="body2">No entries yet</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {Object.keys(collection).length} entries found
        </Typography>
        <Button 
          size="small" 
          endIcon={expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide" : "Show"}
        </Button>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ mt: 1, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                {roleType !== 'CUST' && <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>}
                {roleType === 'CUST' && <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>}
                <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                {roleType !== 'CUST' && <TableCell sx={{ fontWeight: 600 }}>Verified</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(collection).map((key) => {
                const item = collection[key];
                return (
                  <TableRow 
                    key={key} 
                    hover
                    className="animated-row"
                    sx={{
                      animation: "fadeIn 0.3s ease-in-out",
                      "@keyframes fadeIn": {
                        "0%": { opacity: 0, transform: "translateY(10px)" },
                        "100%": { opacity: 1, transform: "translateY(0)" }
                      },
                      animationDelay: `${parseInt(key) * 0.05}s`
                    }}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    {roleType !== 'CUST' && <TableCell>{item.place}</TableCell>}
                    {roleType === 'CUST' && <TableCell>{item.email}</TableCell>}
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {item.addr?.substring(0, 8)}...{item.addr?.substring(item.addr.length - 6)}
                    </TableCell>
                    {roleType !== 'CUST' && (
                      <TableCell>
                        {item.urnVerified === true ||
                          item.urnVerified === "true" ||
                          item.urnVerified === "1" ?
                          <Chip
                            icon={<Check />}
                            label="Verified"
                            size="small"
                            color="success"
                            variant="outlined"
                          /> :
                          <Chip
                            label="Not Verified"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        }
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Collapse>
    </>
  );
});

// Completely separate Role Form Component
const RoleFormComponent = React.memo(({ 
  role, 
  icon, 
  color, 
  initialFormData, 
  onSubmit, 
  roleCollection, 
  isSubmitting, 
  onRefresh
}) => {
  const [formData, setFormData] = useState(initialFormData || {});
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    // Reset form when initialFormData changes (after successful submission)
    setFormData(initialFormData || {});
  }, [initialFormData]);
  
  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh(role);
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  const handleFormSubmit = () => {
    onSubmit(role, formData);
  };
  
  const roleTitles = {
    RMS: 'Raw Material Supplier',
    MAN: 'Manufacturer',
    DIS: 'Distributor',
    RET: 'Retailer',
    CUST: 'Customer'
  };
  
  // Check if form is valid for submission
  const formValid = role === 'CUST'
    ? !!formData.address && !!formData.name && !!formData.email
    : !!formData.address && !!formData.name && !!formData.place;
  
  return (
    <Grow in={true} timeout={300 + Object.keys(roleTitles).indexOf(role) * 100}>
      <Card 
        elevation={3} 
        sx={{ 
          mb: 4,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 6,
            transform: 'scale(1.005)'
          }
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: `${color}.light` }}>
              {React.cloneElement(icon, { sx: { color: `${color}.dark` } })}
            </Avatar>
          }
          title={
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {roleTitles[role]}
            </Typography>
          }
          action={
            <Tooltip title="Refresh">
              <IconButton 
                onClick={handleRefresh}
                className={isRefreshing ? "spin-animation" : ""}
                sx={{
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" }
                  },
                  "&.spin-animation": {
                    animation: "spin 1s linear"
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          }
        />

        <CardContent>
          <Grid container spacing={2}>
            {role === 'CUST' ? (
              <>
                <Grid item xs={12} md={4}>
                  <IsolatedInput
                    id="address"
                    label="Ethereum Address"
                    initialValue={formData.address || ""}
                    onChangeCommitted={handleFieldChange}
                    startIcon={<Fingerprint />}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <IsolatedInput
                    id="name"
                    label="Customer Name"
                    initialValue={formData.name || ""}
                    onChangeCommitted={handleFieldChange}
                    startIcon={<AccountCircle />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <IsolatedInput
                    id="email"
                    label="Email"
                    initialValue={formData.email || ""}
                    onChangeCommitted={handleFieldChange}
                    startIcon={<Email />}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} md={3}>
                  <IsolatedInput
                    id="address"
                    label="Ethereum Address"
                    initialValue={formData.address || ""}
                    onChangeCommitted={handleFieldChange}
                    startIcon={<Fingerprint />}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <IsolatedInput
                    id="name"
                    label={`${role === 'RMS' ? 'Supplier' : role} Name`}
                    initialValue={formData.name || ""}
                    onChangeCommitted={handleFieldChange}
                    startIcon={<AccountCircle />}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <IsolatedInput
                    id="place"
                    label="Location"
                    initialValue={formData.place || ""}
                    onChangeCommitted={handleFieldChange}
                    startIcon={<LocationOn />}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <IsolatedSwitch
                    id="verified"
                    label="Verified"
                    initialChecked={formData.verified || false}
                    onChangeCommitted={handleFieldChange}
                    color={color}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={role === 'CUST' ? 1 : 1}>
              <Button
                fullWidth
                variant="contained"
                color={color}
                startIcon={<Add />}
                onClick={handleFormSubmit}
                disabled={isSubmitting || !formValid}
                sx={{ 
                  height: '56px',
                  transition: 'all 0.3s',
                  '&:not(:disabled):hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </Grid>
          </Grid>

          {isSubmitting && (
            <Fade in={true}>
              <LinearProgress sx={{ mt: 2 }} color={color} />
            </Fade>
          )}

          <Box sx={{ mt: 3 }}>
            <RoleTable collection={roleCollection} roleType={role} />
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
});

// Main AssignRoles component
function AssignRoles() {
  const navigate = useNavigate();
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  
  // Store blank forms data separately from form components
  const [formStates, setFormStates] = useState({
    RMS: { name: "", place: "", address: "", verified: false },
    MAN: { name: "", place: "", address: "", verified: false },
    DIS: { name: "", place: "", address: "", verified: false },
    RET: { name: "", place: "", address: "", verified: false },
    CUST: { name: "", email: "", address: "" }
  });
  
  // Store blockchain data
  const [roleData, setRoleData] = useState({
    RMS: {},
    MAN: {},
    DIS: {},
    RET: {},
    CUST: {}
  });
  
  const [submitting, setSubmitting] = useState({
    RMS: false,
    MAN: false,
    DIS: false,
    RET: false,
    CUST: false
  });

  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
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

        // Load RMS
        const rmsCtr = await supplychain.methods.rmsCtr().call();
        const rms = {};
        for (let i = 0; i < rmsCtr; i++) {
          const rmsData = await supplychain.methods.RMS(i + 1).call();
          // Convert string 'true'/'false' to boolean if needed
          if (typeof rmsData.isVerified === 'string') {
            rmsData.isVerified = rmsData.isVerified === 'true';
          }
          rms[i] = rmsData;
        }

        // Load other data similarly...
        const manCtr = await supplychain.methods.manCtr().call();
        const man = {};
        for (let i = 0; i < manCtr; i++) {
          const manData = await supplychain.methods.MAN(i + 1).call();
          if (typeof manData.isVerified === 'string') {
            manData.isVerified = manData.isVerified === 'true';
          }
          man[i] = manData;
        }

        const disCtr = await supplychain.methods.disCtr().call();
        const dis = {};
        for (let i = 0; i < disCtr; i++) {
          const disData = await supplychain.methods.DIS(i + 1).call();
          if (typeof disData.isVerified === 'string') {
            disData.isVerified = disData.isVerified === 'true';
          }
          dis[i] = disData;
        }

        const retCtr = await supplychain.methods.retCtr().call();
        const ret = {};
        for (let i = 0; i < retCtr; i++) {
          const retData = await supplychain.methods.RET(i + 1).call();
          if (typeof retData.isVerified === 'string') {
            retData.isVerified = retData.isVerified === 'true';
          }
          ret[i] = retData;
        }

        const custCtr = await supplychain.methods.custCtr().call();
        const cust = {};
        for (let i = 0; i < custCtr; i++) {
          cust[i] = await supplychain.methods.CUST(i + 1).call();
        }
        
        // Update all role data in a single state update
        setRoleData({
          RMS: rms,
          MAN: man,
          DIS: dis,
          RET: ret,
          CUST: cust
        });
      } else {
        window.alert("The smart contract is not deployed to current network");
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    } finally {
      setloader(false);
    }
  };

  const handleRefresh = (role) => {
    loadBlockchaindata();
  };

  const handleSubmit = async (role, formData) => {
    setSubmitting(prev => ({ ...prev, [role]: true }));

    try {
      let receipt;
      
      switch (role) {
        case 'RMS':
          receipt = await SupplyChain.methods
            .addRMS(formData.address, formData.name, formData.place, formData.verified)
            .send({ from: currentaccount });
          break;
        case 'MAN':
          receipt = await SupplyChain.methods
            .addManufacturer(formData.address, formData.name, formData.place, formData.verified)
            .send({ from: currentaccount });
          break;
        case 'DIS':
          receipt = await SupplyChain.methods
            .addDistributor(formData.address, formData.name, formData.place, formData.verified)
            .send({ from: currentaccount });
          break;
        case 'RET':
          receipt = await SupplyChain.methods
            .addRetailer(formData.address, formData.name, formData.place, formData.verified)
            .send({ from: currentaccount });
          break;
        case 'CUST':
          receipt = await SupplyChain.methods
            .addCustomer(formData.address, formData.name, formData.email)
            .send({ from: currentaccount });
          break;
      }

      if (receipt) {
        // Reset form data in parent state
        setFormStates(prev => ({
          ...prev,
          [role]: role === 'CUST' 
            ? { name: "", email: "", address: "" }
            : { name: "", place: "", address: "", verified: false }
        }));
        
        // Add a small delay to ensure the blockchain has time to update
        setTimeout(() => {
          loadBlockchaindata();
        }, 1000);
      }
    } catch (err) {
      console.error(`Error adding ${role}:`, err);
      alert(`An error occurred while adding ${role}!`);
    } finally {
      setSubmitting(prev => ({ ...prev, [role]: false }));
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
        <div className="loading-animation" sx={{
          "@keyframes pulse": {
            "0%": { opacity: 0.6, transform: "scale(0.9)" },
            "50%": { opacity: 1, transform: "scale(1)" },
            "100%": { opacity: 0.6, transform: "scale(0.9)" }
          },
          animation: "pulse 1.5s infinite ease-in-out"
        }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        </div>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            animation: "fadeIn 1s ease-in-out",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" }
            }
          }}
        >
          Loading Blockchain Data...
        </Typography>
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
          mb: 3,
          animation: "slideDown 0.5s ease-out",
          "@keyframes slideDown": {
            "0%": { transform: "translateY(-50px)", opacity: 0 },
            "100%": { transform: "translateY(0)", opacity: 1 }
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
                boxShadow: 2,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "scale(1.05)"
                }
              }}
            >
              Home
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Account Info */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Card 
          elevation={3}
          sx={{
            animation: "fadeIn 0.5s ease-in-out",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" }
            },
            animationDelay: "0.2s",
            animationFillMode: "both"
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ 
                bgcolor: "info.light", 
                mr: 2,
                animation: "pulse 2s infinite ease-in-out",
                "@keyframes pulse": {
                  "0%": { boxShadow: "0 0 0 0 rgba(33, 150, 243, 0.4)" },
                  "70%": { boxShadow: "0 0 0 10px rgba(33, 150, 243, 0)" },
                  "100%": { boxShadow: "0 0 0 0 rgba(33, 150, 243, 0)" }
                }
              }}>
                <Fingerprint sx={{ color: "info.dark" }} />
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
        <RoleFormComponent
          role="RMS"
          icon={<Science />}
          color="primary"
          initialFormData={formStates.RMS}
          onSubmit={handleSubmit}
          roleCollection={roleData.RMS}
          isSubmitting={submitting.RMS}
          onRefresh={handleRefresh}
        />

        <RoleFormComponent
          role="MAN"
          icon={<Factory />}
          color="secondary"
          initialFormData={formStates.MAN}
          onSubmit={handleSubmit}
          roleCollection={roleData.MAN}
          isSubmitting={submitting.MAN}
          onRefresh={handleRefresh}
        />

        <RoleFormComponent
          role="DIS"
          icon={<LocalShipping />}
          color="warning"
          initialFormData={formStates.DIS}
          onSubmit={handleSubmit}
          roleCollection={roleData.DIS}
          isSubmitting={submitting.DIS}
          onRefresh={handleRefresh}
        />

        <RoleFormComponent
          role="RET"
          icon={<Store />}
          color="success"
          initialFormData={formStates.RET}
          onSubmit={handleSubmit}
          roleCollection={roleData.RET}
          isSubmitting={submitting.RET}
          onRefresh={handleRefresh}
        />

        <RoleFormComponent
          role="CUST"
          icon={<AccountCircle />}
          color="info"
          initialFormData={formStates.CUST}
          onSubmit={handleSubmit}
          roleCollection={roleData.CUST}
          isSubmitting={submitting.CUST}
          onRefresh={handleRefresh}
        />
      </Container>
    </Box>
  );
}

export default AssignRoles;