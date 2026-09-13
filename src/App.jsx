import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import Booking from "./pages/Booking";
import Gear from "./pages/Gear";
import VehicleRental from "./pages/VehicleRental";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Community from "./pages/Community";
import CommunityPost from "./pages/CommunityPost";

import VisaChecker from "./pages/visa-checker/VisaChecker";

import AdminLogin from "./pages/AdminLogin";
import AdminRooms from "./pages/AdminRooms";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* ROOMS */}
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:slug" element={<RoomDetails />} />

        {/* BOOKING */}
        <Route path="/booking" element={<Booking />} />

        {/* GEAR */}
        <Route path="/gear" element={<Gear />} />

        {/* VEHICLES */}
        <Route path="/vehicles" element={<VehicleRental />} />

        {/* ABOUT */}
        <Route path="/about" element={<About />} />

        {/* CONTACT */}
        <Route path="/contact" element={<Contact />} />

        {/* COMMUNITY */}
        <Route path="/community" element={<Community />} />

        {/* COMMUNITY POST */}
        <Route
          path="/community/post/:id"
          element={<CommunityPost />}
        />

        {/* NEPAL VISA CHECKER */}
        <Route
          path="/visa-checker"
          element={<VisaChecker />}
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* ADMIN ROOMS */}
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute>
              <AdminRooms />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Home />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;