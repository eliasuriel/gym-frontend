import { useEffect, useState } from 'react';
import api from '../services/api';

export default function MiMembresia() {
    const [membresiaActiva, setMembresiaActiva] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = localStorage.getItem('usuarioId');
        if (id) {
            Promise.allSettled([
                api.get(`/membresias/usuario/${id}/activa`),
                api.get(`/membresias/usuario/${id}/historial`)
            ]).then(([activaRes, historialRes]) => {
                setMembresiaActiva(activaRes.status === 'fulfilled' ? activaRes.value.data : null);
                setHistorial(historialRes.status === 'fulfilled' ? historialRes.value.data : []);
            });
        }
        setLoading(false);
    }, []);

    const colorTipo = (tipo) => {
        const colores = { MENSUAL: 'bg-blue-600', TRIMESTRAL: 'bg-purple-600', SEMESTRAL: 'bg-orange-600', ANUAL: 'bg-green-600' };
        return colores[tipo] || 'bg-gray-600';
    };

    const diasRestantes = (fechaVencimiento) => {
        const hoy = new Date();
        const vence = new Date(fechaVencimiento);
        return Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
    };

    if (loading) return <p className="text-gray-400">Cargando...</p>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Mi Membresía</h2>
            {membresiaActiva ? (
                <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">Membresía activa</h3>
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">Activa ✓</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Tipo</p>
                            <span className={`${colorTipo(membresiaActiva.tipo)} text-white px-3 py-1 rounded-full text-sm`}>
                {membresiaActiva.tipo}
              </span>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Fecha de pago</p>
                            <p className="text-white">{membresiaActiva.fechaPago}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Vencimiento</p>
                            <p className="text-white">{membresiaActiva.fechaVencimiento}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Días restantes</p>
                            <p className={`text-2xl font-bold ${diasRestantes(membresiaActiva.fechaVencimiento) <= 7 ? 'text-red-400' : 'text-green-400'}`}>
                                {diasRestantes(membresiaActiva.fechaVencimiento)}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-2xl p-6 mb-6 text-center">
                    <p className="text-gray-400 text-lg">No tienes una membresía activa.</p>
                    <p className="text-gray-500 text-sm mt-2">Contacta al administrador para renovar.</p>
                </div>
            )}
            <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Historial</h3>
                {historial.length === 0 ? (
                    <p className="text-gray-400">No hay membresías registradas.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                            <th className="text-left py-2">Tipo</th>
                            <th className="text-left py-2">Fecha pago</th>
                            <th className="text-left py-2">Vencimiento</th>
                            <th className="text-left py-2">Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {historial.map(m => (
                            <tr key={m.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                <td className="py-3">
                                    <span className={`${colorTipo(m.tipo)} text-white text-xs px-2 py-1 rounded-full`}>{m.tipo}</span>
                                </td>
                                <td className="py-3 text-gray-400">{m.fechaPago}</td>
                                <td className="py-3 text-gray-400">{m.fechaVencimiento}</td>
                                <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${m.activa ? 'bg-green-600' : 'bg-gray-600'}`}>
                      {m.activa ? 'Activa' : 'Vencida'}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}