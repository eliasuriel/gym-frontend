import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const isoLocal = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fechaMx = (s) => s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : '—';
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const tipos = [
    { key: 'vencidas', numero: '01', nombre: 'Socias asistentes con membresía vencida', descripcion: 'Socias que asistieron sin una membresía vigente en al menos una fecha del periodo y que todavía no regularizan su membresía. Si ya renovaron, dejan de aparecer.' },
    { key: 'cumpleanos', numero: '02', nombre: 'Cumpleaños de socias que asistieron', descripcion: 'Socias con al menos una asistencia en el periodo que cumplen años en el mes seleccionado.' },
    { key: 'vigentes', numero: '03', nombre: 'Socias asistentes con membresía vigente', descripcion: 'Socias que asistieron durante el periodo y que tienen su membresía vigente hoy, incluso si renovaron después de asistir.' }
];

export default function ReportesSocias() {
    const [hoy] = useState(() => isoLocal(new Date()));
    const [desde, setDesde] = useState(() => {
        const d = new Date(); d.setMonth(d.getMonth() - 1); return isoLocal(d);
    });
    const [hasta, setHasta] = useState(hoy);
    const [mes, setMes] = useState(() => new Date().getMonth() + 1);
    const [tipo, setTipo] = useState('vencidas');
    const [datos, setDatos] = useState(null);
    const [consultado, setConsultado] = useState(null);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const consultar = useCallback(async (filtros) => {
        if (!filtros.desde || !filtros.hasta || filtros.desde > filtros.hasta || filtros.hasta > hoy) {
            setError('Selecciona un rango válido: desde debe ser anterior o igual a hasta, sin fechas futuras.');
            return;
        }
        setError(''); setCargando(true);
        try {
            const res = await api.get('/reportes-socias', { params: filtros });
            setDatos(res.data); setConsultado({ ...filtros });
        } catch (e) {
            setDatos(null);
            setError(e.response?.data?.message || e.response?.data?.mensaje || 'No fue posible consultar. Verifica que el backend esté actualizado.');
        } finally { setCargando(false); }
    }, [hoy]);

    useEffect(() => {
        const d = new Date(); d.setMonth(d.getMonth() - 1);
        consultar({ desde: isoLocal(d), hasta: isoLocal(new Date()), mes: new Date().getMonth() + 1 });
    }, [consultar]);

    const actual = tipos.find(t => t.key === tipo);
    const filas = datos?.[tipo] || [];
    const desactualizado = !!consultado && (
        consultado.desde !== desde || consultado.hasta !== hasta || (tipo === 'cumpleanos' && Number(consultado.mes) !== Number(mes))
    );
    const imprimir = () => { if (datos && !desactualizado) window.print(); };

    return (
        <div className="text-white pb-8">
            <style>{`@media print {
        body * { visibility: hidden !important; }
        #reporte-imprimible, #reporte-imprimible * { visibility: visible !important; }
        #reporte-imprimible { position:absolute!important; left:0!important; top:0!important; width:100%!important; background:white!important; color:#111!important; padding:0!important; border:0!important; box-shadow:none!important; }
        #reporte-imprimible * { color:#111!important; background:white!important; border-color:#bbb!important; }
        #reporte-imprimible table { width:100%; border-collapse:collapse; }
        #reporte-imprimible th, #reporte-imprimible td { padding:7px 8px!important; border-bottom:1px solid #ddd!important; text-align:left; }
        #reporte-imprimible tr { break-inside:avoid; }
        #reporte-imprimible .solo-pantalla { display:none!important; }
        @page { size:A4 portrait; margin:14mm; }
      }`}</style>
            <div className="mb-6">
                <h2 className="text-3xl font-bold">Reportes de socias</h2>
                <p className="text-gray-400 mt-2">Selecciona el reporte, establece el periodo y consulta los resultados.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
                {tipos.map(t => (
                    <button key={t.key} type="button" onClick={() => setTipo(t.key)}
                            aria-pressed={tipo === t.key}
                            className={`rounded-xl p-4 text-left border transition ${tipo === t.key ? 'bg-purple-900 border-purple-400' : 'bg-gray-800 border-gray-700 hover:border-purple-500'}`}>
                        <div className="flex justify-between items-center gap-2 mb-2">
                            <span className="text-purple-300 text-sm font-bold">REPORTE {t.numero}</span>
                            {datos && <span className="rounded-full bg-gray-700 px-3 py-1 text-sm font-semibold">{datos[t.key]?.length ?? 0} socias</span>}
                        </div>
                        <div className="font-bold text-lg leading-snug">{t.nombre}</div>
                    </button>
                ))}
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mb-5">
                <p className="text-gray-200 font-medium mb-1">{actual.nombre}</p>
                <p className="text-gray-400 text-sm mb-5">{actual.descripcion}</p>
                <div className={`grid grid-cols-1 ${tipo === 'cumpleanos' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 items-end`}>
                    <label className="text-sm text-gray-300">Asistencias desde
                        <input type="date" max={hoy} value={desde} onChange={e => setDesde(e.target.value)}
                               className="block w-full mt-2 bg-gray-700 text-white px-3 py-3 rounded-lg" />
                    </label>
                    <label className="text-sm text-gray-300">Asistencias hasta
                        <input type="date" max={hoy} value={hasta} onChange={e => setHasta(e.target.value)}
                               className="block w-full mt-2 bg-gray-700 text-white px-3 py-3 rounded-lg" />
                    </label>
                    {tipo === 'cumpleanos' && (
                        <label className="text-sm text-gray-300">Mes de cumpleaños
                            <select value={mes} onChange={e => setMes(Number(e.target.value))}
                                    className="block w-full mt-2 bg-gray-700 text-white px-3 py-3 rounded-lg">
                                {meses.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                        </label>
                    )}
                    <button type="button" disabled={cargando} onClick={() => consultar({ desde, hasta, mes })}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg px-4 py-3 font-semibold">
                        {cargando ? 'Consultando...' : 'Consultar reporte'}
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">Periodo predeterminado: desde hace un mes hasta hoy. Se considera asistencia cualquier entrada registrada en el rango.</p>
            </div>

            {error && <div role="alert" className="bg-red-950 border border-red-700 rounded-lg px-4 py-3 text-red-200 mb-4">{error}</div>}
            {desactualizado && <div className="bg-amber-900 border border-amber-600 rounded-lg px-4 py-3 text-amber-100 mb-4">Cambiaste los filtros. Presiona «Consultar reporte» antes de imprimir.</div>}

            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="text-gray-300 text-sm">{datos ? `${filas.length} socia${filas.length === 1 ? '' : 's'} encontradas` : 'Sin resultados consultados'}</div>
                <button type="button" disabled={!datos || desactualizado || cargando} onClick={imprimir}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg px-5 py-2 font-semibold">🖨 Imprimir reporte</button>
            </div>

            <section id="reporte-imprimible" className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-2xl font-bold">Lady's Gym</h3>
                <h4 className="font-semibold text-lg mt-1">{actual.nombre}</h4>
                <p className="text-gray-300 text-sm mt-2">Periodo de asistencias: {fechaMx(consultado?.desde)} al {fechaMx(consultado?.hasta)}</p>
                {tipo === 'cumpleanos' && <p className="text-gray-300 text-sm">Mes de cumpleaños: {meses[(Number(consultado?.mes) || mes) - 1]}</p>}
                <p className="text-gray-300 text-sm mt-1">Fecha de emisión: {fechaMx(datos?.fechaEmision)} · Total de socias: {filas.length}</p>
                {tipo === 'vencidas' && <p className="text-gray-400 text-sm mt-3">Este reporte muestra socias con al menos una asistencia sin membresía vigente dentro del periodo y que aún no han renovado. Si su membresía venció después del periodo, no aparecerán por ese motivo.</p>}
                {tipo === 'vigentes' && <p className="text-gray-400 text-sm mt-3">La vigencia se verifica a la fecha de emisión del reporte; incluye a socias que renovaron después de asistir.</p>}
                <div className="overflow-x-auto mt-5">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left border-b border-gray-600">
                            <th className="px-2 py-3">N.º socia</th>
                            <th className="px-2 py-3">Nombre completo</th>
                            {tipo === 'cumpleanos' ? <th className="px-2 py-3">Cumpleaños</th> : <th className="px-2 py-3">Vencimiento</th>}
                            {tipo !== 'vigentes' && <th className="px-2 py-3">{tipo === 'vencidas' ? 'Última asistencia sin vigencia' : 'Última asistencia'}</th>}
                        </tr></thead>
                        <tbody>
                        {filas.map(f => (
                            <tr key={f.numeroSocia} className="border-b border-gray-700">
                                <td className="px-2 py-3 font-semibold">{f.numeroSocia}</td>
                                <td className="px-2 py-3">{f.nombre}</td>
                                <td className="px-2 py-3">{tipo === 'cumpleanos' ? (f.cumpleanos ? `${f.cumpleanos.slice(8, 10)}/${f.cumpleanos.slice(5, 7)}` : '—') : fechaMx(f.vencimiento)}</td>
                                {tipo !== 'vigentes' && <td className="px-2 py-3">{fechaMx(f.ultimaAsistencia)}</td>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {datos && filas.length === 0 && <p className="text-gray-300 py-6">No se encontraron socias que cumplan estas condiciones durante el periodo.</p>}
                {!datos && <p className="text-gray-400 py-6">Consulta el reporte para ver los resultados.</p>}
            </section>
            <p className="text-gray-500 text-xs mt-4">El orden por primer apellido es aproximado cuando los apellidos no están almacenados por separado.</p>
        </div>
    );
}