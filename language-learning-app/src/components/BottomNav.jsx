import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Clock, GraduationCap } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/practice', icon: GraduationCap, label: 'Practice' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/curriculum', icon: BookOpen, label: 'Curriculum' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                  active
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-primary-500'
                }`}
              >
                <Icon
                  size={24}
                  className={`mb-1 ${active ? 'stroke-2' : 'stroke-1'}`}
                />
                <span
                  className={`text-xs ${
                    active ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
