import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Lesson from "./pages/lesson";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        
        <Route path="/signup" element={<Signup />} />
             <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
   

        <Route path="/lesson" element={<Lesson />} />

      </Routes>
    </BrowserRouter>
  );
}
