import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ManageElections = () => {
  const navigate = useNavigate();
  const { elections, deleteElection, updateElection } = useElections();
  const [deleteElectionId, setDeleteElectionId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleDeleteElection = () => {
    if (deleteElectionId) {
      deleteElection(deleteElectionId);
      setDeleteElectionId(null);
    }
  };

  const handleStatusChange = (electionId: string, newStatus: 'scheduled' | 'active' | 'completed') => {
    updateElection(electionId, { status: newStatus });
    setUpdatingStatus(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'completed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <ThemeToggle />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Elections</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage all elections</p>
        </div>

        {elections.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No elections created yet</p>
              <Button onClick={() => navigate('/admin/create-election')}>
                Create First Election
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {elections.map((election) => (
              <Card key={election.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{election.title}</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">{election.description}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(election.status)} dark:bg-opacity-20`}>
                      {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{election.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{election.standing_post}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Candidates</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{election.candidates?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Votes</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {election.candidates?.reduce((sum: number, c: any) => sum + c.votes, 0) || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/analytics?election=${election.id}`)}
                      className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      View Analytics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/post-results?election=${election.id}`)}
                      className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Post Results
                    </Button>

                    {election.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(election.id, 'active')}
                        className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Activate
                      </Button>
                    )}

                    {election.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(election.id, 'completed')}
                        className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Complete
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteElectionId(election.id)}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteElectionId} onOpenChange={() => setDeleteElectionId(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Election</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this election? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteElection} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageElections;
