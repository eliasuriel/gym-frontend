import { useState } from 'react';
import api from '../services/api';
import BienvenidaCliente from './BienvenidaCliente';
import logo from '../assets/logo.png';

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

            localStorage.setItem('membresiaActiva', JSON.stringify(membresiaData));
            localStorage.setItem('correo', usuarioEncontrado.correo);

            try {
                await api.post(`/asistencias/entrada/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch {}

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
        <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>

            {/* Panel izquierdo — identidad del gimnasio */}
            <div
                className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1047 50%, #1a0a2e 100%)' }}
            >
                {/* Círculos decorativos */}
                <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-20"
                     style={{ background: 'radial-gradient(circle, #c084fc, transparent)' }} />
                <div className="absolute bottom-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-15"
                     style={{ background: 'radial-gradient(circle, #f472b6, transparent)' }} />
                <div className="absolute top-1/3 right-[-50px] w-56 h-56 rounded-full opacity-10"
                     style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

                <div className="relative z-10 text-center">
                    {/* Logo */}
                    <img src={logo} alt="Lady's Gym & CareSpa" className="w-72 mx-auto mb-8 drop-shadow-2xl" />

                    <p className="text-purple-200 text-lg mb-12 opacity-80">
                        Tu bienestar es nuestra prioridad
                    </p>

                    {/* Features */}
                    <div className="space-y-3 text-left">
                        {[
                            { icon: '🎫', text: 'Control de membresías' },
                            { icon: '✅', text: 'Registro de asistencias' },
                            { icon: '📊', text: 'Seguimiento corporal' },
                            { icon: '💆‍♀️', text: 'Servicios de CareSpa' },
                        ].map(({ icon, text }) => (
                            <div
                                key={text}
                                className="flex items-center gap-3 rounded-xl px-5 py-3"
                                style={{ background: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.2)' }}
                            >
                                <span className="text-xl">{icon}</span>
                                <span className="text-purple-100 text-sm font-medium">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel derecho — formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">

                    {/* Logo mobile */}
                    <div className="lg:hidden text-center mb-10">
                        <img src={logo} alt="Lady's Gym" className="w-48 mx-auto" />
                    </div>

                    {/* Pantalla de selección */}
                    {!modo && !usuarioEncontrado && (
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Bienvenida</h2>
                            <p className="text-gray-500 mb-10">¿Cómo deseas ingresar?</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setModo('cliente')}
                                    className="w-full text-white font-bold py-5 rounded-2xl transition text-lg flex items-center justify-center gap-3"
                                    style={{
                                        background: 'linear-gradient(135deg, #9333ea, #c084fc)',
                                        boxShadow: '0 8px 32px rgba(147, 51, 234, 0.4)'
                                    }}
                                >
                                    <span className="text-2xl">🏋️‍♀️</span>
                                    Soy Clienta
                                </button>
                                <button
                                    onClick={() => setModo('admin')}
                                    className="w-full font-semibold py-5 rounded-2xl transition text-lg flex items-center justify-center gap-3"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(192, 132, 252, 0.3)',
                                        color: '#c084fc'
                                    }}
                                >
                                    <span className="text-2xl">⚙️</span>
                                    Soy Administrador
                                </button>
                            </div>

                            <p className="text-center text-gray-700 text-xs mt-10">
                                Lady's Gym & CareSpa © {new Date().getFullYear()}
                            </p>
                        </div>
                    )}

                    {/* Ingreso de ID */}
                    {modo === 'cliente' && !usuarioEncontrado && (
                        <div>
                            <button
                                onClick={() => { setModo(null); setError(''); }}
                                className="text-gray-600 hover:text-purple-400 text-sm mb-8 flex items-center gap-2 transition"
                            >
                                ← Volver
                            </button>
                            <h2 className="text-3xl font-bold text-white mb-2">Ingresa tu ID</h2>
                            <p className="text-gray-500 mb-8">Escribe el número de clienta asignado</p>

                            {error && (
                                <div className="border text-sm p-4 rounded-xl mb-6"
                                     style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleBuscarCliente} className="space-y-4">
                                <input
                                    type="number"
                                    value={usuarioId}
                                    onChange={e => setUsuarioId(e.target.value)}
                                    className="w-full text-white px-6 py-5 rounded-2xl text-4xl text-center font-black tracking-widest focus:outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(192, 132, 252, 0.3)',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#c084fc'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(192, 132, 252, 0.3)'}
                                    placeholder="000"
                                    required
                                    min="1"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full text-white font-bold py-4 rounded-2xl transition text-lg disabled:opacity-50"
                                    style={{
                                        background: 'linear-gradient(135deg, #9333ea, #c084fc)',
                                        boxShadow: '0 8px 32px rgba(147, 51, 234, 0.4)'
                                    }}
                                >
                                    {loading ? 'Buscando...' : 'Continuar →'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Confirmación de identidad */}
                    {usuarioEncontrado && (
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">¿Eres tú?</h2>
                            <p className="text-gray-500 mb-8">Confirma tu identidad para registrar tu entrada</p>

                            {error && (
                                <div className="border text-sm p-4 rounded-xl mb-6"
                                     style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}>
                                    {error}
                                </div>
                            )}

                            <div className="rounded-2xl p-6 mb-6 flex items-center gap-4"
                                 style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black text-white flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #9333ea, #f472b6)' }}
                                >
                                    {inicial(usuarioEncontrado.correo)}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">{usuarioEncontrado.correo}</p>
                                    <p className="text-gray-500 text-sm">ID: {usuarioEncontrado.id}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleConfirmar}
                                    disabled={loading}
                                    className="w-full text-white font-bold py-4 rounded-2xl transition text-lg disabled:opacity-50"
                                    style={{
                                        background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                                        boxShadow: '0 8px 32px rgba(22, 163, 74, 0.3)'
                                    }}
                                >
                                    {loading ? 'Registrando entrada...' : '✅ Sí, soy yo — Entrar'}
                                </button>
                                <button
                                    onClick={handleNoSoyYo}
                                    className="w-full py-4 rounded-2xl transition font-medium"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#6b7280'
                                    }}
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
                                className="text-gray-600 hover:text-purple-400 text-sm mb-8 flex items-center gap-2 transition"
                            >
                                ← Volver
                            </button>
                            <h2 className="text-3xl font-bold text-white mb-2">Administrador</h2>
                            <p className="text-gray-500 mb-8">Ingresa con tus credenciales</p>

                            {error && (
                                <div className="border text-sm p-4 rounded-xl mb-6"
                                     style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLoginAdmin} className="space-y-4">
                                <div>
                                    <label className="text-gray-500 text-sm block mb-2">Correo electrónico</label>
                                    <input
                                        type="email"
                                        value={correo}
                                        onChange={e => setCorreo(e.target.value)}
                                        className="w-full text-white px-5 py-4 rounded-2xl focus:outline-none"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(192, 132, 252, 0.3)',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#c084fc'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(192, 132, 252, 0.3)'}
                                        placeholder="admin@ladysgym.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-500 text-sm block mb-2">Contraseña</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full text-white px-5 py-4 rounded-2xl focus:outline-none"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(192, 132, 252, 0.3)',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#c084fc'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(192, 132, 252, 0.3)'}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full font-bold py-4 rounded-2xl transition disabled:opacity-50"
                                    style={{
                                        background: 'rgba(192, 132, 252, 0.15)',
                                        border: '1px solid rgba(192, 132, 252, 0.4)',
                                        color: '#c084fc'
                                    }}
                                >
                                    {loading ? 'Entrando...' : 'Iniciar sesión →'}
                                </button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}