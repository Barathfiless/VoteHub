import { Link, useLocation } from 'react-router-dom';
import {
    Vote,
    Users,
    Calendar,
    BarChart3,
    Clock,
    LayoutDashboard,
    LogOut,
    CheckCircle2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StudentSidebarProps {
    onClose?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const StudentSidebar = ({ onClose, isCollapsed = false, onToggleCollapse }: StudentSidebarProps) => {
    const location = useLocation();
    const { signOut } = useAuth();

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.includes(path);
    };

    const navItems = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: LayoutDashboard
        },
        {
            label: 'Vote in Elections',
            path: '/vote-elections',
            icon: CheckCircle2
        },
        {
            label: 'Upcoming Elections',
            path: '/upcoming-elections',
            icon: Clock
        },
        {
            label: 'View Results',
            path: '/election-results',
            icon: BarChart3
        }
    ];

    const NavButton = ({ item, isMobile = false }: { item: any, isMobile?: boolean }) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        const ButtonContent = (
            <Button
                variant="ghost"
                className={`w-full transition-all duration-200 ${isCollapsed && !isMobile ? 'justify-center px-0' : 'justify-start gap-3'
                    } ${active
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-700 dark:hover:text-blue-300'
                    }`}
            >
                <Icon className={`${isCollapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />
                {(!isCollapsed || isMobile) && <span className="truncate">{item.label}</span>}
            </Button>
        );

        if (isCollapsed && !isMobile) {
            return (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link to={item.path} onClick={onClose} className="block w-full">
                                {ButtonContent}
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-bold border-sidebar-border bg-sidebar text-white">
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return (
            <Link to={item.path} onClick={onClose} className="block w-full">
                {ButtonContent}
            </Link>
        );
    };

    return (
        <div className={`h-full flex flex-col bg-white dark:bg-sidebar border-r border-gray-200 dark:border-sidebar-border transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Logo Area */}
            <div className={`p-6 border-b border-gray-200 dark:border-sidebar-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-md shrink-0">
                        <Vote className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900 dark:text-white truncate leading-none">VoteHub</span>
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Student Portal</span>
                        </div>
                    )}
                </Link>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden -mr-2 h-8 w-8">
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item, index) => (
                    <NavButton key={index} item={item} />
                ))}
            </nav>

            {/* Footer / Sign Out */}
            <div className="p-4 border-t border-gray-200 dark:border-sidebar-border">
                {isCollapsed ? (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    onClick={signOut}
                                    className="w-full justify-center px-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                                >
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-bold text-red-500">
                                Sign Out
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <Button
                        variant="ghost"
                        onClick={signOut}
                        className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-semibold">Sign Out</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default StudentSidebar;
