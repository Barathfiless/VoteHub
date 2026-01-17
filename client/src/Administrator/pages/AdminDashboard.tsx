import { useNavigate } from 'react-router-dom';

import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  PlusCircle,
  BarChart3,
  Trophy,
  Calendar,
  Vote,
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { getActiveElections, getTotalVotes, getParticipationRate, getScheduledElections } = useElections();

  const adminActions = [
    {
      title: 'Create Election',
      description: 'Set up a new election with candidates, schedule, and details',
      icon: PlusCircle,
      action: () => navigate('/admin/create-election'),
      color: 'bg-blue-100 text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Manage Elections',
      description: 'View and manage all scheduled and active elections',
      icon: Calendar,
      action: () => navigate('/admin/manage'),
      color: 'bg-red-100 text-red-600',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    {
      title: 'Vote Analytics',
      description: 'Review voting trends and participation statistics',
      icon: BarChart3,
      action: () => navigate('/admin/analytics'),
      color: 'bg-green-100 text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Post Results',
      description: 'Publish official election results for students',
      icon: Trophy,
      action: () => navigate('/admin/post-results'),
      color: 'bg-orange-100 text-orange-600',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
    },
  ];

  const quickStats = [
    {
      label: 'Active Elections',
      value: getActiveElections().toString(),
      icon: Vote,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Votes Cast',
      value: getTotalVotes().toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Participation Rate',
      value: `${getParticipationRate()}%`,
      icon: CheckCircle2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      label: 'Scheduled Elections',
      value: getScheduledElections().toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];



  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">Welcome back, Administrator</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Here's what you can do today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`${stat.bgColor} dark:bg-gray-800 border-0`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-white dark:bg-gray-700`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Actions */}
      <div className="mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">Core Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                onClick={action.action}
                className="aspect-square bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group"
              >
                <div className={`w-16 h-16 rounded-lg ${action.color} dark:bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{action.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{action.description}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
