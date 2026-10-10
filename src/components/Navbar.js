export default function Navbar({ onLogout, onNavigate, pagina }) {
    const rol = localStorage.getItem('rol');
    const correo = localStorage.getItem('correo');

    const linkClass = (p) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer text-sm font-medium ${
            pagina === p
                ? 'text-white'
                : 'text-purple-300 hover:text-white hover:bg-white hover:bg-opacity-10'
        }`;

    const linkStyle = (p) =>
        pagina === p
            ? { background: 'linear-gradient(135deg, #9333ea, #c084fc)', boxShadow: '0 4px 15px rgba(147,51,234,0.4)' }
            : {};

    return (
        <div className="w-64 min-h-screen flex flex-col p-5"
             style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0f0720 100%)', borderRight: '1px solid rgba(192,132,252,0.15)' }}>

            {/* Logo y usuario */}
            <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(192,132,252,0.15)' }}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                         style={{ background: 'linear-gradient(135deg, #9333ea, #f472b6)' }}>
                        💪
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-base leading-tight">Lady's Gym</h1>
                        <p className="text-xs" style={{ color: '#c084fc' }}>& CareSpa</p>
                    </div>
                </div>
                <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{correo}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{ background: 'rgba(192,132,252,0.2)', color: '#c084fc' }}>
            {rol}
          </span>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 space-y-1">
                {rol === 'ADMIN' && (
                    <>
                        <div onClick={() => onNavigate('dashboard')} className={linkClass('dashboard')} style={linkStyle('dashboard')}>
                            📊 Dashboard
                        </div>
                        <div onClick={() => onNavigate('usuarios')} className={linkClass('usuarios')} style={linkStyle('usuarios')}>
                            👥 Usuarios
                        </div>
                        <div onClick={() => onNavigate('membresias')} className={linkClass('membresias')} style={linkStyle('membresias')}>
                            🎫 Membresías
                        </div>
                        <div onClick={() => onNavigate('asistencias')} className={linkClass('asistencias')} style={linkStyle('asistencias')}>
                            ✅ Asistencias
                        </div>
                        <div onClick={() => onNavigate('datos-cuerpo')} className={linkClass('datos-cuerpo')} style={linkStyle('datos-cuerpo')}>
                            📏 Datos Corporales
                        </div>
                        <div onClick={() => onNavigate('reporte')} className={linkClass('reporte')} style={linkStyle('reporte')}>
                            📈 Reporte mensual
                        </div>
                        <div onClick={() => onNavigate('reporte-inasistencia')} className={linkClass('reporte-inasistencia')} style={linkStyle('reporte-inasistencia')}>
                            🚫 Sin asistir
                        </div>
                    </>
                )}
                {rol === 'CLIENTE' && (
                    <>
                        <div onClick={() => onNavigate('mi-membresia')} className={linkClass('mi-membresia')} style={linkStyle('mi-membresia')}>
                            🎫 Mi Membresía
                        </div>
                        <div onClick={() => onNavigate('mis-asistencias')} className={linkClass('mis-asistencias')} style={linkStyle('mis-asistencias')}>
                            ✅ Mis Asistencias
                        </div>
                        <div onClick={() => onNavigate('mis-datos')} className={linkClass('mis-datos')} style={linkStyle('mis-datos')}>
                            📏 Mis Datos
                        </div>
                    </>
                )}
            </nav>

            {/* Cerrar sesión */}
            <button
                onClick={onLogout}
                className="mt-6 w-full py-3 rounded-xl font-semibold text-sm transition"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(239,68,68,0.15)'; }}
            >
                Cerrar sesión
            </button>
        </div>
    );
}