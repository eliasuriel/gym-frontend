export default function Navbar({ onLogout }) {
    const rol = localStorage.getItem('rol');
    const correo = localStorage.getItem('correo');

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
                        <a href="/dashboard" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition">
                            📊 Dashboard
                        </a>
                        <a href="/usuarios" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition">
                            👥 Usuarios
                        </a>
                        <a href="/membresias" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition">
                            🎫 Membresías
                        </a>
                        <a href="/asistencias" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition">
                            ✅ Asistencias
                        </a>
                    </>
                )}
                {rol === 'CLIENTE' && (
                    <>
                        <a href="/mi-membresia" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition">
                            🎫 Mi Membresía
                        </a>
                        <a href="/mis-datos" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition">
                            📏 Mis Datos
                        </a>
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