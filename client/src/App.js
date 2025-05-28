import "./App.css";
import AssignRoles from "./AssignRoles";
import Home from "./Home";
import OrderMed from "./OrderMed";
import Supply from "./Supply";
import Track from "./Track";
import AddMed from "./AddMed";
import AddRM from "./AddRM";


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/roles" element={<AssignRoles />} />
          <Route path="/addmed" element={<AddMed />} />
          <Route path="/supply" element={<Supply />} />
          <Route path="/track" element={<Track />} />
          <Route path="/ordermed" element={<OrderMed />} />
          <Route path="/addRM" element={<AddRM />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
