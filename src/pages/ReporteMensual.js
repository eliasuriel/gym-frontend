import { useState } from 'react';
import api from '../services/api';

export default function ReporteMensual() {
    const [reporte, setReporte] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generado, setGenerado] = useState(false);

    const handleGenerar = async () => {
        setLoading(true);
        try {
            const res = await api.get('/datos-cuerpo/reporte/mensual');
            setReporte(res.data);
            setGenerado(true);
        } catch {
            console.error('Error al generar reporte');
        } finally {
            setLoading(false);
        }
    };

    const difColor = (valor, invertido = false) => {
        if (valor == null) return 'text-gray-400';
        if (valor === 0) return 'text-gray-400';
        const bajo = valor < 0;
        if (invertido) return bajo ? 'text-red-400' : 'text-green-400';
        return bajo ? 'text-green-400' : 'text-red-400';
    };

    const difTexto = (valor, unidad = '') => {
        if (valor == null) return '—';
        const signo = valor > 0 ? '+' : '';
        return `${signo}${valor} ${unidad}`;
    };

    const medallaColor = (i) => {
        if (i === 0) return 'bg-yellow-500';
        if (i === 1) return 'bg-gray-400';
        if (i === 2) return 'bg-amber-600';
        return 'bg-gray-700';
    };

    const medalla = (i) => {
        if (i === 0) return '🥇';
        if (i === 1) return '🥈';
        if (i === 2) return '🥉';
        return `#${i + 1}`;
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2">Reporte Mensual</h2>
            <p className="text-gray-400 mb-8">Clientes con mayor progreso en el último mes</p>

            {/* Botón generar */}
            <div className="bg-gray-800 rounded-2xl p-8 mb-6 text-center">
                <p className="text-gray-400 mb-6 text-lg">
                    Genera el ranking de clientes que más bajaron de peso y medidas en los últimos 30 días.
                </p>
                <button
                    onClick={handleGenerar}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-12 py-4 rounded-2xl transition disabled:opacity-50"
                >
                    {loading ? '⏳ Generando...' : '📊 Generar reporte'}
                </button>
            </div>

            {generado && (
                <>
                    {reporte.length === 0 ? (
                        <div className="bg-gray-800 rounded-2xl p-8 text-center">
                            <p className="text-gray-400 text-lg">No hay clientes con 2 o más registros en el último mes.</p>
                            <p className="text-gray-500 text-sm mt-2">Se necesitan al menos 2 mediciones por cliente para calcular el progreso.</p>
                        </div>
                    ) : (
                        <>
                            {/* Podio top 3 */}
                            {reporte.length >= 1 && (
                                <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                                    <h3 className="text-xl font-semibold mb-6 text-center">🏆 Top clientes del mes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {reporte.slice(0, 3).map((c, i) => (
                                            <div key={c.usuarioId} className={`rounded-2xl p-6 text-center ${i === 0 ? 'bg-yellow-900 border border-yellow-500' : i === 1 ? 'bg-gray-700 border border-gray-500' : 'bg-amber-900 border border-amber-600'}`}>
                                                <div className={`w-14 h-14 rounded-full ${medallaColor(i)} flex items-center justify-center text-2xl mx-auto mb-3`}>
                                                    {medalla(i)}
                                                </div>
                                                <p className="text-white font-bold text-lg">{c.nombre}</p>
                                                <p className="text-gray-400 text-sm mb-4">{c.correo}</p>
                                                {c.difPeso != null && (
                                                    <div className="bg-black bg-opacity-20 rounded-xl p-3">
                                                        <p className="text-gray-400 text-xs mb-1">Peso</p>
                                                        <p className={`text-2xl font-bold ${difColor(c.difPeso)}`}>
                                                            {difTexto(c.difPeso, 'kg')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tabla completa */}
                            <div className="bg-gray-800 rounded-2xl p-6">
                                <h3 className="text-xl font-semibold mb-4">Ranking completo</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                        <tr className="text-gray-400 border-b border-gray-700">
                                            <th className="text-left py-2 pr-4">#</th>
                                            <th className="text-left py-2 pr-4">Cliente</th>
                                            <th className="text-left py-2 pr-4">Período</th>
                                            <th className="text-left py-2 pr-4">Registros</th>
                                            <th className="text-left py-2 pr-4">Peso</th>
                                            <th className="text-left py-2 pr-4">Grasa %</th>
                                            <th className="text-left py-2 pr-4">Músculo</th>
                                            <th className="text-left py-2 pr-4">Cintura</th>
                                            <th className="text-left py-2 pr-4">Cadera</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {reporte.map((c, i) => (
                                            <tr key={c.usuarioId} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                                <td className="py-3 pr-4">
                            <span className={`w-7 h-7 rounded-full ${medallaColor(i)} flex items-center justify-center text-xs font-bold text-white`}>
                              {i < 3 ? medalla(i) : i + 1}
                            </span>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <p className="text-white font-medium">{c.nombre}</p>
                                                    <p className="text-gray-500 text-xs">{c.correo}</p>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-400 text-xs">
                                                    {c.fechaInicio} → {c.fechaFin}
                                                </td>
                                                <td className="py-3 pr-4 text-center">
                            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                              {c.registros}
                            </span>
                                                </td>
                                                <td className={`py-3 pr-4 font-semibold ${difColor(c.difPeso)}`}>
                                                    {difTexto(c.difPeso, 'kg')}
                                                </td>
                                                <td className={`py-3 pr-4 font-semibold ${difColor(c.difGrasa)}`}>
                                                    {difTexto(c.difGrasa, '%')}
                                                </td>
                                                <td className={`py-3 pr-4 font-semibold ${difColor(c.difMusculo, true)}`}>
                                                    {difTexto(c.difMusculo, 'kg')}
                                                </td>
                                                <td className={`py-3 pr-4 font-semibold ${difColor(c.difCintura)}`}>
                                                    {difTexto(c.difCintura, 'cm')}
                                                </td>
                                                <td className={`py-3 pr-4 font-semibold ${difColor(c.difCadera)}`}>
                                                    {difTexto(c.difCadera, 'cm')}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-700 flex gap-4 text-xs text-gray-500">
                                    <span className="text-green-400">■</span> Bajó (positivo)
                                    <span className="text-red-400">■</span> Subió
                                    <span className="text-green-400">■</span> Músculo: subir es positivo
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}