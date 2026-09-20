import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// Public pages
const Home = lazy(() => import("./pages/Home"));
const Rooms = lazy(() => import("./pages/Rooms"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const Booking = lazy(() => import("./pages/Booking"));
const Gear = lazy(() => import("./pages/Gear"));
const VehicleRental = lazy(() => import("./pages/VehicleRental"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));

const Community = lazy(() => import("./pages/Community"));
const CommunityPost = lazy(() => import("./pages/CommunityPost"));

const VisaChecker = lazy(() =>
  import("./pages/visa-checker/VisaChecker")
);

// Admin pages
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminRooms = lazy(() => import("./pages/AdminRooms"));

const AdminTrekking = lazy(() =>
  import("./pages/AdminTrekking")
);

const AddTrek = lazy(() =>
  import("./pages/AddTrek")
);

const EditTrek = lazy(() =>
  import("./pages/EditTrek")
);

// Trekking
const Trekking = lazy(() =>
  import("./pages/Trekking")
);

const TrekkingDetails = lazy(() =>
  import("./pages/TrekkingDetails")
);

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Loading...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      {/* Always scroll to top when changing pages */}
      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* ROOMS */}
          <Route path="/rooms" element={<Rooms />} />

          <Route
            path="/rooms/:slug"
            element={<RoomDetails />}
          />

          {/* BOOKING */}
          <Route path="/booking" element={<Booking />} />

          {/* GEAR */}
          <Route path="/gear" element={<Gear />} />

          {/* VEHICLES */}
          <Route
            path="/vehicles"
            element={<VehicleRental />}
          />

          {/* TREKKING */}
          <Route
            path="/trekking"
            element={<Trekking />}
          />

          <Route
            path="/trekking/:slug"
            element={<TrekkingDetails />}
          />

          {/* ABOUT */}
          <Route path="/about" element={<About />} />

          {/* CONTACT */}
          <Route path="/contact" element={<Contact />} />

          {/* COMMUNITY */}
          <Route
            path="/community"
            element={<Community />}
          />

          <Route
            path="/community/post/:id"
            element={<CommunityPost />}
          />

          {/* VISA */}
          <Route
            path="/visa-checker"
            element={<VisaChecker />}
          />

          {/* ADMIN LOGIN */}
          <Route
            path="/admin"
            element={<AdminLogin />}
          />

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* ADMIN DASHBOARD */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
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

          {/* ADMIN TREKKING */}
          <Route
            path="/admin/trekking"
            element={
              <ProtectedRoute>
                <AdminTrekking />
              </ProtectedRoute>
            }
          />

          {/* ADD TREK */}
          <Route
            path="/admin/trekking/add"
            element={
              <ProtectedRoute>
                <AddTrek />
              </ProtectedRoute>
            }
          />

          {/* EDIT TREK */}
          <Route
            path="/admin/trekking/edit/:id"
            element={
              <ProtectedRoute>
                <EditTrek />
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}
          <Route
            path="*"
            element={<Home />}
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;