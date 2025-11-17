import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { BookOpen, Users, UserCircle, FileText } from 'lucide-react';

export const HomePage: React.FC = () => {
  const modules = [
    {
      title: 'Usuarios',
      description: 'Gestiona los usuarios de la biblioteca',
      icon: UserCircle,
      path: '/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Autores',
      description: 'Administra los autores de los libros',
      icon: Users,
      path: '/authors',
      color: 'bg-green-500',
    },
    {
      title: 'Libros',
      description: 'Catálogo completo de libros',
      icon: BookOpen,
      path: '/books',
      color: 'bg-purple-500',
    },
    {
      title: 'Préstamos',
      description: 'Gestiona préstamos y devoluciones',
      icon: FileText,
      path: '/loans',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema de Gestión de Biblioteca
        </h1>
        <p className="text-xl text-gray-600">
          Administra usuarios, libros, autores y préstamos de manera eficiente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <Link key={module.path} to={module.path}>
            <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`${module.color} p-4 rounded-full text-white`}>
                  <module.icon size={40} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {module.title}
                </h3>
                <p className="text-gray-600">
                  {module.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
