import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/usuarios')
            .then(res => setUsuarios(res.data))
            .finally(() => setLoading(false));
    }, []);

    const totalClientes = usuarios.filter(u => u.rol === 'CLIENTE').length;
    const totalAdmins = usuarios.filter(u => u.rol === 'ADMIN').length;

    const cardStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,132,252,0.15)' };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2 text-white">Dashboard</h2>
            <p className="mb-8" style={{ color: '#9ca3af' }}>Bienvenida, administradora</p>

            {loading ? (
                <p style={{ color: '#9ca3af' }}>Cargando...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="rounded-2xl p-6" style={cardStyle}>
                        <p className="text-sm mb-2" style={{ color: '#9ca3af' }}>Total usuarios</p>
                        <p className="text-4xl font-bold text-white">{usuarios.length}</p>
                    </div>
                    <div className="rounded-2xl p-6" style={cardStyle}>
                        <p className="text-sm mb-2" style={{ color: '#9ca3af' }}>Clientas</p>
                        <p className="text-4xl font-bold" style={{ color: '#c084fc' }}>{totalClientes}</p>
                    </div>
                    <div className="rounded-2xl p-6" style={cardStyle}>
                        <p className="text-sm mb-2" style={{ color: '#9ca3af' }}>Administradoras</p>
                        <p className="text-4xl font-bold" style={{ color: '#f472b6' }}>{totalAdmins}</p>
                    </div>
                </div>
            )}

            <div className="rounded-2xl p-6" style={cardStyle}>
                <h3 className="text-xl font-semibold mb-4 text-white">Usuarias registradas</h3>
                <table className="w-full text-sm">
                    <thead>
                    <tr style={{ color: '#9ca3af', borderBottom: '1px solid rgba(192,132,252,0.15)' }}>
                        <th className="text-left py-2">Nombre</th>
                        <th className="text-left py-2">Correo</th>
                        <th className="text-left py-2">Rol</th>
                    </tr>
                    </thead>
                    <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                            className="hover:bg-white hover:bg-opacity-5 transition">
                            <td className="py-3 text-white">{u.nombre}</td>
                            <td className="py-3" style={{ color: '#9ca3af' }}>{u.correo}</td>
                            <td className="py-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={u.rol === 'ADMIN'
                            ? { background: 'rgba(244,114,182,0.2)', color: '#f472b6' }
                            : { background: 'rgba(192,132,252,0.2)', color: '#c084fc' }}>
                    {u.rol}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}