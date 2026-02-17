import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TicketsPage from "./pages/TicketsPage";
import Kanban from "./pages/Kanban";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/" element={<Login />} />

        {/* PROTECTED ROUTES WITH DASHBOARD LAYOUT */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Default redirect */}
          <Route path="dashboard" element={<Navigate to="/tickets/1" />} />

          <Route path="tickets/:projectId" element={<TicketsPage />} />
          <Route path="kanban/:projectId" element={<Kanban />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
