import { useEffect, useState } from 'react';
import { calcularEdad, esCumpleHoy } from '../utils/fechas';

const API_BASE = `http://${window.location.hostname}:8080`;

export default function BienvenidaCliente({ onVolver }) {
    const [segundos, setSegundos] = useState(12);
    const correo = localStorage.getItem('correo');
    const nombre = localStorage.getItem('nombre');
    const membresia = JSON.parse(localStorage.getItem('membresiaActiva') || 'null');
    // ACTIVA, VENCIDA (tiene historial pero ya venció) o NINGUNA (nunca ha tenido membresía)
    const estado = localStorage.getItem('membresiaEstado') || (membresia ? 'ACTIVA' : 'NINGUNA');
    const foto = localStorage.getItem('fotoUsuario');
    const fechaNacimiento = localStorage.getItem('fechaNacimiento');
    const cumpleHoy = esCumpleHoy(fechaNacimiento);
    const edad = calcularEdad(fechaNacimiento);
    const asistencias = JSON.parse(localStorage.getItem('asistenciasMes') || '[]');

    useEffect(() => {
        const inicio = Date.now();
        const intervalo = setInterval(() => {
            setSegundos(Math.max(0, 12 - Math.floor((Date.now() - inicio) / 1000)));
        }, 200);
        const regreso = setTimeout(() => onVolver(), 12000);//timer
        return () => { clearInterval(intervalo); clearTimeout(regreso); };
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
        <div className="min-h-screen flex items-start justify-center p-3 sm:p-5" style={{ background: '#0a0a0a' }}>
            <div className="w-full max-w-[1500px] rounded-3xl shadow-2xl p-3 sm:p-4 text-center"
                 style={{ background: '#1a1a2e', border: '1px solid rgba(192, 132, 252, 0.2)' }}>

                {/* Regreso visible inmediatamente, sin necesidad de bajar al final */}
                <div className="mb-2 rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-3"
                     style={{ background: 'rgba(192,132,252,0.13)', border: '2px solid rgba(192,132,252,0.65)' }}>
                    <div className="text-white text-lg font-bold" aria-live="polite">
                        ⏱️ Regresando automáticamente en {segundos} segundos
                    </div>
                    <button type="button" onClick={onVolver}
                            className="w-full sm:w-auto rounded-xl px-6 py-3 text-lg font-extrabold text-white shadow-lg transition hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #9333ea, #db2777)' }}>
                        ↩ Volver ahora
                    </button>
                </div>

                {/* Foto o emoji */}
                {foto ? (
                    <img
                        src={`${API_BASE}/api/fotos/${foto}`}
                        alt="foto cliente"
                        className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                        style={{ border: '4px solid rgba(192,132,252,0.6)', boxShadow: '0 0 30px rgba(147,51,234,0.4)' }}
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-3xl mx-auto mb-1"
                         style={{ background: 'linear-gradient(135deg, #9333ea, #f472b6)' }}>
                        💪
                    </div>
                )}

                <h2 className="text-2xl font-bold text-white mb-0">¡Bienvenida!</h2>
                <p className="text-lg mb-1" style={{ color: '#c084fc' }}>{nombre || correo}</p>
                <p className="text-base font-semibold mb-2" style={{ color: '#4ade80' }}>
                    ✅ Asistencia registrada correctamente
                </p>

                {/* Cumpleaños */}
                {cumpleHoy && (
                    <div className="rounded-2xl p-4 mb-4"
                         style={{
                             background: 'linear-gradient(135deg, rgba(147,51,234,0.35), rgba(244,114,182,0.35))',
                             border: '1px solid rgba(244,114,182,0.6)',
                             boxShadow: '0 0 30px rgba(244,114,182,0.25)'
                         }}>
                        <p className="text-4xl mb-2">🎂🎉🎈</p>
                        <p className="text-2xl font-bold text-white">¡Feliz cumpleaños!</p>
                        <p className="text-base mt-1" style={{ color: '#fbcfe8' }}>
                            {edad !== null && edad > 0
                                ? `Hoy cumples ${edad} años. ¡Que tengas un día increíble!`
                                : '¡Que tengas un día increíble!'}
                        </p>
                    </div>
                )}

                {/* Dos columnas: membresía a la izquierda y mes completo a la derecha */}
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.5fr)] gap-3 items-start text-left mb-3">
                    <div className="min-w-0">
                        {/* Membresía */}
                        {membresia && (
                            <div className="rounded-2xl p-3 text-left"
                                 style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(192,132,252,0.2)' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xl font-bold" style={{ color: '#f3f4f6' }}>Membresía</span>
                                    {estado === 'ACTIVA' ? (
                                        <span className="text-base px-4 py-2 rounded-full font-bold"
                                              style={{ background: '#16a34a', color: 'white' }}>Activa ✓</span>
                                    ) : (
                                        <span className="text-base px-4 py-2 rounded-full font-bold"
                                              style={{ background: '#dc2626', color: 'white' }}>Vencida ✗</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    <div className="rounded-xl p-2 sm:p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <p className="text-base mb-1" style={{ color: '#d1d5db' }}>Tipo</p>
                                        <p className="text-white font-bold text-xl break-words">{membresia.tipo}</p>
                                    </div>
                                    <div className="rounded-xl p-2 sm:p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <p className="text-base mb-1" style={{ color: '#d1d5db' }}>{estado === 'VENCIDA' ? 'Venció' : 'Vence'}</p>
                                        <p className="text-white font-bold text-lg sm:text-xl break-words">{membresia.fechaVencimiento}</p>
                                    </div>
                                    <div className="rounded-xl p-2 sm:p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <p className="text-base mb-1" style={{ color: '#d1d5db' }}>Días</p>
                                        <p className="font-bold text-3xl"
                                           style={{ color: estado === 'VENCIDA' ? '#ef4444' : dias <= 7 ? '#fb923c' : '#a855f7' }}>
                                            {estado === 'VENCIDA' ? 0 : dias}
                                        </p>
                                    </div>
                                </div>
                                {estado === 'ACTIVA' && dias <= 7 && dias > 0 && (
                                    <div className="mt-3 px-3 py-2 rounded-xl"
                                         style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)' }}>
                                        <p style={{ color: '#fb923c' }} className="text-base font-semibold">
                                            ⚠️ Tu membresía está por vencer — acércate a recepción para renovarla
                                        </p>
                                    </div>
                                )}
                                {estado === 'VENCIDA' && (
                                    <div className="mt-3 px-3 py-2 rounded-xl"
                                         style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)' }}>
                                        <p style={{ color: '#f87171' }} className="text-base font-semibold">
                                            ⚠️ Tu asistencia quedó registrada, pero tu membresía está vencida — acércate a recepción para renovarla
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {estado === 'NINGUNA' && (
                            <div className="rounded-2xl p-3 text-left"
                                 style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(220,38,38,0.4)' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xl font-bold" style={{ color: '#f3f4f6' }}>Membresía</span>
                                    <span className="text-base px-4 py-2 rounded-full font-bold"
                                          style={{ background: '#dc2626', color: 'white' }}>Sin membresía ✗</span>
                                </div>
                                <p style={{ color: '#f87171' }} className="text-base font-semibold">
                                    ⚠️ Tu asistencia quedó registrada, pero no tienes una membresía — acércate a recepción
                                </p>
                            </div>
                        )}

                    </div>
                    <div className="min-w-0">
                        {/* Calendario */}
                        <div className="rounded-2xl p-3"
                             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(192,132,252,0.2)' }}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-white capitalize">
                                    📅 {nombreMes} {anioActual}
                                </h3>
                                <span className="text-base px-3 py-1 rounded-full font-semibold"
                                      style={{ background: 'rgba(192,132,252,0.2)', color: '#c084fc' }}>
              {diasAsistidos.size} {diasAsistidos.size === 1 ? 'día' : 'días'} asistida
            </span>
                            </div>

                            {/* Días de la semana */}
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {diasSemana.map(d => (
                                    <div key={d} className="text-center text-sm font-medium py-1"
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
                                             className="h-9 sm:h-10 lg:h-[clamp(34px,5vh,49px)] flex items-center justify-center rounded-lg text-base sm:text-lg font-semibold transition"
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

                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full rounded-full h-2 mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{
                            width: `${(segundos / 12) * 100}%`,
                            background: 'linear-gradient(90deg, #9333ea, #f472b6)'
                        }}
                    />
                </div>



            </div>
        </div>
    );
}