import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Asistencias() {
    const [usuarios, setUsuarios] = useState([]);
    const [asistenciasHoy, setAsistenciasHoy] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
    const [loading, setLoading] = useState(false);

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

    const clientesSinSalida = asistenciasHoy.filter(a => !a.fechaSalida);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Asistencias</h2>

            {/* Resumen del día */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Resumen de hoy</h3>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{asistenciasHoy.length}</p>
                            <p className="text-gray-400 text-xs">Total entradas</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{clientesSinSalida.length}</p>
                            <p className="text-gray-400 text-xs">En gimnasio ahora</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-400">{asistenciasHoy.length - clientesSinSalida.length}</p>
                            <p className="text-gray-400 text-xs">Ya salieron</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Asistencias de hoy */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Asistencias de hoy</h3>
                    <button
                        onClick={cargarAsistenciasHoy}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-lg transition"
                    >
                        🔄 Actualizar
                    </button>
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
                                <td className="py-3 font-medium">{a.usuario.nombre}</td>
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