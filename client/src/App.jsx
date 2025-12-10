import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./routes/Home";
import Search from "./routes/Search";
import TripDetails from "./routes/TripDetails";
import CreateTrip from "./routes/CreateTrip";
import DriverRegister from "./routes/DriverRegister";
import MyVehicles from "./routes/MyVehicles";
import Dashboard from "./routes/Dashboard";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import AdminDashboard from "./routes/AdminDashboard";
import UserSync from "./components/UserSync";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <UserSync />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trips/:id" element={<TripDetails />} />
          <Route path="/create-trip" element={<CreateTrip />} />
          <Route path="/driver/register" element={<DriverRegister />} />
          <Route path="/driver/vehicles" element={<MyVehicles />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
