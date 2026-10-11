// Utilidades de fechas de nacimiento. Las fechas llegan del backend como "yyyy-MM-dd".
// Se parten a mano (sin new Date(string)) para evitar problemas de zona horaria.

const partes = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    return { y, m, d };
};

export const calcularEdad = (iso) => {
    const f = partes(iso);
    if (!f) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - f.y;
    const mes = hoy.getMonth() + 1;
    if (mes < f.m || (mes === f.m && hoy.getDate() < f.d)) edad--;
    return edad;
};

const esBisiesto = (anio) => (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;

export const esCumpleHoy = (iso) => {
    const f = partes(iso);
    if (!f) return false;
    const hoy = new Date();
    let mes = f.m;
    let dia = f.d;
    // Quien nació un 29 de febrero celebra el 28 en los años que no son bisiestos
    if (mes === 2 && dia === 29 && !esBisiesto(hoy.getFullYear())) dia = 28;
    return hoy.getMonth() + 1 === mes && hoy.getDate() === dia;
};

export const formatoFechaNacimiento = (iso) => {
    const f = partes(iso);
    if (!f) return '—';
    return `${String(f.d).padStart(2, '0')}/${String(f.m).padStart(2, '0')}/${f.y}`;
};