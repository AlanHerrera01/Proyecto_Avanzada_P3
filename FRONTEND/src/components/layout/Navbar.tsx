import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, UserCircle, FileText } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: BookOpen },
    { path: '/users', label: 'Usuarios', icon: UserCircle },
    { path: '/authors', label: 'Autores', icon: Users },
    { path: '/books', label: 'Libros', icon: BookOpen },
    { path: '/loans', label: 'Préstamos', icon: FileText },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <BookOpen size={32} />
            <span>Biblioteca</span>
          </Link>

          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-700 text-white' 
                      : 'text-blue-100 hover:bg-blue-500'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
