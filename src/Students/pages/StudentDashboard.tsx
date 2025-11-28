import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Vote, Clock, BarChart3, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { elections } = useElections();
  const [stats, setStats] = useState({
    activeCount: 0,
    upcomingCount: 0,
    completedCount: 0,
  });

  useEffect(() => {
    const activeElections = elections.filter(e => e.status === 'active');
    const upcomingElections = elections.filter(e => e.status === 'scheduled');
    const completedElections = elections.filter(e => e.status === 'completed');

    setStats({
      activeCount: activeElections.length,
      upcomingCount: upcomingElections.length,
      completedCount: completedElections.length,
    });
  }, [elections]);

  const mainOptions = [
    {
      title: 'Vote in Elections',
      description: 'Cast your vote in active elections',
      icon: Vote,
      color: 'bg-blue-100 text-blue-600',
      count: stats.activeCount,
      action: () => navigate('/vote-elections'),
      buttonText: 'Vote Now',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Upcoming Elections',
      description: 'View elections coming soon',
      icon: Clock,
      color: 'bg-purple-100 text-purple-600',
      count: stats.upcomingCount,
      action: () => navigate('/upcoming-elections'),
      buttonText: 'View Upcoming',
      bgGradient: 'from-purple-50 to-purple-100',
    },
    {
      title: 'View Results',
      description: 'Check completed election results',
      icon: BarChart3,
      color: 'bg-green-100 text-green-600',
      count: stats.completedCount,
      action: () => navigate('/election-results'),
      buttonText: 'View Results',
      bgGradient: 'from-green-50 to-green-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {user?.rollNo}</h2>
            <p className="text-gray-600 dark:text-gray-400">Here's what you can do today</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Main Options Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {mainOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <div
                key={index}
                onClick={option.action}
                className="aspect-square bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group"
              >
                <div className={`w-16 h-16 rounded-lg ${option.color} dark:bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{option.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{option.description}</p>
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold mb-3">
                  {option.count}
                </Badge>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    option.action();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-2 rounded-lg text-sm"
                >
                  {option.buttonText}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Elections</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800">
                  <Vote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upcoming Elections</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.upcomingCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed Elections</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
