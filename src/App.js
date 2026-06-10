import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

function App() {
  const [rol, setRol] = useState(localStorage.getItem('rol'));

  const handleLogin = (rolUsuario) => {
    setRol(rolUsuario);
  };

  const handleLogout = () => {
    localStorage.clear();
    setRol(null);
  };

  if (!rol) {
    return <Login onLogin={handleLogin} />;
  }

  return (
      <Layout onLogout={handleLogout}>
        <Dashboard />
      </Layout>
  );
}

export default App;