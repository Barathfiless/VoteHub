import { Link, useLocation } from 'react-router-dom';
import {
    Users,
    PlusCircle,
    Calendar,
    BarChart3,
    Trophy,
    LogOut,
    Vote,
    Building2,
    X,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '../services/adminAuth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
    onClose?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const Sidebar = ({ onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) => {
    const location = useLocation();
    const { signOut } = useAdminAuth();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const navItems = [
        {
            label: 'Create Department',
            path: '/admin/departments',
            icon: Building2
        },
        {
            label: 'Student Management',
            path: '/admin/students',
            icon: Users
        },
        {
            label: 'Create Election',
            path: '/admin/create-election',
            icon: PlusCircle
        },
        {
            label: 'Manage Elections',
            path: '/admin/manage',
            icon: Calendar
        },
        {
            label: 'Vote Analytics',
            path: '/admin/analytics',
            icon: BarChart3
        },
        {
            label: 'Post Results',
            path: '/admin/post-results',
            icon: Trophy
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
                        <TooltipContent side="right" className="font-bold bg-slate-900 text-white dark:bg-slate-800 border-none shadow-lg">
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
                <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md shrink-0">
                        <Vote className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold text-gray-900 dark:text-white truncate">VoteHub</span>
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
                <NavButton item={{ label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }} />

                <div className={`pt-4 pb-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    {isCollapsed ? (
                        <div className="w-6 h-px bg-gray-200 dark:bg-sidebar-border" />
                    ) : (
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Management
                        </p>
                    )}
                </div>

                {navItems.map((item) => (
                    <NavButton key={item.path} item={item} />
                ))}
            </nav>

            {/* Footer / Sign Out */}
            <div className="p-4 border-t border-gray-200 dark:border-sidebar-border">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                                    }`}
                                onClick={() => {
                                    onClose?.();
                                    signOut();
                                }}
                            >
                                <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />
                                {!isCollapsed && <span className="truncate">Sign Out</span>}
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right" className="font-bold bg-red-600 text-white border-none">
                                Sign Out
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

export default Sidebar;
