import { useEffect, useState } from 'react';
import api from '../services/api';

// Asegúrate de definir la URL base de tus archivos estáticos
const API_BASE = 'http://localhost:8080/api';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ id: '', nombre: '', correo: '', password: '', telefono: '', rol: 'CLIENTE' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [subiendoFoto, setSubiendoFoto] = useState(null);

    const cargarUsuarios = () => {
        api.get('/usuarios')
            .then(res => setUsuarios(res.data))
            .catch(() => setError('Error al cargar los usuarios'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargarUsuarios(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/usuarios', { ...form, id: form.id ? Number(form.id) : null });
            setSuccess('Usuario creado correctamente');
            setForm({ id: '', nombre: '', correo: '', password: '', telefono: '', rol: 'CLIENTE' });
            setShowForm(false);
            cargarUsuarios();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al crear usuario');
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar a ${nombre}?`)) return;
        try {
            await api.delete(`/usuarios/${id}`);
            cargarUsuarios();
        } catch {
            setError('Error al eliminar usuario');
        }
    };

    const handleFoto = async (usuarioId, archivo) => {
        if (!archivo) return;
        setSubiendoFoto(usuarioId);
        setError('');
        try {
            const formData = new FormData();
            formData.append('foto', archivo);
            await api.post(`/fotos/usuario/${usuarioId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('Foto actualizada correctamente');
            cargarUsuarios();
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Error al subir la foto');
        } finally {
            setSubiendoFoto(null);
        }
    };

    const handleEliminarFoto = async (usuarioId) => {
        setError('');
        try {
            await api.delete(`/fotos/usuario/${usuarioId}`);
            setSuccess('Foto eliminada correctamente');
            cargarUsuarios(); // Se agregó la recarga de lista aquí
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Error al eliminar la foto');
        }
    };

    const FotoUsuario = ({ usuario, size = 'md' }) => {
        const dim = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm';

        if (usuario.foto) {
            return (
                <img
                    // Verifica si tu backend expone la imagen con o sin /api/
                    src={`${API_BASE}/fotos/${usuario.foto}`}
                    alt={usuario.nombre}
                    className={`${dim} rounded-full object-cover flex-shrink-0`}
                    style={{ border: '2px solid rgba(192,132,252,0.4)' }}
                    onError={(e) => {
                        // Fallback si la imagen no carga en el servidor
                        e.target.style.display = 'none';
                    }}
                />
            );
        }
        return (
            <div className={`${dim} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
                 style={{ background: 'linear-gradient(135deg, #9333ea, #f472b6)' }}>
                {usuario.nombre?.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Usuarias</h2>
                    <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
                        {usuarios.filter(u => u.rol?.toUpperCase() === 'CLIENTE').length} clientas registradas
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-white font-semibold px-5 py-2 rounded-xl transition"
                    style={{ background: 'linear-gradient(135deg, #9333ea, #c084fc)' }}
                >
                    {showForm ? 'Cancelar' : '+ Nueva clienta'}
                </button>
            </div>

            {success && (
                <div className="p-3 rounded-xl mb-4 text-sm font-medium"
                     style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
                    {success}
                </div>
            )}
            {error && (
                <div className="p-3 rounded-xl mb-4 text-sm font-medium"
                     style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                    {error}
                </div>
            )}

            {showForm && (
                <div className="rounded-2xl p-6 mb-6"
                     style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,132,252,0.15)' }}>
                    <h3 className="text-xl font-semibold mb-4 text-white">Nueva clienta</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'ID', key: 'id', type: 'number', placeholder: 'Ej. 1001 (vacío = automático)' },
                            { label: 'Nombre', key: 'nombre', type: 'text', placeholder: 'Nombre completo' },
                            { label: 'Correo', key: 'correo', type: 'email', placeholder: 'correo@ejemplo.com' },
                            { label: 'Contraseña', key: 'password', type: 'password', placeholder: '••••••••' },
                            { label: 'Teléfono', key: 'telefono', type: 'text', placeholder: '3310000000' },
                        ].map(({ label, key, type, placeholder }) => (
                            <div key={key}>
                                <label className="text-sm block mb-1" style={{ color: '#9ca3af' }}>{label}</label>
                                <input
                                    type={type}
                                    value={form[key]}
                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    placeholder={placeholder}
                                    className="w-full text-white px-4 py-2 rounded-xl focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(192,132,252,0.2)' }}
                                    required={key !== 'telefono' && key !== 'id'}
                                />
                            </div>
                        ))}
                        <div>
                            <label className="text-sm block mb-1" style={{ color: '#9ca3af' }}>Rol</label>
                            <select
                                value={form.rol}
                                onChange={e => setForm({ ...form, rol: e.target.value })}
                                className="w-full text-white px-4 py-2 rounded-xl focus:outline-none"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(192,132,252,0.2)' }}
                            >
                                <option value="CLIENTE">Cliente</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full text-white font-semibold py-2 rounded-xl transition"
                                style={{ background: 'linear-gradient(135deg, #9333ea, #c084fc)' }}
                            >
                                Crear usuaria
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-2xl p-6"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,132,252,0.15)' }}>
                <table className="w-full text-sm">
                    <thead>
                    <tr style={{ color: '#9ca3af', borderBottom: '1px solid rgba(192,132,252,0.15)' }}>
                        <th className="text-left py-3">Foto</th>
                        <th className="text-left py-3">ID</th>
                        <th className="text-left py-3">Nombre</th>
                        <th className="text-left py-3">Correo</th>
                        <th className="text-left py-3">Teléfono</th>
                        <th className="text-left py-3">Rol</th>
                        <th className="text-left py-3">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="py-8 text-center" style={{ color: '#9ca3af' }}>
                                Cargando...
                            </td>
                        </tr>
                    ) : usuarios.map(u => (
                        <tr key={u.id}
                            className="transition"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <td className="py-3">
                                <div className="flex items-center gap-2">
                                    <FotoUsuario usuario={u} size="lg" />
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => handleFoto(u.id, e.target.files[0])}
                                        />
                                        <span className="text-xs px-2 py-1 rounded-lg transition cursor-pointer"
                                              style={{ background: 'rgba(192,132,252,0.15)', color: '#c084fc' }}>
                                            {subiendoFoto === u.id ? '...' : u.foto ? '↺' : '+'}
                                        </span>
                                    </label>
                                    {u.foto && (
                                        <button
                                            onClick={() => handleEliminarFoto(u.id)}
                                            className="text-xs px-2 py-1 rounded-lg transition"
                                            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </td>

                            <td className="py-3 font-mono" style={{ color: '#c084fc' }}>{u.id}</td>
                            <td className="py-3 text-white font-medium">{u.nombre}</td>
                            <td className="py-3" style={{ color: '#9ca3af' }}>{u.correo}</td>
                            <td className="py-3" style={{ color: '#9ca3af' }}>{u.telefono || '—'}</td>
                            <td className="py-3">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                                      style={u.rol?.toUpperCase() === 'ADMIN'
                                          ? { background: 'rgba(244,114,182,0.2)', color: '#f472b6' }
                                          : { background: 'rgba(192,132,252,0.2)', color: '#c084fc' }}>
                                  {u.rol}
                                </span>
                            </td>
                            <td className="py-3">
                                <button
                                    onClick={() => handleEliminar(u.id, u.nombre)}
                                    className="text-xs px-3 py-1 rounded-lg transition"
                                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}