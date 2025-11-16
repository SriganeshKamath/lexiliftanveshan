import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Lesson from "./pages/lesson";
import Assessment from "./pages/assessment";
import PracticeExercise from "./pages/PracticeExcersise";
import Microdrill from "./pages/microdrill";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        
        <Route path="/signup" element={<Signup />} />
             <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
   
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/lesson" element={<Lesson />} />
        <Route path="/practice-exercise" element={<PracticeExercise />} />
        <Route path="/microdrills" element={<Microdrill />} />

      </Routes>
    </BrowserRouter>
  );
}
