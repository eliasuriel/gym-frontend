import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Layout from './components/Layout';

function App() {
  const [rol, setRol] = useState(localStorage.getItem('rol'));
  const [pagina, setPagina] = useState('dashboard');

  const handleLogin = (rolUsuario) => {
    setRol(rolUsuario);
    setPagina('dashboard');
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
      default: return <Dashboard />;
    }
  };

  return (
      <Layout onLogout={handleLogout} onNavigate={setPagina} pagina={pagina}>
        {renderPagina()}
      </Layout>
  );
}

export default App;