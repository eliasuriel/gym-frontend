import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ nombre: '', correo: '', password: '', telefono: '', rol: 'CLIENTE' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const cargarUsuarios = () => {
        api.get('/usuarios')
            .then(res => setUsuarios(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargarUsuarios(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/usuarios', form);
            setSuccess('Usuario creado correctamente');
            setForm({ nombre: '', correo: '', password: '', telefono: '', rol: 'CLIENTE' });
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
        } catch (err) {
            setError('Error al eliminar usuario');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Usuarios</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    {showForm ? 'Cancelar' : '+ Nuevo usuario'}
                </button>
            </div>

            {success && <div className="bg-green-600 text-white p-3 rounded-lg mb-4">{success}</div>}
            {error && <div className="bg-red-600 text-white p-3 rounded-lg mb-4">{error}</div>}

            {showForm && (
                <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Nuevo usuario</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">Nombre</label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={e => setForm({...form, nombre: e.target.value})}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">Correo</label>
                            <input
                                type="email"
                                value={form.correo}
                                onChange={e => setForm({...form, correo: e.target.value})}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">Contraseña</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({...form, password: e.target.value})}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">Teléfono</label>
                            <input
                                type="text"
                                value={form.telefono}
                                onChange={e => setForm({...form, telefono: e.target.value})}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">Rol</label>
                            <select
                                value={form.rol}
                                onChange={e => setForm({...form, rol: e.target.value})}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="CLIENTE">Cliente</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                            >
                                Crear usuario
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-gray-800 rounded-2xl p-6">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Nombre</th>
                        <th className="text-left py-2">Correo</th>
                        <th className="text-left py-2">Teléfono</th>
                        <th className="text-left py-2">Rol</th>
                        <th className="text-left py-2">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="py-4 text-center text-gray-400">Cargando...</td></tr>
                    ) : usuarios.map(u => (
                        <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                            <td className="py-3">{u.nombre}</td>
                            <td className="py-3 text-gray-400">{u.correo}</td>
                            <td className="py-3 text-gray-400">{u.telefono || '—'}</td>
                            <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${u.rol === 'ADMIN' ? 'bg-green-600' : 'bg-blue-600'}`}>
                    {u.rol}
                  </span>
                            </td>
                            <td className="py-3">
                                <button
                                    onClick={() => handleEliminar(u.id, u.nombre)}
                                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg transition"
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