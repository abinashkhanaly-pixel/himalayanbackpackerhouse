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
        <Route path="/rooms/:id" element={<RoomDetails />} />

        {/* BOOKING */}
        <Route path="/booking" element={<Booking />} />

        {/* GEAR RENTAL */}
        <Route path="/gear" element={<Gear />} />

        {/* TOURIST VEHICLE RENTAL */}
        <Route path="/vehicles" element={<VehicleRental />} />

        {/* ABOUT US */}
        <Route path="/about" element={<About />} />

        {/* CONTACT US */}
        <Route path="/contact" element={<Contact />} />

        {/* BACKPACKER COMMUNITY */}
        <Route path="/community" element={<Community />} />

        {/* COMMUNITY INDIVIDUAL POSTS */}
        <Route
          path="/community/post/:id"
          element={<CommunityPost />}
        />

        {/* ADMIN LOGIN */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute>
              <AdminRooms />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
