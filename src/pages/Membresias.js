import { useEffect, useState } from 'react';
import api from '../services/api';

const normalizarBusqueda = valor => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const coincideCliente = (u, busqueda) => {
    const termino = normalizarBusqueda(busqueda);
    if (!termino) return true;
    // Los números representan un ID completo, nunca coincidencias parciales.
    if (/^\d+$/.test(termino)) return String(u.id) === String(Number(termino));
    return [u.nombre, u.correo, u.telefono].some(valor => normalizarBusqueda(valor).includes(termino));
};

export default function Membresias() {
    const [usuarios, setUsuarios] = useState([]);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
    const [historial, setHistorial] = useState([]);
    const [membresiaActiva, setMembresiaActiva] = useState(null);
    const [tipo, setTipo] = useState('MENSUAL');
    const [precio, setPrecio] = useState('');
    const hoyISO = new Date().toLocaleDateString('en-CA');   // yyyy-MM-dd en hora local
    const [fechaInicio, setFechaInicio] = useState(hoyISO);
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [editando, setEditando] = useState(null);
    const [fechaEdicion, setFechaEdicion] = useState('');
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
        if (!precio || Number(precio) <= 0) {
            setError('Escribe el precio cobrado (mayor a 0)');
            return;
        }
        if (fechaVencimiento && fechaVencimiento <= fechaInicio) {
            setError('El vencimiento debe ser posterior a la fecha de pago');
            return;
        }
        if (!fechaInicio) {
            setError('Selecciona la fecha de inicio');
            return;
        }
        try {
            await api.post(`/membresias/usuario/${usuarioSeleccionado}`, {
                tipo,
                precio: Number(precio),
                fechaPago: fechaInicio,
                ...(fechaVencimiento ? { fechaVencimiento } : {})
            });
            setPrecio('');
            setFechaInicio(hoyISO);
            setFechaVencimiento('');
            setSuccess('Membresía creada correctamente');
            cargarMembresias(usuarioSeleccionado);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al crear membresía');
        }
    };

    const guardarVencimiento = async (m) => {
        setError('');
        if (!fechaEdicion || fechaEdicion <= m.fechaPago) {
            setError('Selecciona un vencimiento posterior a la fecha de pago');
            return;
        }
        try {
            await api.patch(`/membresias/${m.id}/vencimiento`, { fechaVencimiento: fechaEdicion });
            setEditando(null);
            setSuccess('Vencimiento actualizado correctamente');
            await cargarMembresias(usuarioSeleccionado);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo actualizar el vencimiento');
        }
    };

    const handleEliminar = async (m) => {
        const aviso = m.activa
            ? '\nSi la clienta tiene una membresía anterior que sigue vigente, volverá a quedar activa.'
            : '';
        if (!window.confirm(`¿Eliminar la membresía ${m.tipo} que inició el ${m.fechaPago}?\nEsta acción no se puede deshacer.${aviso}`)) return;
        setError('');
        try {
            await api.delete(`/membresias/${m.id}`);
            setSuccess('Membresía eliminada');
            cargarMembresias(usuarioSeleccionado);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al eliminar la membresía');
        }
    };

    const formatoPrecio = (valor) =>
        valor == null ? '—' : `$${Number(valor).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const totalPagado = historial.reduce((suma, m) => suma + (m.precio ? Number(m.precio) : 0), 0);

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
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Seleccionar usuario</label>
                        <input type="search" aria-label="Buscar clienta para membresía"
                               placeholder="ID o nombre..." value={busquedaCliente}
                               onChange={e => setBusquedaCliente(e.target.value)}
                               onKeyDown={e => {
                                   if (e.key === 'Enter') {
                                       e.preventDefault();
                                       const coincidencias = usuarios.filter(u => u.rol === 'CLIENTE' && coincideCliente(u, busquedaCliente));
                                       if (coincidencias.length === 1) cargarMembresias(String(coincidencias[0].id));
                                   }
                               }}
                               className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <select
                            value={usuarioSeleccionado}
                            onChange={e => cargarMembresias(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Selecciona un usuario --</option>
                            {usuarios.filter(u => u.rol === 'CLIENTE' && (coincideCliente(u, busquedaCliente))).map(u => (
                                <option key={u.id} value={u.id}>#{u.id} — {u.nombre}</option>
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
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Fecha de inicio</label>
                        <input
                            type="date"
                            max={hoyISO}
                            value={fechaInicio}
                            onChange={e => setFechaInicio(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Vencimiento personalizado (opcional)</label>
                        <input type="date" min={fechaInicio || undefined} value={fechaVencimiento}
                               onChange={e => setFechaVencimiento(e.target.value)}
                               className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg" />
                        <p className="text-gray-400 text-xs mt-1">Vacío = cálculo automático (incluye tolerancia de 7 días)</p>
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Precio cobrado ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={precio}
                            onChange={e => setPrecio(e.target.value)}
                            placeholder="Ej. 500"
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Tipo</p>
                                    <span className={`${colorTipo(membresiaActiva.tipo)} text-white text-sm px-3 py-1 rounded-full inline-block mt-1`}>
                    {membresiaActiva.tipo}
                  </span>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Fecha de inicio</p>
                                    <p className="text-white mt-1">{membresiaActiva.fechaPago}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Vencimiento</p>
                                    <p className="text-white mt-1">{membresiaActiva.fechaVencimiento}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Precio pagado</p>
                                    <p className="text-white mt-1">{formatoPrecio(membresiaActiva.precio)}</p>
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
                                    <th className="text-left py-2">Inicio</th>
                                    <th className="text-left py-2">Vencimiento</th>
                                    <th className="text-left py-2">Precio</th>
                                    <th className="text-left py-2">Estado</th>
                                    <th className="text-left py-2">Acciones</th>
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
                                        <td className="py-3 text-gray-400">
                                            {editando === m.id ? (
                                                <input type="date" value={fechaEdicion}
                                                       min={m.fechaPago} onChange={e => setFechaEdicion(e.target.value)}
                                                       className="bg-gray-700 text-white px-2 py-1 rounded" />
                                            ) : m.fechaVencimiento}
                                        </td>
                                        <td className="py-3 text-white">{formatoPrecio(m.precio)}</td>
                                        <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${m.activa ? 'bg-green-600' : 'bg-gray-600'}`}>
                          {m.activa ? 'Activa' : 'Vencida'}
                        </span>
                                        </td>
                                        <td className="py-3">
                                            {editando === m.id ? (
                                                <>
                                                    <button onClick={() => guardarVencimiento(m)}
                                                            className="bg-green-600 text-white text-xs px-3 py-1 rounded-lg mr-2">Guardar</button>
                                                    <button onClick={() => setEditando(null)}
                                                            className="bg-gray-600 text-white text-xs px-3 py-1 rounded-lg mr-2">Cancelar</button>
                                                </>
                                            ) : (
                                                <button onClick={() => { setEditando(m.id); setFechaEdicion(m.fechaVencimiento); }}
                                                        className="bg-purple-600 text-white text-xs px-3 py-1 rounded-lg mr-2">Editar vencimiento</button>
                                            )}
                                            <button
                                                onClick={() => handleEliminar(m)}
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg transition"
                                            >
                                                🗑 Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr className="border-t border-gray-600">
                                    <td colSpan="3" className="py-3 text-gray-400 text-right pr-4">Total pagado</td>
                                    <td colSpan="3" className="py-3 text-white font-bold">{formatoPrecio(totalPagado)}</td>
                                </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}