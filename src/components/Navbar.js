export default function Navbar({ onLogout, onNavigate, pagina }) {
    const rol = localStorage.getItem('rol');
    const correo = localStorage.getItem('correo');

    const linkClass = (p) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition cursor-pointer ${
            pagina === p ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`;

    return (
        <div className="bg-gray-800 w-64 min-h-screen flex flex-col p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">💪 GymApp</h1>
                <p className="text-gray-400 text-sm mt-1">{correo}</p>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full mt-1 inline-block">
          {rol}
        </span>
            </div>

            <nav className="flex-1 space-y-2">
                {rol === 'ADMIN' && (
                    <>
                        <div onClick={() => onNavigate('dashboard')} className={linkClass('dashboard')}>
                            📊 Dashboard
                        </div>
                        <div onClick={() => onNavigate('usuarios')} className={linkClass('usuarios')}>
                            👥 Usuarios
                        </div>
                        <div onClick={() => onNavigate('membresias')} className={linkClass('membresias')}>
                            🎫 Membresías
                        </div>
                        <div onClick={() => onNavigate('asistencias')} className={linkClass('asistencias')}>
                            ✅ Asistencias
                        </div>
                    </>
                )}
                {rol === 'CLIENTE' && (
                    <>
                        <div onClick={() => onNavigate('mi-membresia')} className={linkClass('mi-membresia')}>
                            🎫 Mi Membresía
                        </div>
                        <div onClick={() => onNavigate('mis-asistencias')} className={linkClass('mis-asistencias')}>
                            ✅ Mis Asistencias
                        </div>
                        <div onClick={() => onNavigate('mis-datos')} className={linkClass('mis-datos')}>
                            📏 Mis Datos
                        </div>
                    </>
                )}
            </nav>

            <button
                onClick={onLogout}
                className="mt-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
                Cerrar sesión
            </button>
        </div>
    );
}