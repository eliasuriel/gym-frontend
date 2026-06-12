import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Membresias from './pages/Membresias';
import Asistencias from './pages/Asistencias';
import MiMembresia from './pages/MiMembresia';
import MisDatos from './pages/MisDatos';
import Layout from './components/Layout';

function App() {
  const [rol, setRol] = useState(localStorage.getItem('rol'));
  const [pagina, setPagina] = useState(
      localStorage.getItem('rol') === 'CLIENTE' ? 'mi-membresia' : 'dashboard'
  );

  const handleLogin = (rolUsuario) => {
    setRol(rolUsuario);
    setPagina(rolUsuario === 'CLIENTE' ? 'mi-membresia' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setRol(null);
  };

  if (!rol) return <Login onLogin={handleLogin} />;

  const renderPagina = () => {
    switch (pagina) {
      case 'dashboard': return <Dashboard />;
      case 'usuarios': return <Usuarios />;
      case 'membresias': return <Membresias />;
      case 'asistencias': return <Asistencias />;
      case 'mi-membresia': return <MiMembresia />;
      case 'mis-datos': return <MisDatos />;
      default: return localStorage.getItem('rol') === 'CLIENTE' ? <MiMembresia /> : <Dashboard />;
    }
  };

  return (
      <Layout onLogout={handleLogout} onNavigate={setPagina} pagina={pagina}>
        {renderPagina()}
      </Layout>
  );
}

export default App;