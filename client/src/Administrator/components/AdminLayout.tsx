import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-background flex flex-col lg:flex-row">
            {/* Sidebar - Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop and Mobile */}
            <div className={`
                fixed inset-y-0 left-0 z-[60] transform 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
                transition-all duration-300 ease-in-out bg-white dark:bg-sidebar border-r border-gray-200 dark:border-sidebar-border
            `}>
                <Sidebar
                    onClose={() => setIsMobileMenuOpen(false)}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* Main Content Area */}
            <div className={`
                flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
                ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
            `}>
                {/* Top Header */}
                <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-border sticky top-0 z-50 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden h-9 w-9 rounded-lg"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>

                        {/* Desktop Collapse Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden lg:flex h-9 w-9 rounded-lg hover:bg-neutral-100 dark:hover:bg-sidebar-accent transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </Button>

                        <span className="lg:hidden font-bold text-gray-900 dark:text-white">VoteHub</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-xs font-medium text-gray-500 dark:text-gray-400">Welcome, Administrator</span>
                        <ThemeToggle />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
