import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Companies from './pages/Companies';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PlansPage from './pages/PlansPage';
import './index.css';

const MainLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
};

const AuthLayout = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/empresas" element={<Companies />} />
          <Route path="/plans" element={<PlansPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="/book/:slug" element={<BookingPage />} />
      </Routes>
    </Router>
  );
}

export default App;