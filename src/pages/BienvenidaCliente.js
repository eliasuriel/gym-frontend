import { useEffect, useState } from 'react';

export default function BienvenidaCliente({ onVolver }) {
    const [segundos, setSegundos] = useState(20);
    const correo = localStorage.getItem('correo');
    const membresia = JSON.parse(localStorage.getItem('membresiaActiva') || 'null');

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

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
            <div className="bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl p-12 text-center">

                {/* Contador */}
                <div className="flex justify-end mb-6">
          <span className="bg-gray-700 text-gray-300 text-lg px-4 py-2 rounded-full">
            Volviendo en {segundos}s
          </span>
                </div>

                {/* Icono y bienvenida */}
                <div className="w-28 h-28 rounded-full bg-green-600 flex items-center justify-center text-6xl mx-auto mb-6">
                    💪
                </div>
                <h2 className="text-5xl font-bold text-white mb-3">¡Bienvenido!</h2>
                <p className="text-gray-400 text-2xl mb-10">{correo}</p>

                {/* Info membresía */}
                {membresia ? (
                    <div className="bg-gray-700 rounded-2xl p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-gray-300 text-xl font-medium">Membresía</span>
                            <span className="bg-green-600 text-white text-lg px-4 py-2 rounded-full font-semibold">
                Activa ✓
              </span>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-left mb-6">
                            <div className="bg-gray-600 rounded-xl p-5">
                                <p className="text-gray-400 text-base mb-2">Tipo</p>
                                <p className="text-white text-2xl font-bold">{membresia.tipo}</p>
                            </div>
                            <div className="bg-gray-600 rounded-xl p-5">
                                <p className="text-gray-400 text-base mb-2">Vence</p>
                                <p className="text-white text-2xl font-bold">{membresia.fechaVencimiento}</p>
                            </div>
                        </div>
                        <div className="bg-gray-600 rounded-xl p-6">
                            <p className="text-gray-400 text-lg mb-2">Días restantes</p>
                            <p className={`text-7xl font-bold ${diasRestantes(membresia.fechaVencimiento) <= 7 ? 'text-red-400' : 'text-green-400'}`}>
                                {diasRestantes(membresia.fechaVencimiento)}
                            </p>
                            <p className="text-gray-400 text-lg mt-2">días</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-700 rounded-2xl p-8 mb-8">
                        <p className="text-gray-400 text-xl">Sin información de membresía</p>
                    </div>
                )}

                <p className="text-green-400 text-2xl font-semibold mb-8">✅ Asistencia registrada correctamente</p>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
                    <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(segundos / 30) * 100}%` }}
                    />
                </div>

                <button
                    onClick={onVolver}
                    className="text-gray-400 hover:text-white text-lg transition"
                >
                    Volver ahora →
                </button>
            </div>
        </div>
    );
}