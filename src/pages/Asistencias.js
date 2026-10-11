import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Asistencias() {
    const [usuarios, setUsuarios] = useState([]);
    const [asistenciasHoy, setAsistenciasHoy] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
    const [loading, setLoading] = useState(false);

    // Registro manual (cuando una clienta olvidó registrar su asistencia)
    const hoyISO = new Date().toLocaleDateString('en-CA');           // yyyy-MM-dd en hora local
    const ahoraHHmm = new Date().toTimeString().slice(0, 5);         // HH:mm en hora local
    const [manualUsuario, setManualUsuario] = useState('');
    const [manualFecha, setManualFecha] = useState(hoyISO);
    const [manualHora, setManualHora] = useState(ahoraHHmm);
    const [manualError, setManualError] = useState('');
    const [manualOk, setManualOk] = useState('');
    const [guardandoManual, setGuardandoManual] = useState(false);

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

    const handleRegistrarManual = async () => {
        setManualError('');
        setManualOk('');
        if (!manualUsuario) {
            setManualError('Selecciona una clienta');
            return;
        }
        if (!manualFecha) {
            setManualError('Selecciona la fecha');
            return;
        }
        setGuardandoManual(true);
        try {
            await api.post('/asistencias/manual', {
                usuarioId: Number(manualUsuario),
                fecha: manualFecha,
                hora: manualHora || null
            });
            const nombre = usuarios.find(u => String(u.id) === String(manualUsuario))?.nombre || '';
            setManualOk(`Asistencia registrada: ${nombre} · ${manualFecha}`);
            cargarAsistenciasHoy();
            if (String(usuarioSeleccionado) === String(manualUsuario)) cargarHistorial(manualUsuario);
            setTimeout(() => setManualOk(''), 4000);
        } catch (err) {
            setManualError(err.response?.data?.mensaje || 'Error al registrar la asistencia');
        } finally {
            setGuardandoManual(false);
        }
    };

    const handleEliminar = async (asistencia, nombre) => {
        if (!window.confirm(`¿Eliminar la asistencia de ${nombre || 'la clienta'} del ${asistencia.fechaEntrada}?\nEsta acción no se puede deshacer.`)) return;
        setManualError('');
        setManualOk('');
        try {
            await api.delete(`/asistencias/${asistencia.id}`);
            setManualOk('Asistencia eliminada');
            cargarAsistenciasHoy();
            if (usuarioSeleccionado) cargarHistorial(usuarioSeleccionado);
            setTimeout(() => setManualOk(''), 4000);
        } catch (err) {
            setManualError(err.response?.data?.mensaje || 'Error al eliminar la asistencia');
        }
    };

    const clientesSinSalida = asistenciasHoy.filter(a => !a.fechaSalida);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Asistencias</h2>

            {/* Registrar asistencia manual */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-1">Registrar asistencia manual</h3>
                <p className="text-gray-400 text-sm mb-4">Para cuando una clienta olvidó registrar su asistencia un día.</p>

                {manualOk && <div className="bg-green-600 text-white p-3 rounded-lg mb-4 text-sm">{manualOk}</div>}
                {manualError && <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-sm">{manualError}</div>}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Clienta</label>
                        <select
                            value={manualUsuario}
                            onChange={e => setManualUsuario(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Selecciona --</option>
                            {usuarios.filter(u => u.rol === 'CLIENTE').map(u => (
                                <option key={u.id} value={u.id}>{u.id} · {u.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Fecha</label>
                        <input
                            type="date"
                            max={hoyISO}
                            value={manualFecha}
                            onChange={e => setManualFecha(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Hora de entrada</label>
                        <input
                            type="time"
                            value={manualHora}
                            onChange={e => setManualHora(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleRegistrarManual}
                            disabled={guardandoManual}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
                        >
                            {guardandoManual ? 'Guardando...' : '📝 Registrar asistencia'}
                        </button>
                    </div>
                </div>
            </div>

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
                            <th className="text-left py-2">Acciones</th>
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
                                <td className="py-3">
                                    <button
                                        onClick={() => handleEliminar(a, a.usuario.nombre)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg transition"
                                    >
                                        🗑 Eliminar
                                    </button>
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
                                <th className="text-left py-2">Acciones</th>
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
                                    <td className="py-3">
                                        <button
                                            onClick={() => handleEliminar(a, usuarios.find(u => String(u.id) === String(usuarioSeleccionado))?.nombre)}
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg transition"
                                        >
                                            🗑 Eliminar
                                        </button>
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