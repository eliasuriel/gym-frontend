import Navbar from './Navbar';

export default function Layout({ children, onLogout }) {
    return (
        <div className="flex min-h-screen bg-gray-900">
            <Navbar onLogout={onLogout} />
            <main className="flex-1 p-8 text-white overflow-auto">
                {children}
            </main>
        </div>
    );
}