import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Membresias() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
    const [historial, setHistorial] = useState([]);
    const [membresiaActiva, setMembresiaActiva] = useState(null);
    const [tipo, setTipo] = useState('MENSUAL');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/usuarios').then(res => setUsuarios(res.data));
    }, []);

    const cargarMembresias = async (usuarioId) => {
        setUsuarioSeleccionado(usuarioId);
        setLoading(true);
        try {
            const [histRes, activaRes] = await Promise.allSettled([
                api.get(`/membresias/usuario/${usuarioId}/historial`),
                api.get(`/membresias/usuario/${usuarioId}/activa`)
            ]);
            setHistorial(histRes.status === 'fulfilled' ? histRes.value.data : []);
            setMembresiaActiva(activaRes.status === 'fulfilled' ? activaRes.value.data : null);
        } finally {
            setLoading(false);
        }
    };

    const handleCrear = async () => {
        if (!usuarioSeleccionado) return;
        setError('');
        try {
            await api.post(`/membresias/usuario/${usuarioSeleccionado}`, { tipo });
            setSuccess('Membresía creada correctamente');
            cargarMembresias(usuarioSeleccionado);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al crear membresía');
        }
    };

    const colorTipo = (tipo) => {
        const colores = {
            MENSUAL: 'bg-blue-600',
            TRIMESTRAL: 'bg-purple-600',
            SEMESTRAL: 'bg-orange-600',
            ANUAL: 'bg-green-600'
        };
        return colores[tipo] || 'bg-gray-600';
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Membresías</h2>

            {success && <div className="bg-green-600 text-white p-3 rounded-lg mb-4">{success}</div>}
            {error && <div className="bg-red-600 text-white p-3 rounded-lg mb-4">{error}</div>}

            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Gestionar membresía</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Seleccionar usuario</label>
                        <select
                            value={usuarioSeleccionado}
                            onChange={e => cargarMembresias(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Selecciona un usuario --</option>
                            {usuarios.filter(u => u.rol === 'CLIENTE').map(u => (
                                <option key={u.id} value={u.id}>{u.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Tipo de membresía</label>
                        <select
                            value={tipo}
                            onChange={e => setTipo(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="MENSUAL">Mensual</option>
                            <option value="TRIMESTRAL">Trimestral</option>
                            <option value="SEMESTRAL">Semestral</option>
                            <option value="ANUAL">Anual</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleCrear}
                            disabled={!usuarioSeleccionado}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg transition"
                        >
                            Crear / Renovar membresía
                        </button>
                    </div>
                </div>
            </div>

            {usuarioSeleccionado && (
                <>
                    {membresiaActiva && (
                        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                            <h3 className="text-xl font-semibold mb-4">Membresía activa</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Tipo</p>
                                    <span className={`${colorTipo(membresiaActiva.tipo)} text-white text-sm px-3 py-1 rounded-full inline-block mt-1`}>
                    {membresiaActiva.tipo}
                  </span>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Fecha de pago</p>
                                    <p className="text-white mt-1">{membresiaActiva.fechaPago}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Vencimiento</p>
                                    <p className="text-white mt-1">{membresiaActiva.fechaVencimiento}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Estado</p>
                                    <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full inline-block mt-1">
                    Activa ✓
                  </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-800 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4">Historial de membresías</h3>
                        {loading ? (
                            <p className="text-gray-400">Cargando...</p>
                        ) : historial.length === 0 ? (
                            <p className="text-gray-400">No hay membresías registradas.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="text-left py-2">Tipo</th>
                                    <th className="text-left py-2">Fecha pago</th>
                                    <th className="text-left py-2">Vencimiento</th>
                                    <th className="text-left py-2">Estado</th>
                                </tr>
                                </thead>
                                <tbody>
                                {historial.map(m => (
                                    <tr key={m.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                        <td className="py-3">
                        <span className={`${colorTipo(m.tipo)} text-white text-xs px-2 py-1 rounded-full`}>
                          {m.tipo}
                        </span>
                                        </td>
                                        <td className="py-3 text-gray-400">{m.fechaPago}</td>
                                        <td className="py-3 text-gray-400">{m.fechaVencimiento}</td>
                                        <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${m.activa ? 'bg-green-600' : 'bg-gray-600'}`}>
                          {m.activa ? 'Activa' : 'Vencida'}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}