import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../services/adminAuth';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  PlusCircle, 
  BarChart3, 
  Trophy, 
  Calendar, 
  Users, 
  Settings,
  LogOut,
  Vote,
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAdminAuth();
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
      color: 'bg-purple-100 text-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
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
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Scheduled Elections',
      value: getScheduledElections().toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-md">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Manage elections and voting</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, Administrator</h2>
          <p className="text-gray-600 dark:text-gray-400">Here's what you can do today</p>
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
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Core Features</h3>
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

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Settings */}
          <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <CardTitle className="dark:text-white">System Settings</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">Configure system preferences and security</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  User Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Security Settings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Audit Logs
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <CardTitle className="dark:text-white">User Management</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">Manage voters and administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Add/Remove Voters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Manage Roles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  View User Activity
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-300">Need Help?</CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-400">
              Check our documentation or contact support for assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                View Documentation
              </Button>
              <Button variant="outline" className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
