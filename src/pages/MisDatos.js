import { useEffect, useState } from 'react';
import api from '../services/api';

export default function MisDatos() {
    const [usuarioId, setUsuarioId] = useState(null);
    const [ultimo, setUltimo] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [form, setForm] = useState({ peso: '', altura: '', cintura: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const correo = localStorage.getItem('correo');
        api.get('/usuarios').then(res => {
            const yo = res.data.find(u => u.correo === correo);
            if (yo) {
                setUsuarioId(yo.id);
                cargarDatos(yo.id);
            }
        });
    }, []);

    const cargarDatos = (id) => {
        Promise.allSettled([
            api.get(`/datos-cuerpo/usuario/${id}/ultimo`),
            api.get(`/datos-cuerpo/usuario/${id}/historial`)
        ]).then(([ultimoRes, historialRes]) => {
            setUltimo(ultimoRes.status === 'fulfilled' ? ultimoRes.value.data : null);
            setHistorial(historialRes.status === 'fulfilled' ? historialRes.value.data : []);
        });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post(`/datos-cuerpo/usuario/${usuarioId}`, {
                peso: parseFloat(form.peso),
                altura: parseFloat(form.altura),
                cintura: form.cintura ? parseFloat(form.cintura) : null
            });
            setSuccess('Datos guardados correctamente');
            setForm({ peso: '', altura: '', cintura: '' });
            cargarDatos(usuarioId);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al guardar los datos');
        }
    };

    const colorImc = (imc) => {
        if (imc < 18.5) return 'text-blue-400';
        if (imc < 25) return 'text-green-400';
        if (imc < 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Mis Datos Corporales</h2>

            {success && <div className="bg-green-600 text-white p-3 rounded-lg mb-4">{success}</div>}
            {error && <div className="bg-red-600 text-white p-3 rounded-lg mb-4">{error}</div>}

            {ultimo && (
                <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Último registro</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Peso</p>
                            <p className="text-2xl font-bold text-white">{ultimo.peso} <span className="text-sm text-gray-400">kg</span></p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Altura</p>
                            <p className="text-2xl font-bold text-white">{ultimo.altura} <span className="text-sm text-gray-400">m</span></p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">IMC</p>
                            <p className={`text-2xl font-bold ${colorImc(ultimo.imc)}`}>{ultimo.imc}</p>
                            <p className="text-xs text-gray-400">{ultimo.categoria}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Fecha</p>
                            <p className="text-white">{ultimo.fechaRegistro}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Registrar nuevos datos</h3>
                <form onSubmit={handleGuardar} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Peso (kg)</label>
                        <input
                            type="number" step="0.1"
                            value={form.peso}
                            onChange={e => setForm({...form, peso: e.target.value})}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="75.5"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Altura (m)</label>
                        <input
                            type="number" step="0.01"
                            value={form.altura}
                            onChange={e => setForm({...form, altura: e.target.value})}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1.75"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Cintura (cm) — opcional</label>
                        <input
                            type="number" step="0.1"
                            value={form.cintura}
                            onChange={e => setForm({...form, cintura: e.target.value})}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="85.0"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                        >
                            Guardar datos
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Historial</h3>
                {historial.length === 0 ? (
                    <p className="text-gray-400">No hay registros anteriores.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                            <th className="text-left py-2">Fecha</th>
                            <th className="text-left py-2">Peso</th>
                            <th className="text-left py-2">Altura</th>
                            <th className="text-left py-2">IMC</th>
                            <th className="text-left py-2">Categoría</th>
                        </tr>
                        </thead>
                        <tbody>
                        {historial.map(d => (
                            <tr key={d.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                <td className="py-3 text-gray-400">{d.fechaRegistro}</td>
                                <td className="py-3">{d.peso} kg</td>
                                <td className="py-3">{d.altura} m</td>
                                <td className={`py-3 font-semibold ${colorImc(d.imc)}`}>{d.imc}</td>
                                <td className="py-3 text-gray-400">{d.categoria}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}