import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Settings, LogOut, Shield } from 'lucide-react';
import { logout } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { toast } from './ui/use-toast';

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const handleMyProfile = () => {
    navigate('/dashboard');
  };

  const handleChangePassword = () => {
    navigate('/dashboard');
    // You can add state to open the security settings tab directly
  };

  if (!user) return null;

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border border-border/50 hover:border-border"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt={user.fullName} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-semibold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.mobile}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleMyProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;