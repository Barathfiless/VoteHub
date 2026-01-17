import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    // Filter elections by student's department

    const departmentElections = elections.filter(e => e.department === 'All Departments' || e.department === user?.department);

    const activeElections = departmentElections.filter(e => e.status === 'active');
    const upcomingElections = departmentElections.filter(e => e.status === 'scheduled');
    const completedElections = departmentElections.filter(e => e.status === 'completed');

    setStats({
      activeCount: activeElections.length,
      upcomingCount: upcomingElections.length,
      completedCount: completedElections.length,
    });
  }, [elections, user]);

  const mainOptions = [
    {
      title: 'Vote',
      description: '',
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {user?.rollNo}</h2>
          <p className="text-gray-600 dark:text-gray-400">Here's what you can do today</p>
        </div>
      </div>

      {/* Main Options Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {mainOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <div
              key={index}
              onClick={option.action}
              className="h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center p-5 text-center group"
            >
              <div className={`w-12 h-12 rounded-lg ${option.color} dark:bg-opacity-20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">{option.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{option.description}</p>
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold mb-3 px-2 py-0.5 text-xs">
                {option.count}
              </Badge>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  option.action();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-1.5 h-8 rounded-lg text-xs"
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
          <CardContent className="p-4">
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
          <CardContent className="p-4">
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
          <CardContent className="p-4">
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
    </div>
  );
};

export default StudentDashboard;
