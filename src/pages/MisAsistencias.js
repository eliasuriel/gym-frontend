import { useEffect, useState } from 'react';
import api from '../services/api';

export default function MisAsistencias() {
    const [asistenciaActiva, setAsistenciaActiva] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const usuarioId = localStorage.getItem('usuarioId');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        cargarHistorial();
    }, []);

    const cargarHistorial = () => {
        api.get(`/asistencias/usuario/${usuarioId}/historial`)
            .then(res => {
                setHistorial(res.data);
                const activa = res.data.find(a => !a.fechaSalida);
                setAsistenciaActiva(activa || null);
            })
            .catch(() => {});
    };

    const handleEntrada = async () => {
        setError('');
        try {
            await api.post(`/asistencias/entrada/${usuarioId}`);
            setSuccess('¡Entrada registrada! Bienvenido al gimnasio 💪');
            cargarHistorial();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar entrada');
        }
    };

    const handleSalida = async () => {
        setError('');
        try {
            await api.put(`/asistencias/salida/${usuarioId}`);
            setSuccess('¡Salida registrada! Hasta la próxima 👋');
            cargarHistorial();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar salida');
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Mis Asistencias</h2>

            {success && <div className="bg-green-600 text-white p-4 rounded-lg mb-4 text-center font-medium">{success}</div>}
            {error && <div className="bg-red-600 text-white p-4 rounded-lg mb-4 text-center">{error}</div>}

            {/* Botones de entrada/salida */}
            <div className="bg-gray-800 rounded-2xl p-8 mb-6 text-center">
                {asistenciaActiva ? (
                    <>
                        <div className="mb-6">
              <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                ✅ Estás en el gimnasio
              </span>
                            <p className="text-gray-400 text-sm mt-3">
                                Entrada: {asistenciaActiva.fechaEntrada}
                            </p>
                        </div>
                        <button
                            onClick={handleSalida}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl px-12 py-4 rounded-2xl transition"
                        >
                            🚪 Registrar salida
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-gray-400 mb-6">¿Listo para entrenar?</p>
                        <button
                            onClick={handleEntrada}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-12 py-4 rounded-2xl transition"
                        >
                            💪 Registrar entrada
                        </button>
                    </>
                )}
            </div>

            {/* Historial */}
            <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Mi historial</h3>
                {historial.length === 0 ? (
                    <p className="text-gray-400">No hay asistencias registradas.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                            <th className="text-left py-2">Entrada</th>
                            <th className="text-left py-2">Salida</th>
                            <th className="text-left py-2">Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {historial.map(a => (
                            <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                <td className="py-3 text-gray-400">{a.fechaEntrada}</td>
                                <td className="py-3 text-gray-400">{a.fechaSalida || '—'}</td>
                                <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${a.fechaSalida ? 'bg-gray-600' : 'bg-green-600'}`}>
                      {a.fechaSalida ? 'Completada' : 'En gimnasio'}
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