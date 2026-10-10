import { useState } from 'react';
import api from '../services/api';

export default function ReporteInasistencia() {
    const [dias, setDias] = useState(7);
    const [reporte, setReporte] = useState([]);
    const [diasConsultados, setDiasConsultados] = useState(null);
    const [soloActivas, setSoloActivas] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerar = async () => {
        const n = parseInt(dias, 10);
        if (!n || n < 1) {
            setError('Escribe un número de días mayor o igual a 1');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await api.get('/asistencias/reporte/inasistencia', { params: { dias: n } });
            setReporte(res.data);
            setDiasConsultados(n);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const formatoFecha = (iso) => {
        if (!iso) return '—';
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    };

    const visibles = soloActivas ? reporte.filter(r => r.membresiaActiva) : reporte;

    const colorDias = (d) => {
        if (d == null) return 'text-red-400';
        if (d >= 30) return 'text-red-400';
        if (d >= 14) return 'text-orange-400';
        return 'text-yellow-400';
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2">Clientas sin asistir</h2>
            <p className="text-gray-400 mb-8">Clientas que llevan varios días sin ir al gimnasio</p>

            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Días sin asistir (mínimo)</label>
                        <input
                            type="number"
                            min="1"
                            value={dias}
                            onChange={e => setDias(e.target.value)}
                            className="w-40 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleGenerar}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-8 py-2 rounded-lg transition"
                    >
                        {loading ? '⏳ Generando...' : '📋 Generar reporte'}
                    </button>
                    <label className="flex items-center gap-2 text-gray-300 text-sm pb-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={soloActivas}
                            onChange={e => setSoloActivas(e.target.checked)}
                        />
                        Solo con membresía activa
                    </label>
                </div>
                {error && <div className="bg-red-600 text-white p-3 rounded-lg mt-4">{error}</div>}
            </div>

            {diasConsultados !== null && (
                <div className="bg-gray-800 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-1">
                        {visibles.length} {visibles.length === 1 ? 'clienta' : 'clientas'} con {diasConsultados} {diasConsultados === 1 ? 'día' : 'días'} o más sin asistir
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">Incluye a quienes nunca han registrado una asistencia.</p>

                    {visibles.length === 0 ? (
                        <p className="text-gray-400">No hay clientas en esta situación. 🎉</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-gray-400 border-b border-gray-700">
                                <th className="text-left py-2">ID</th>
                                <th className="text-left py-2">Nombre</th>
                                <th className="text-left py-2">Teléfono</th>
                                <th className="text-left py-2">Última asistencia</th>
                                <th className="text-left py-2">Días sin asistir</th>
                                <th className="text-left py-2">Membresía</th>
                            </tr>
                            </thead>
                            <tbody>
                            {visibles.map(r => (
                                <tr key={r.usuarioId} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                    <td className="py-3 font-mono" style={{ color: '#c084fc' }}>{r.usuarioId}</td>
                                    <td className="py-3 text-white font-medium">{r.nombre}</td>
                                    <td className="py-3 text-gray-400">{r.telefono || '—'}</td>
                                    <td className="py-3 text-gray-400">
                                        {r.ultimaAsistencia ? formatoFecha(r.ultimaAsistencia) : 'Nunca ha asistido'}
                                    </td>
                                    <td className={`py-3 font-bold ${colorDias(r.diasSinAsistir)}`}>
                                        {r.diasSinAsistir == null ? '—' : r.diasSinAsistir}
                                    </td>
                                    <td className="py-3">
                                        {r.membresiaActiva ? (
                                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                Activa · vence {formatoFecha(r.fechaVencimiento)}
                                            </span>
                                        ) : (
                                            <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                                                Sin membresía activa
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}