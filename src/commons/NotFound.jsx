import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Page non trouvée</h2>
          <p className="text-gray-600 mb-8">Désolé, la page que vous recherchez n'existe pas.</p>
          <Link 
            to="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound