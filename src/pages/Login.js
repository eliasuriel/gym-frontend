import { useState } from 'react';
import api from '../services/api';

export default function Login({ onLogin }) {
    const [modo, setModo] = useState(null); // null | 'admin' | 'cliente'
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [usuarioId, setUsuarioId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { correo, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('rol', res.data.rol);
            localStorage.setItem('correo', res.data.correo);
            localStorage.setItem('usuarioId', res.data.id);
            onLogin(res.data.rol);
        } catch {
            setError('Correo o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginCliente = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login-id', { usuarioId: parseInt(usuarioId) });

            // Guardar token temporalmente para hacer la siguiente llamada
            const token = res.data.token;
            const id = res.data.id;

            // Verificar membresía activa antes de continuar
            try {
                await api.get(`/membresias/usuario/${id}/activa`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch {
                setError('Tu membresía está vencida. Contacta al administrador para renovarla.');
                setLoading(false);
                return; // No dejamos entrar
            }

            // Membresía activa — guardar sesión y registrar entrada
            localStorage.setItem('token', token);
            localStorage.setItem('rol', res.data.rol);
            localStorage.setItem('correo', res.data.correo);
            localStorage.setItem('usuarioId', id);

            // Registrar entrada automáticamente
            try {
                await api.post(`/asistencias/entrada/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch {
                // Si ya tiene entrada activa, no bloqueamos
            }

            onLogin(res.data.rol);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('ID de cliente no encontrado');
            } else if (!err.response) {
                setError('ID de cliente no encontrado');
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">💪 GymApp</h1>
                    <p className="text-gray-400 mt-2">Bienvenido</p>
                </div>

                {!modo && (
                    <div className="space-y-4">
                        <p className="text-gray-300 text-center mb-6">¿Quién eres?</p>
                        <button
                            onClick={() => setModo('cliente')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition text-lg"
                        >
                            🏋️ Soy Cliente
                        </button>
                        <button
                            onClick={() => setModo('admin')}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-xl transition text-lg"
                        >
                            ⚙️ Soy Administrador
                        </button>
                    </div>
                )}

                {modo === 'cliente' && (
                    <div>
                        <button
                            onClick={() => { setModo(null); setError(''); }}
                            className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition"
                        >
                            ← Volver
                        </button>
                        <h2 className="text-xl font-semibold text-white mb-6 text-center">Ingresa tu ID de cliente</h2>
                        {error && <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleLoginCliente} className="space-y-4">
                            <div>
                                <label className="text-gray-300 text-sm block mb-1">ID de cliente</label>
                                <input
                                    type="number"
                                    value={usuarioId}
                                    onChange={e => setUsuarioId(e.target.value)}
                                    className="w-full bg-gray-700 text-white px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl text-center font-bold"
                                    placeholder="Ej: 1"
                                    required
                                    min="1"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    </div>
                )}

                {modo === 'admin' && (
                    <div>
                        <button
                            onClick={() => { setModo(null); setError(''); }}
                            className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition"
                        >
                            ← Volver
                        </button>
                        <h2 className="text-xl font-semibold text-white mb-6 text-center">Acceso Administrador</h2>
                        {error && <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleLoginAdmin} className="space-y-4">
                            <div>
                                <label className="text-gray-300 text-sm block mb-1">Correo</label>
                                <input
                                    type="email"
                                    value={correo}
                                    onChange={e => setCorreo(e.target.value)}
                                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm block mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                            >
                                {loading ? 'Entrando...' : 'Iniciar sesión'}
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
    
}