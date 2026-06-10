import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/usuarios')
            .then(res => setUsuarios(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const totalClientes = usuarios.filter(u => u.rol === 'CLIENTE').length;
    const totalAdmins = usuarios.filter(u => u.rol === 'ADMIN').length;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

            {loading ? (
                <p className="text-gray-400">Cargando...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">Total usuarios</p>
                        <p className="text-4xl font-bold text-white mt-2">{usuarios.length}</p>
                    </div>
                    <div className="bg-gray-800 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">Clientes</p>
                        <p className="text-4xl font-bold text-blue-400 mt-2">{totalClientes}</p>
                    </div>
                    <div className="bg-gray-800 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">Administradores</p>
                        <p className="text-4xl font-bold text-green-400 mt-2">{totalAdmins}</p>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Usuarios registrados</h3>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Nombre</th>
                        <th className="text-left py-2">Correo</th>
                        <th className="text-left py-2">Rol</th>
                    </tr>
                    </thead>
                    <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                            <td className="py-3">{u.nombre}</td>
                            <td className="py-3 text-gray-400">{u.correo}</td>
                            <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${u.rol === 'ADMIN' ? 'bg-green-600' : 'bg-blue-600'}`}>
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