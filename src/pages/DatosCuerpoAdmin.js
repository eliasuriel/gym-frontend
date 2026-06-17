import { useEffect, useState } from 'react';
import api from '../services/api';

export default function DatosCuerpoAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
    const [historial, setHistorial] = useState([]);
    const [ultimo, setUltimo] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        peso: '', altura: '',
        musculo: '', grasaCorporal: '', grasaVisceral: '', edadMetabolica: '',
        busto: '', cintura: '', abdomen: '', cadera: '', muslo: '', brazo: ''
    });

    useEffect(() => {
        api.get('/usuarios').then(res =>
            setUsuarios(res.data.filter(u => u.rol === 'CLIENTE'))
        );
    }, []);

    const cargarDatos = (id) => {
        setUsuarioSeleccionado(id);
        if (!id) return;
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
        setLoading(true);
        try {
            await api.post(`/datos-cuerpo/admin/usuario/${usuarioSeleccionado}`, {
                peso: form.peso ? parseFloat(form.peso) : null,
                altura: form.altura ? parseFloat(form.altura) : null,
                musculo: form.musculo ? parseFloat(form.musculo) : null,
                grasaCorporal: form.grasaCorporal ? parseFloat(form.grasaCorporal) : null,
                grasaVisceral: form.grasaVisceral ? parseFloat(form.grasaVisceral) : null,
                edadMetabolica: form.edadMetabolica ? parseInt(form.edadMetabolica) : null,
                busto: form.busto ? parseFloat(form.busto) : null,
                cintura: form.cintura ? parseFloat(form.cintura) : null,
                abdomen: form.abdomen ? parseFloat(form.abdomen) : null,
                cadera: form.cadera ? parseFloat(form.cadera) : null,
                muslo: form.muslo ? parseFloat(form.muslo) : null,
                brazo: form.brazo ? parseFloat(form.brazo) : null,
            });
            setSuccess('Datos guardados correctamente');
            setForm({
                peso: '', altura: '',
                musculo: '', grasaCorporal: '', grasaVisceral: '', edadMetabolica: '',
                busto: '', cintura: '', abdomen: '', cadera: '', muslo: '', brazo: ''
            });
            setMostrarFormulario(false);
            cargarDatos(usuarioSeleccionado);
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Error al guardar los datos');
        } finally {
            setLoading(false);
        }
    };

    const colorImc = (imc) => {
        if (!imc) return 'text-gray-400';
        if (imc < 18.5) return 'text-blue-400';
        if (imc < 25) return 'text-green-400';
        if (imc < 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    const diff = (actual, anterior) => {
        if (actual == null || anterior == null) return null;
        const d = parseFloat((actual - anterior).toFixed(1));
        const positivo = d > 0;
        return (
            <span className={`text-xs font-medium ml-1 ${positivo ? 'text-red-400' : 'text-green-400'}`}>
        {positivo ? `↑ +${d}` : `↓ ${d}`}
      </span>
        );
    };

    const campo = (label, key, placeholder, unidad) => (
        <div>
            <label className="text-gray-400 text-sm block mb-1">
                {label} {unidad && <span className="text-gray-500">({unidad})</span>}
            </label>
            <input
                type="number" step="0.1"
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
            />
        </div>
    );

    const anterior = historial.length > 1 ? historial[1] : null;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Datos Corporales</h2>

            {success && <div className="bg-green-600 text-white p-3 rounded-lg mb-4">{success}</div>}
            {error && <div className="bg-red-600 text-white p-3 rounded-lg mb-4">{error}</div>}

            {/* Selector de cliente */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1">
                        <label className="text-gray-400 text-sm block mb-1">Seleccionar cliente</label>
                        <select
                            value={usuarioSeleccionado}
                            onChange={e => { cargarDatos(e.target.value); setMostrarFormulario(false); }}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Selecciona un cliente --</option>
                            {usuarios.map(u => (
                                <option key={u.id} value={u.id}>{u.nombre} — {u.correo}</option>
                            ))}
                        </select>
                    </div>
                    {usuarioSeleccionado && (
                        <div className="flex items-end">
                            <button
                                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
                            >
                                {mostrarFormulario ? 'Cancelar' : '+ Nuevo registro'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Formulario */}
            {mostrarFormulario && (
                <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-6">Nuevo registro</h3>
                    <form onSubmit={handleGuardar}>
                        <p className="text-blue-400 font-medium mb-3">📊 Composición corporal</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {campo('Peso', 'peso', '75.5', 'kg')}
                            {campo('Altura', 'altura', '1.75', 'm')}
                            {campo('Músculo', 'musculo', '35.2', 'kg')}
                            {campo('Grasa corporal', 'grasaCorporal', '18.5', '%')}
                            {campo('Grasa visceral', 'grasaVisceral', '5', 'nivel')}
                            <div>
                                <label className="text-gray-400 text-sm block mb-1">
                                    Edad metabólica <span className="text-gray-500">(años)</span>
                                </label>
                                <input
                                    type="number"
                                    value={form.edadMetabolica}
                                    onChange={e => setForm({ ...form, edadMetabolica: e.target.value })}
                                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="28"
                                />
                            </div>
                        </div>

                        <p className="text-purple-400 font-medium mb-3">📏 Medidas corporales</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {campo('Busto', 'busto', '90.0', 'cm')}
                            {campo('Cintura', 'cintura', '75.0', 'cm')}
                            {campo('Abdomen', 'abdomen', '82.0', 'cm')}
                            {campo('Cadera', 'cadera', '95.0', 'cm')}
                            {campo('Muslo', 'muslo', '55.0', 'cm')}
                            {campo('Brazo', 'brazo', '30.0', 'cm')}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar registro'}
                        </button>
                    </form>
                </div>
            )}

            {/* Último registro con diferencias */}
            {ultimo && (
                <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Último registro</h3>
                        <div className="text-right">
                            <span className="text-gray-400 text-sm">{ultimo.fechaRegistro}</span>
                            {anterior && (
                                <p className="text-gray-500 text-xs mt-1">
                                    vs anterior: {anterior.fechaRegistro}
                                </p>
                            )}
                        </div>
                    </div>

                    <p className="text-blue-400 font-medium mb-3">📊 Composición corporal</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Peso', key: 'peso', unidad: 'kg' },
                            { label: 'IMC', key: 'imc', unidad: ultimo.categoria, color: colorImc(ultimo.imc) },
                            { label: 'Músculo', key: 'musculo', unidad: 'kg' },
                            { label: 'Grasa corporal', key: 'grasaCorporal', unidad: '%' },
                            { label: 'Grasa visceral', key: 'grasaVisceral', unidad: 'nivel' },
                            { label: 'Edad metabólica', key: 'edadMetabolica', unidad: 'años' },
                        ].map(({ label, key, unidad, color }) => (
                            <div key={label} className="bg-gray-700 rounded-xl p-4">
                                <p className="text-gray-400 text-sm mb-1">{label}</p>
                                <div className="flex items-baseline flex-wrap gap-1">
                                    <p className={`text-2xl font-bold ${color || 'text-white'}`}>
                                        {ultimo[key] ?? '—'}
                                    </p>
                                    <p className="text-gray-500 text-xs">{unidad}</p>
                                    {anterior && diff(ultimo[key], anterior[key])}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-purple-400 font-medium mb-3">📏 Medidas corporales</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Busto', key: 'busto' },
                            { label: 'Cintura', key: 'cintura' },
                            { label: 'Abdomen', key: 'abdomen' },
                            { label: 'Cadera', key: 'cadera' },
                            { label: 'Muslo', key: 'muslo' },
                            { label: 'Brazo', key: 'brazo' },
                        ].map(({ label, key }) => (
                            <div key={label} className="bg-gray-700 rounded-xl p-4">
                                <p className="text-gray-400 text-sm mb-1">{label}</p>
                                <div className="flex items-baseline flex-wrap gap-1">
                                    <p className="text-2xl font-bold text-white">{ultimo[key] ?? '—'}</p>
                                    <p className="text-gray-500 text-xs">cm</p>
                                    {anterior && diff(ultimo[key], anterior[key])}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Historial */}
            {usuarioSeleccionado && historial.length > 0 && (
                <div className="bg-gray-800 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Historial de registros</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-gray-400 border-b border-gray-700">
                                <th className="text-left py-2 pr-4">Fecha</th>
                                <th className="text-left py-2 pr-4">Peso</th>
                                <th className="text-left py-2 pr-4">IMC</th>
                                <th className="text-left py-2 pr-4">Músculo</th>
                                <th className="text-left py-2 pr-4">Grasa %</th>
                                <th className="text-left py-2 pr-4">Cintura</th>
                                <th className="text-left py-2 pr-4">Cadera</th>
                            </tr>
                            </thead>
                            <tbody>
                            {historial.map((d, i) => {
                                const prev = historial[i + 1] || null;
                                return (
                                    <tr key={d.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                        <td className="py-3 pr-4 text-gray-400">{d.fechaRegistro}</td>
                                        <td className="py-3 pr-4">
                                            {d.peso ?? '—'} kg
                                            {prev && diff(d.peso, prev.peso)}
                                        </td>
                                        <td className={`py-3 pr-4 font-semibold ${colorImc(d.imc)}`}>
                                            {d.imc ?? '—'}
                                            {prev && diff(d.imc, prev.imc)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {d.musculo ?? '—'} kg
                                            {prev && diff(d.musculo, prev.musculo)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {d.grasaCorporal ?? '—'} %
                                            {prev && diff(d.grasaCorporal, prev.grasaCorporal)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {d.cintura ?? '—'} cm
                                            {prev && diff(d.cintura, prev.cintura)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {d.cadera ?? '—'} cm
                                            {prev && diff(d.cadera, prev.cadera)}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}