
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
  } | null;
  onSignOut?: () => void;
}

const Header = ({ user, onSignOut }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SA</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Smart Advisor</h1>
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/history')}
              className="text-gray-600 hover:text-gray-900"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
