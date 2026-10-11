import { useEffect, useState } from 'react';

const API_BASE = `http://${window.location.hostname}:8080`;
//const API_BASE = 'http://localhost:8080';

export default function BienvenidaCliente({ onVolver }) {
    const [segundos, setSegundos] = useState(30);
    const correo = localStorage.getItem('correo');
    const membresia = JSON.parse(localStorage.getItem('membresiaActiva') || 'null');
    const foto = localStorage.getItem('fotoUsuario');
    const asistencias = JSON.parse(localStorage.getItem('asistenciasMes') || '[]');

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

    // Calcular días asistidos este mes
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const parsearFecha = (str) => {
        // Formato: "dd/MM/yyyy HH:mm:ss"
        const [fecha] = str.split(' ');
        const [dia, mes, anio] = fecha.split('/');
        return new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
    };

    const diasAsistidos = new Set(
        asistencias
            .filter(a => {
                const fecha = parsearFecha(a.fechaEntrada);
                return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
            })
            .map(a => parsearFecha(a.fechaEntrada).getDate())
    );

    // Generar calendario del mes
    const primerDia = new Date(anioActual, mesActual, 1).getDay();
    const totalDias = new Date(anioActual, mesActual + 1, 0).getDate();
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const nombreMes = hoy.toLocaleString('es-MX', { month: 'long' });

    const celdas = [];
    for (let i = 0; i < primerDia; i++) celdas.push(null);
    for (let i = 1; i <= totalDias; i++) celdas.push(i);

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a0a0a' }}>
            <div className="w-full max-w-2xl rounded-3xl shadow-2xl p-10 text-center"
                 style={{ background: '#1a1a2e', border: '1px solid rgba(192, 132, 252, 0.2)' }}>

                {/* Contador */}
                <div className="flex justify-end mb-4">
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
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                        style={{ border: '4px solid rgba(192,132,252,0.6)', boxShadow: '0 0 30px rgba(147,51,234,0.4)' }}
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-4"
                         style={{ background: 'linear-gradient(135deg, #9333ea, #f472b6)' }}>
                        💪
                    </div>
                )}

                <h2 className="text-4xl font-bold text-white mb-2">¡Bienvenida!</h2>
                <p className="text-xl mb-6" style={{ color: '#c084fc' }}>{correo}</p>
                <p className="text-lg font-semibold mb-6" style={{ color: '#4ade80' }}>
                    ✅ Asistencia registrada correctamente
                </p>

                {/* Membresía */}
                {membresia && (
                    <div className="rounded-2xl p-5 mb-6 text-left"
                         style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(192,132,252,0.2)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-base font-medium" style={{ color: '#d1d5db' }}>Membresía</span>
                            {dias > 0 ? (
                                <span className="text-sm px-3 py-1 rounded-full font-semibold"
                                      style={{ background: '#16a34a', color: 'white' }}>Activa ✓</span>
                            ) : (
                                <span className="text-sm px-3 py-1 rounded-full font-semibold"
                                      style={{ background: '#dc2626', color: 'white' }}>Vencida ✗</span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>Tipo</p>
                                <p className="text-white font-bold">{membresia.tipo}</p>
                            </div>
                            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>Vence</p>
                                <p className="text-white font-bold text-sm">{membresia.fechaVencimiento}</p>
                            </div>
                            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>Días</p>
                                <p className="font-bold text-xl"
                                   style={{ color: dias <= 7 && dias > 0 ? '#fb923c' : dias <= 0 ? '#ef4444' : '#a855f7' }}>
                                    {dias}
                                </p>
                            </div>
                        </div>
                        {dias <= 7 && dias > 0 && (
                            <div className="mt-3 px-3 py-2 rounded-xl"
                                 style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)' }}>
                                <p style={{ color: '#fb923c' }} className="text-xs font-medium">
                                    ⚠️ Tu membresía está por vencer — acércate a recepción para renovarla
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Calendario */}
                <div className="rounded-2xl p-5 mb-6"
                     style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(192,132,252,0.2)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-white capitalize">
                            📅 {nombreMes} {anioActual}
                        </h3>
                        <span className="text-sm px-3 py-1 rounded-full font-medium"
                              style={{ background: 'rgba(192,132,252,0.2)', color: '#c084fc' }}>
              {diasAsistidos.size} {diasAsistidos.size === 1 ? 'día' : 'días'} asistida
            </span>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {diasSemana.map(d => (
                            <div key={d} className="text-center text-xs font-medium py-1"
                                 style={{ color: '#6b7280' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-1">
                        {celdas.map((dia, i) => {
                            if (!dia) return <div key={`empty-${i}`} />;

                            const esHoy = dia === hoy.getDate();
                            const asistio = diasAsistidos.has(dia);
                            const esFuturo = dia > hoy.getDate();

                            return (
                                <div key={dia}
                                     className="aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition"
                                     style={{
                                         background: asistio
                                             ? 'linear-gradient(135deg, #9333ea, #f472b6)'
                                             : esHoy
                                                 ? 'rgba(192,132,252,0.2)'
                                                 : 'rgba(255,255,255,0.03)',
                                         color: asistio
                                             ? 'white'
                                             : esHoy
                                                 ? '#c084fc'
                                                 : esFuturo
                                                     ? '#374151'
                                                     : '#9ca3af',
                                         border: esHoy && !asistio ? '1px solid rgba(192,132,252,0.5)' : 'none',
                                         fontWeight: esHoy || asistio ? '700' : '400'
                                     }}
                                >
                                    {dia}
                                </div>
                            );
                        })}
                    </div>

                    {/* Leyenda */}
                    <div className="flex items-center justify-center gap-4 mt-4 text-xs" style={{ color: '#6b7280' }}>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded"
                                 style={{ background: 'linear-gradient(135deg, #9333ea, #f472b6)' }} />
                            Asististe
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded"
                                 style={{ border: '1px solid rgba(192,132,252,0.5)', background: 'rgba(192,132,252,0.2)' }} />
                            Hoy
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded"
                                 style={{ background: 'rgba(255,255,255,0.03)' }} />
                            Sin asistencia
                        </div>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full rounded-full h-2 mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{
                            width: `${(segundos / 30) * 100}%`,
                            background: 'linear-gradient(90deg, #9333ea, #f472b6)'
                        }}
                    />
                </div>

                <button
                    onClick={onVolver}
                    className="text-base transition"
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