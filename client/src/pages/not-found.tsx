import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-festival-orange/10 to-festival-red/10">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-festival-orange">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Página no encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link href="/">
          <a className="inline-flex items-center px-6 py-3 bg-festival-orange text-white font-medium rounded-lg hover:bg-festival-orange/90 transition-colors">
            Volver al inicio
          </a>
        </Link>
      </div>
    </div>
  );
}