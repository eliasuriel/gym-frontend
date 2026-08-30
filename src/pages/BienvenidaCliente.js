import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:8080';

export default function BienvenidaCliente({ onVolver }) {
    const [segundos, setSegundos] = useState(30);
    const correo = localStorage.getItem('correo');
    const membresia = JSON.parse(localStorage.getItem('membresiaActiva') || 'null');
    const foto = localStorage.getItem('fotoUsuario');

    useEffect(() => {
        const intervalo = setInterval(() => {
            setSegundos(s => {
                if (s <= 1) {
                    clearInterval(intervalo);
                    onVolver();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(intervalo);
    }, [onVolver]);

    const diasRestantes = (fechaVencimiento) => {
        const hoy = new Date();
        const vence = new Date(fechaVencimiento);
        return Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
    };

    const dias = membresia ? diasRestantes(membresia.fechaVencimiento) : 0;

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a0a0a' }}>
            <div className="w-full max-w-2xl rounded-3xl shadow-2xl p-12 text-center"
                 style={{ background: '#1a1a2e', border: '1px solid rgba(192, 132, 252, 0.2)' }}>

                {/* Contador */}
                <div className="flex justify-end mb-6">
          <span className="text-sm px-4 py-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
            Volviendo en {segundos}s
          </span>
                </div>

                {/* Foto o emoji */}
                {foto ? (
                    <img
                        src={`${API_BASE}/api/fotos/${foto}`}
                        alt="foto cliente"
                        className="w-28 h-28 rounded-full object-cover mx-auto mb-6"
                        style={{
                            border: '4px solid rgba(192,132,252,0.6)',
                            boxShadow: '0 0 30px rgba(147,51,234,0.4)'
                        }}
                    />
                ) : (
                    <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl mx-auto mb-6"
                         style={{ background: 'linear-gradient(135deg, #9333ea, #f472b6)' }}>
                        💪
                    </div>
                )}

                <h2 className="text-5xl font-bold text-white mb-3">¡Bienvenida!</h2>
                <p className="text-2xl mb-10" style={{ color: '#c084fc' }}>{correo}</p>

                {/* Info membresía */}
                {membresia ? (
                    <div className="rounded-2xl p-8 mb-8"
                         style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(192,132,252,0.2)' }}>

                        <div className="flex items-center justify-between mb-6">
                            <span className="text-xl font-medium" style={{ color: '#d1d5db' }}>Membresía</span>
                            {dias > 0 ? (
                                <span className="text-lg px-4 py-2 rounded-full font-semibold"
                                      style={{ background: '#16a34a', color: 'white' }}>
                  Activa ✓
                </span>
                            ) : (
                                <span className="text-lg px-4 py-2 rounded-full font-semibold"
                                      style={{ background: '#dc2626', color: 'white' }}>
                  Vencida ✗
                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-left mb-6">
                            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <p className="text-base mb-2" style={{ color: '#9ca3af' }}>Tipo</p>
                                <p className="text-white text-2xl font-bold">{membresia.tipo}</p>
                            </div>
                            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <p className="text-base mb-2" style={{ color: '#9ca3af' }}>Vence</p>
                                <p className="text-white text-2xl font-bold">{membresia.fechaVencimiento}</p>
                            </div>
                        </div>

                        <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <p className="text-lg mb-2" style={{ color: '#9ca3af' }}>Días restantes</p>
                            <p className="text-7xl font-bold"
                               style={{ color: dias <= 7 && dias > 0 ? '#fb923c' : dias <= 0 ? '#ef4444' : '#a855f7' }}>
                                {dias}
                            </p>
                            <p className="text-lg mt-2" style={{ color: '#6b7280' }}>días</p>

                            {dias <= 7 && dias > 0 && (
                                <div className="mt-4 px-4 py-3 rounded-xl"
                                     style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)' }}>
                                    <p style={{ color: '#fb923c' }} className="text-sm font-medium">
                                        ⚠️ Tu membresía está por vencer — acércate a recepción para renovarla
                                    </p>
                                </div>
                            )}

                            {dias <= 0 && (
                                <div className="mt-4 px-4 py-3 rounded-xl"
                                     style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                    <p style={{ color: '#f87171' }} className="text-sm font-medium">
                                        ❌ Tu membresía está vencida — acércate a recepción para renovarla
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl p-8 mb-8"
                         style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(192,132,252,0.2)' }}>
                        <p style={{ color: '#9ca3af' }} className="text-xl">Sin información de membresía</p>
                    </div>
                )}

                <p className="text-2xl font-semibold mb-8" style={{ color: '#4ade80' }}>
                    ✅ Asistencia registrada correctamente
                </p>

                {/* Barra de progreso */}
                <div className="w-full rounded-full h-3 mb-6" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                        className="h-3 rounded-full transition-all duration-1000"
                        style={{
                            width: `${(segundos / 30) * 100}%`,
                            background: 'linear-gradient(90deg, #9333ea, #f472b6)'
                        }}
                    />
                </div>

                <button
                    onClick={onVolver}
                    className="text-lg transition"
                    style={{ color: '#6b7280' }}
                    onMouseEnter={e => e.target.style.color = '#c084fc'}
                    onMouseLeave={e => e.target.style.color = '#6b7280'}
                >
                    Volver ahora →
                </button>

            </div>
        </div>
    );
}