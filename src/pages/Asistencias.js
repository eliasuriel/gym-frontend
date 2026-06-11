import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Asistencias() {
    const [usuarios, setUsuarios] = useState([]);
    const [asistenciasHoy, setAsistenciasHoy] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/usuarios').then(res => setUsuarios(res.data));
        cargarAsistenciasHoy();
    }, []);

    const cargarAsistenciasHoy = () => {
        api.get('/asistencias/hoy')
            .then(res => setAsistenciasHoy(res.data))
            .catch(() => {});
    };

    const cargarHistorial = (usuarioId) => {
        setUsuarioSeleccionado(usuarioId);
        if (!usuarioId) return;
        setLoading(true);
        api.get(`/asistencias/usuario/${usuarioId}/historial`)
            .then(res => setHistorial(res.data))
            .finally(() => setLoading(false));
    };

    const handleEntrada = async (usuarioId) => {
        setError('');
        try {
            await api.post(`/asistencias/entrada/${usuarioId}`);
            setSuccess('Entrada registrada correctamente');
            cargarAsistenciasHoy();
            if (usuarioSeleccionado) cargarHistorial(usuarioSeleccionado);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar entrada');
        }
    };

    const handleSalida = async (usuarioId) => {
        setError('');
        try {
            await api.put(`/asistencias/salida/${usuarioId}`);
            setSuccess('Salida registrada correctamente');
            cargarAsistenciasHoy();
            if (usuarioSeleccionado) cargarHistorial(usuarioSeleccionado);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar salida');
        }
    };

    const clientesSinSalida = asistenciasHoy.filter(a => !a.fechaSalida);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Asistencias</h2>

            {success && <div className="bg-green-600 text-white p-3 rounded-lg mb-4">{success}</div>}
            {error && <div className="bg-red-600 text-white p-3 rounded-lg mb-4">{error}</div>}

            {/* Registro rápido */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Registro rápido</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {usuarios.filter(u => u.rol === 'CLIENTE').map(u => (
                        <div key={u.id} className="bg-gray-700 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">{u.nombre}</p>
                                <p className="text-gray-400 text-xs">{u.correo}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEntrada(u.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg transition"
                                >
                                    Entrada
                                </button>
                                <button
                                    onClick={() => handleSalida(u.id)}
                                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 rounded-lg transition"
                                >
                                    Salida
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Asistencias de hoy */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Asistencias de hoy</h3>
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
            {asistenciasHoy.length} registros
          </span>
                </div>
                {asistenciasHoy.length === 0 ? (
                    <p className="text-gray-400">No hay asistencias registradas hoy.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                            <th className="text-left py-2">Usuario</th>
                            <th className="text-left py-2">Entrada</th>
                            <th className="text-left py-2">Salida</th>
                            <th className="text-left py-2">Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {asistenciasHoy.map(a => (
                            <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                <td className="py-3">{a.usuario.nombre}</td>
                                <td className="py-3 text-gray-400">{a.fechaEntrada}</td>
                                <td className="py-3 text-gray-400">{a.fechaSalida || '—'}</td>
                                <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${a.fechaSalida ? 'bg-gray-600' : 'bg-green-600'}`}>
                      {a.fechaSalida ? 'Completada' : 'En gimnasio'}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Historial por usuario */}
            <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Historial por usuario</h3>
                <select
                    value={usuarioSeleccionado}
                    onChange={e => cargarHistorial(e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Selecciona un usuario --</option>
                    {usuarios.filter(u => u.rol === 'CLIENTE').map(u => (
                        <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                </select>

                {usuarioSeleccionado && (
                    loading ? (
                        <p className="text-gray-400">Cargando...</p>
                    ) : historial.length === 0 ? (
                        <p className="text-gray-400">No hay historial de asistencias.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-gray-400 border-b border-gray-700">
                                <th className="text-left py-2">Entrada</th>
                                <th className="text-left py-2">Salida</th>
                                <th className="text-left py-2">Estado</th>
                            </tr>
                            </thead>
                            <tbody>
                            {historial.map(a => (
                                <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                    <td className="py-3 text-gray-400">{a.fechaEntrada}</td>
                                    <td className="py-3 text-gray-400">{a.fechaSalida || '—'}</td>
                                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${a.fechaSalida ? 'bg-gray-600' : 'bg-green-600'}`}>
                        {a.fechaSalida ? 'Completada' : 'En gimnasio'}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
}