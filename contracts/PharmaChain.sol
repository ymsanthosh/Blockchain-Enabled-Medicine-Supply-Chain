// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SupplyChain {

    address public Owner;
    mapping(address => bool) public regulators;  

    constructor() public {
        Owner = msg.sender;
        regulators[msg.sender] = true; 
    }

    modifier onlyByOwner() {
        require(msg.sender == Owner, "Only owner can perform this action");
        _;
    }

    modifier onlyByRegulator() {
        require(regulators[msg.sender], "Only regulators can perform this action");
        _;
    }

    enum STAGE {
        Init,
        RawMaterialSupply,
        Manufacture,
        Distribution,
        Retail,
        Sold
    }

    struct Medicine {
        uint256 id;
        string name;
        string description;
        bool isPrecursor;
        uint256[] requiredRawMaterials;
    }

    struct RawMaterial {
        uint256 id;
        string name;
        bool isPrecursor;
    }

    struct Order {
        uint256 MedicineId;
        uint256 orderId;
        uint256[] RMSid;
        uint256 MANid;
        uint256 DISid;
        uint256 RETid;
        uint256 CUSTid;
        STAGE stage;
    }

    struct RawMaterialSupplier {
        address addr;
        uint256 id;
        string name;
        string place;
        bool urnVerified;
    }
    
    struct Manufacturer {
        address addr;
        uint256 id;
        string name;
        string place;
        bool urnVerified;
    }
    
    struct Distributor {
        address addr;
        uint256 id;
        string name;
        string place;
        bool urnVerified;
    }
    
    struct Retailer {
        address addr;
        uint256 id;
        string name;
        string place;
        bool urnVerified;
    }

    struct Customer {
        address addr;
        uint256 id;
        string name;
        string email;
    }

    uint256 public medicineCtr = 0;
    uint256 public orderCtr =0;
    uint256 public rawMaterialCtr=0;
    uint256 public rmsCtr = 0;
    uint256 public manCtr = 0;
    uint256 public disCtr = 0;
    uint256 public retCtr = 0;
    uint256 public custCtr =0;
    uint256 public regulatorCtr = 0;
    

    mapping(uint256 => Medicine) public medicines;
    mapping(uint256 => RawMaterial) public rawMaterials;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => RawMaterialSupplier) public RMS;
    mapping(uint256 => Manufacturer) public MAN;
    mapping(uint256 => Distributor) public DIS;
    mapping(uint256 => Retailer) public RET;
    mapping(uint256 => Customer) public CUST;
    mapping(uint256 => mapping(uint256 => bool)) public rawMaterialsSupplied;
    mapping(uint256 => mapping(uint256 => uint256)) public rawMaterialsSupplier;
    mapping(uint256 => uint256) public suppliedMaterialCount; 
    mapping(uint256 => mapping(uint8 => uint256)) public stageTimestamps;

    event MedicineAdded(uint256 indexed id, string name);
    event RawMaterialAdded(uint256 id, string name, bool isPrecursor);
    event OrderAdded(uint256 indexed id);
    event StageUpdated(uint256 indexed orderId, STAGE stage);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event URNSupplierRegistered(address urnSupplier);
    event RegulatorChanged(address indexed oldRegulator, address indexed newRegulator);
    event RawMaterialSupplied(address indexed supplier, uint256 rawMaterialID);
    event StageUpdatedWithTimestamp(uint256 indexed orderId, STAGE stage, uint256 timestamp);

    function transferOwnership(address _newOwner) public onlyByOwner {
        require(_newOwner != address(0), "Invalid new owner!");
        emit OwnershipTransferred(Owner, _newOwner);
        Owner = _newOwner;
    }

    function setRegulator(address _newRegulator) public onlyByOwner {
        require(_newRegulator != address(0), "Invalid regulator!");
        regulators[_newRegulator] = true;
        emit RegulatorChanged(msg.sender, _newRegulator);
    }   
    
    function addRegulator(address _regulator) public onlyByOwner {
        require(_regulator != address(0), "Invalid address");
        regulators[_regulator] = true;
    }

    function removeRegulator(address _regulator) public onlyByOwner {
        require(_regulator != address(0), "Invalid address");
        regulators[_regulator] = false;
    }

    function registerCustomer(string memory _name, string memory _email) public {
        bool isRegistered=false;
        for (uint256 i = 1; i <=custCtr; i++) {
            if (CUST[i].addr == msg.sender) {
                isRegistered=true;
                break;
            }
        }
        require(!isRegistered, "Customer already registered!");
        custCtr++;
        CUST[custCtr] = Customer( msg.sender, custCtr, _name, _email);
    }

    function addMedicine(string memory _name, string memory _description, uint256[] memory _rawMaterials, bool _isPrecursor) public onlyByOwner {
        medicineCtr++;
        medicines[medicineCtr] = Medicine(medicineCtr, _name, _description, _isPrecursor, _rawMaterials);
        emit MedicineAdded(medicineCtr, _name);
    }

    function addRawMaterial(string memory _name, bool _isPrecursor) public onlyByOwner {
        rawMaterialCtr++;
        rawMaterials[rawMaterialCtr] = RawMaterial(rawMaterialCtr, _name, _isPrecursor);
        emit RawMaterialAdded(rawMaterialCtr, _name, _isPrecursor);
    }
    
    function addRMS(address _address, string memory _name, string memory _place, bool _isVerified) public onlyByOwner {
        rmsCtr++;
        RMS[rmsCtr] = RawMaterialSupplier(_address, rmsCtr, _name, _place, _isVerified);
    }

    function addManufacturer(address _address, string memory _name, string memory _place,bool _isVerified) public onlyByOwner {
        manCtr++;
        MAN[manCtr] = Manufacturer(_address, manCtr, _name, _place, _isVerified);
    }

    function addDistributor(address _address, string memory _name, string memory _place, bool _isVerified) public onlyByOwner {
        disCtr++;
        DIS[disCtr] = Distributor(_address, disCtr, _name, _place, _isVerified);
    }

    function addRetailer(address _address, string memory _name, string memory _place, bool _isVerified) public onlyByOwner {
        retCtr++;
        RET[retCtr] = Retailer(_address, retCtr, _name, _place, _isVerified);
    }

    function addCustomer(address _address, string memory _name, string memory _email) public onlyByOwner {
        custCtr++;
        CUST[custCtr] = Customer(_address, custCtr, _name, _email);
    }

    function addOrder(uint256 medicineId) public onlyByOwner {
        require(medicineId > 0 && medicineId <= medicineCtr, "Invalid medicine ID");
        orderCtr++;
        uint256[] memory emptyArray = new uint256[](0);
        orders[orderCtr] = Order(medicineId, orderCtr, emptyArray, 0, 0, 0, 0, STAGE.Init);
        emit OrderAdded(orderCtr);
         
    }

    function showStage(uint256 _orderId) public view returns (string memory) {
        require(_orderId > 0 && _orderId <= orderCtr, "Invalid medicine ID!");
        STAGE stage = orders[_orderId].stage;
        if (stage == STAGE.Init) return "Medicine Ordered";
        if (stage == STAGE.RawMaterialSupply) return "Raw Material Supplied";
        if (stage == STAGE.Manufacture) return "Manufacturing Process";
        if (stage == STAGE.Distribution) return "In Distribution";
        if (stage == STAGE.Retail) return "At Retail Store";
        if (stage == STAGE.Sold) return "Medicine Sold";
    }

    function updateStage(uint256 _orderId, STAGE _newStage) internal {
        orders[_orderId].stage = _newStage;
        stageTimestamps[_orderId][uint8(_newStage)] = block.timestamp;
        emit StageUpdated(_orderId, _newStage);
        emit StageUpdatedWithTimestamp(_orderId, _newStage, block.timestamp);
    }
    function getStageTimestamp(uint256 _orderId, STAGE _stage) public view returns (uint256) {
        return stageTimestamps[_orderId][uint8(_stage)];
    }
    
    function getAllTimestamps(uint256 _orderId) public view returns (uint256[6] memory) {
        return [
            stageTimestamps[_orderId][uint8(STAGE.Init)],
            stageTimestamps[_orderId][uint8(STAGE.RawMaterialSupply)],
            stageTimestamps[_orderId][uint8(STAGE.Manufacture)],
            stageTimestamps[_orderId][uint8(STAGE.Distribution)],
            stageTimestamps[_orderId][uint8(STAGE.Retail)],
            stageTimestamps[_orderId][uint8(STAGE.Sold)]
        ];
    }
    function supplyRawMaterials(uint256 _orderId, uint256 _rawMaterialID) public {
        require(_orderId > 0 && _orderId <= orderCtr, "Invalid order ID");
        require(_rawMaterialID > 0 && _rawMaterialID <= rawMaterialCtr, "Invalid raw material ID");

        Order storage order = orders[_orderId];
        Medicine storage medicine = medicines[order.MedicineId];

        require(order.stage == STAGE.Init, "Raw materials can only be supplied at Init stage");

        uint256 rmsId = findRMS(msg.sender);
        require(rmsId > 0, "Not a registered RMS");

        bool isRequired = false;
        for (uint256 i = 0; i < medicine.requiredRawMaterials.length; i++) {
            if (medicine.requiredRawMaterials[i] == _rawMaterialID) {
                isRequired = true;
                break;
            }
        }
        require(isRequired, "This raw material is not required for the medicine");
        require(!rawMaterialsSupplied[_orderId][_rawMaterialID], "Raw material already supplied");

        bool isDualPrecursor = rawMaterials[_rawMaterialID].isPrecursor;
        if (isDualPrecursor) {
            require(RMS[findRMS(msg.sender)].urnVerified, "Unverified RMS cannot supply dual-precursor raw materials");
        }

        orders[_orderId].RMSid.push(findRMS(msg.sender));
        rawMaterialsSupplied[_orderId][_rawMaterialID] = true;
        rawMaterialsSupplier[_orderId][_rawMaterialID]= findRMS(msg.sender);
        suppliedMaterialCount[_orderId]++;

        emit RawMaterialSupplied(msg.sender, _rawMaterialID);

        if (suppliedMaterialCount[_orderId] == medicine.requiredRawMaterials.length) {
            updateStage(_orderId, STAGE.RawMaterialSupply);
        }
    }

    function manufacture(uint256 _orderId) public {
        require(_orderId > 0 && _orderId <= orderCtr, "Invalid order ID");
        Order storage order = orders[_orderId];
        require(order.stage == STAGE.RawMaterialSupply, "Invalid stage!");
        uint256 medicineId = order.MedicineId;
        require(findMAN(msg.sender) > 0, "Not a registered manufacturer!");
        bool isDualPrecursor = medicines[medicineId].isPrecursor;
        if (isDualPrecursor) {
            require(MAN[findMAN(msg.sender)].urnVerified, "Unverified Manufacturer cannot supply dual-precursor Medicine");
        }
    
        orders[_orderId].MANid = findMAN(msg.sender);
        updateStage(_orderId, STAGE.Manufacture);
    }
    
    function distribute(uint256 _orderId) public {
        require(_orderId > 0 && _orderId <= orderCtr, "Invalid order ID");
        Order storage order = orders[_orderId];
        require(order.stage == STAGE.Manufacture, "Invalid stage!");
        uint256 medicineId = order.MedicineId;
        require(findDIS(msg.sender) > 0, "Not a registered Distributor!");
        bool isDualPrecursor = medicines[medicineId].isPrecursor;
        if (isDualPrecursor) {
            require(DIS[findDIS(msg.sender)].urnVerified, "Unverified Distributor cannot supply dual-precursor Medicine");
        }
        orders[_orderId].DISid = findDIS(msg.sender);
        updateStage(_orderId, STAGE.Distribution);
    }

    function retail(uint256 _orderId) public {
        require(_orderId > 0 && _orderId <= orderCtr, "Invalid order ID");
        Order storage order = orders[_orderId];
        require(order.stage == STAGE.Distribution, "Invalid stage!");
        uint256 medicineId = order.MedicineId;
        require(findRET(msg.sender) > 0, "Not a registered Retailer!");
        bool isDualPrecursor = medicines[medicineId].isPrecursor;
        if (isDualPrecursor) {
            require(RET[findRET(msg.sender)].urnVerified, "Unverified Retailer cannot sell dual-precursor Medicine");
        }

        orders[_orderId].RETid = findRET(msg.sender);
        updateStage(_orderId, STAGE.Retail);
    }

    function sell(uint256 _orderId, uint256 _customerId) public {
        require(_orderId > 0 && _orderId <= orderCtr, "Invalid order ID");
        require(_customerId > 0 && _customerId <= custCtr, "Invalid customer ID");

        Order storage order = orders[_orderId];
        require(findRET(msg.sender) == order.RETid, "Not the correct retailer!");
        require(order.stage == STAGE.Retail, "Invalid stage!");

        uint256 medicineId = order.MedicineId;
        require(findRET(msg.sender) > 0, "Not a registered Retailer!");
        bool isDualPrecursor = medicines[medicineId].isPrecursor;
        if (isDualPrecursor) {
            require(RET[findRET(msg.sender)].urnVerified, "Unverified Retailer cannot sell dual-precursor Medicine");
        }

        orders[_orderId].CUSTid = _customerId;
        updateStage(_orderId, STAGE.Sold);
    }

    function findRMS(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= rmsCtr; i++) {
            if (RMS[i].addr == _address) return i;
        }
        return 0;
    }

    function findMAN(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= manCtr; i++) {
            if (MAN[i].addr == _address) return i;
        }
        return 0;
    }

    function findDIS(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= disCtr; i++) {
            if (DIS[i].addr == _address) return i;
        }
        return 0;
    }

    function findRET(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= retCtr; i++) {
            if (RET[i].addr == _address) return i;
        }
        return 0;
    }

    function findCUST(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= custCtr; i++) {
            if (CUST[i].addr == _address) return i;
        }
        return 0;
    }
    function getRequiredRawMaterials(uint256 medicineId) public view returns (uint256[] memory) {
        return medicines[medicineId].requiredRawMaterials;
    }
    function getOrderRMS(uint256 orderId) public view returns (uint256[] memory) {
        return orders[orderId].RMSid;
    }


}

