import { useState } from 'react';
import api from '../services/api';
import BienvenidaCliente from './BienvenidaCliente';

export default function Login({ onLogin }) {
    const [modo, setModo] = useState(null);
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [usuarioId, setUsuarioId] = useState('');
    const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
    const [tokenTemporal, setTokenTemporal] = useState(null);
    const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
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

    const handleBuscarCliente = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login-id', { usuarioId: parseInt(usuarioId) });
            setUsuarioEncontrado(res.data);
            setTokenTemporal(res.data.token);
        } catch {
            setError('ID de cliente no encontrado');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmar = async () => {
        setLoading(true);
        setError('');
        try {
            const id = usuarioEncontrado.id;
            const token = tokenTemporal;

            // Verificar membresía activa
            let membresiaData = null;
            try {
                const membresiaRes = await api.get(`/membresias/usuario/${id}/activa`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                membresiaData = membresiaRes.data;
            } catch {
                setError('Tu membresía está vencida. Contacta al administrador para renovarla.');
                setUsuarioEncontrado(null);
                setTokenTemporal(null);
                setLoading(false);
                return;
            }

            // Guardar membresía para mostrar en bienvenida
            localStorage.setItem('membresiaActiva', JSON.stringify(membresiaData));
            localStorage.setItem('correo', usuarioEncontrado.correo);

            // Registrar entrada
            try {
                await api.post(`/asistencias/entrada/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch {
                // Si ya tiene entrada activa, no bloqueamos
            }

            setMostrarBienvenida(true);
        } finally {
            setLoading(false);
        }
    };

    const handleNoSoyYo = () => {
        setUsuarioEncontrado(null);
        setTokenTemporal(null);
        setUsuarioId('');
        setError('');
    };

    const handleVolverAInicio = () => {
        setMostrarBienvenida(false);
        setUsuarioEncontrado(null);
        setTokenTemporal(null);
        setUsuarioId('');
        setError('');
        localStorage.removeItem('membresiaActiva');
        localStorage.removeItem('correo');
    };

    const inicial = (correo) => correo ? correo.charAt(0).toUpperCase() : '?';

    if (mostrarBienvenida) {
        return <BienvenidaCliente onVolver={handleVolverAInicio} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">💪 GymApp</h1>
                    <p className="text-gray-400 mt-2">Bienvenido</p>
                </div>

                {/* Pantalla de selección */}
                {!modo && !usuarioEncontrado && (
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

                {/* Ingreso de ID */}
                {modo === 'cliente' && !usuarioEncontrado && (
                    <div>
                        <button
                            onClick={() => { setModo(null); setError(''); }}
                            className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition"
                        >
                            ← Volver
                        </button>
                        <h2 className="text-xl font-semibold text-white mb-6 text-center">
                            Ingresa tu ID de cliente
                        </h2>
                        {error && (
                            <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">{error}</div>
                        )}
                        <form onSubmit={handleBuscarCliente} className="space-y-4">
                            <input
                                type="number"
                                value={usuarioId}
                                onChange={e => setUsuarioId(e.target.value)}
                                className="w-full bg-gray-700 text-white px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-3xl text-center font-bold"
                                placeholder="Ej: 1"
                                required
                                min="1"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                            >
                                {loading ? 'Buscando...' : 'Continuar'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Confirmación de identidad */}
                {usuarioEncontrado && (
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4">
                            {inicial(usuarioEncontrado.correo)}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">¿Eres tú?</p>
                        <p className="text-2xl font-bold text-white mb-1">{usuarioEncontrado.correo}</p>
                        <p className="text-gray-400 text-sm mb-8">ID: {usuarioEncontrado.id}</p>

                        {error && (
                            <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">{error}</div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={handleConfirmar}
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition text-lg disabled:opacity-50"
                            >
                                {loading ? 'Registrando entrada...' : '✅ Sí, soy yo'}
                            </button>
                            <button
                                onClick={handleNoSoyYo}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition"
                            >
                                ❌ No, no soy yo
                            </button>
                        </div>
                    </div>
                )}

                {/* Login Admin */}
                {modo === 'admin' && (
                    <div>
                        <button
                            onClick={() => { setModo(null); setError(''); }}
                            className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition"
                        >
                            ← Volver
                        </button>
                        <h2 className="text-xl font-semibold text-white mb-6 text-center">
                            Acceso Administrador
                        </h2>
                        {error && (
                            <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">{error}</div>
                        )}
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