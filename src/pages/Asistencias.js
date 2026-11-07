import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../services/api';

const normalizarBusqueda = valor => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const coincideCliente = (u, busqueda) => {
    const termino = normalizarBusqueda(busqueda);
    if (!termino) return true;
    // Los números representan un ID completo, nunca coincidencias parciales.
    if (/^\d+$/.test(termino)) return String(u.id) === String(Number(termino));
    return [u.nombre, u.correo, u.telefono].some(valor => normalizarBusqueda(valor).includes(termino));
};

export default function Asistencias() {
    const [usuarios, setUsuarios] = useState([]);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [busquedaHistorial, setBusquedaHistorial] = useState('');
    const [asistenciasHoy, setAsistenciasHoy] = useState([]);
    const [fechaConsulta, setFechaConsulta] = useState(() => new Date().toLocaleDateString('en-CA'));
    const [errorConsulta, setErrorConsulta] = useState('');
    const solicitudActual = useRef(0);
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
        // La consulta se realiza al cambiar la fecha.
    }, []);

    const cargarAsistenciasHoy = useCallback(async (fecha = fechaConsulta) => {
        if (!fecha || fecha > hoyISO) return;
        const solicitud = ++solicitudActual.current;
        setErrorConsulta('');
        try {
            const res = await api.get('/asistencias/fecha', {
                params: { fecha }
            });
            if (solicitud === solicitudActual.current) setAsistenciasHoy(res.data);
        } catch (error) {
            if (solicitud === solicitudActual.current) setErrorConsulta('No se pudieron cargar las asistencias de esa fecha.');
        }
    }, [fechaConsulta, hoyISO]);

    useEffect(() => {
        cargarAsistenciasHoy();
    }, [cargarAsistenciasHoy]);

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
        if (manualFecha > hoyISO || (manualFecha === hoyISO && manualHora > new Date().toTimeString().slice(0, 5))) {
            setManualError('No puedes registrar una asistencia futura');
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
            setFechaConsulta(manualFecha);
            await cargarAsistenciasHoy(manualFecha);
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
            await cargarAsistenciasHoy();
            if (usuarioSeleccionado) cargarHistorial(usuarioSeleccionado);
            setTimeout(() => setManualOk(''), 4000);
        } catch (err) {
            setManualError(err.response?.data?.mensaje || 'Error al eliminar la asistencia');
        }
    };

    const clientesSinSalida = asistenciasHoy.filter(a => !a.fechaSalida);
    const esHoy = fechaConsulta === hoyISO;

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
                        <input type="search" aria-label="Buscar clienta para asistencia manual"
                               placeholder="Buscar por ID o nombre..." value={busquedaCliente}
                               onChange={e => setBusquedaCliente(e.target.value)}
                               onKeyDown={e => {
                                   if (e.key === 'Enter') {
                                       e.preventDefault();
                                       const coincidencias = usuarios.filter(u => u.rol === 'CLIENTE' && coincideCliente(u, busquedaCliente));
                                       if (coincidencias.length === 1) setManualUsuario(String(coincidencias[0].id));
                                   }
                               }}
                               className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-2" />
                        <select
                            value={manualUsuario}
                            onChange={e => setManualUsuario(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Selecciona --</option>
                            {usuarios.filter(u => u.rol === 'CLIENTE' && (coincideCliente(u, busquedaCliente))).map(u => (
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
                    <h3 className="text-xl font-semibold">Resumen del {fechaConsulta === hoyISO ? 'día de hoy' : fechaConsulta}</h3>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{asistenciasHoy.length}</p>
                            <p className="text-gray-400 text-xs">Total entradas</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{clientesSinSalida.length}</p>
                            <p className="text-gray-400 text-xs">{esHoy ? 'En gimnasio ahora' : 'Sin salida registrada'}</p>
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
                    <h3 className="text-xl font-semibold">Asistencias del {fechaConsulta}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <label htmlFor="fecha-asistencias" className="text-gray-300 text-sm">Consultar fecha</label>
                        <input id="fecha-asistencias" type="date" max={hoyISO} value={fechaConsulta}
                               onChange={e => setFechaConsulta(e.target.value)}
                               className="bg-gray-700 text-white px-3 py-1 rounded-lg" />
                        <button onClick={() => setFechaConsulta(hoyISO)} className="bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded-lg text-sm">Hoy</button>
                        <button
                            onClick={cargarAsistenciasHoy}
                            className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-lg transition"
                        >
                            🔄 Actualizar
                        </button>
                    </div>
                </div>
                {errorConsulta && <p className="text-red-400 mb-3">{errorConsulta}</p>}
                {asistenciasHoy.length === 0 ? (
                    <p className="text-gray-400">No hay asistencias registradas en la fecha seleccionada.</p>
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
                <input type="search" aria-label="Buscar historial por ID o nombre"
                       placeholder="Buscar clienta por ID o nombre..." value={busquedaHistorial}
                       onChange={e => setBusquedaHistorial(e.target.value)}
                       onKeyDown={e => {
                           if (e.key === 'Enter') {
                               e.preventDefault();
                               const coincidencias = usuarios.filter(u => u.rol === 'CLIENTE' && coincideCliente(u, busquedaHistorial));
                               if (coincidencias.length === 1) cargarHistorial(String(coincidencias[0].id));
                           }
                       }}
                       className="bg-gray-700 text-white px-4 py-2 rounded-lg mb-3 mr-2" />
                <select
                    value={usuarioSeleccionado}
                    onChange={e => cargarHistorial(e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Selecciona un usuario --</option>
                    {usuarios.filter(u => u.rol === 'CLIENTE' && (coincideCliente(u, busquedaCliente))).map(u => (
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