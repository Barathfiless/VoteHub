import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Copy } from 'lucide-react';
import { toast } from 'sonner';
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
  const { elections, deleteElection, updateElection, addElection } = useElections();
  const [deleteElectionId, setDeleteElectionId] = useState<string | null>(null);

  const handleDeleteElection = () => {
    if (deleteElectionId) {
      deleteElection(deleteElectionId);
      setDeleteElectionId(null);
    }
  };

  const handleStatusChange = (electionId: string, newStatus: 'scheduled' | 'active' | 'completed') => {
    updateElection(electionId, { status: newStatus });
  };

  const handleDuplicateElection = async (election: any) => {
    try {
      // Create a deep copy of the election object excluding the ID
      const { id, _id, ...electionData } = election;

      const newElection = {
        ...electionData,
        title: `${election.title} (Copy)`,
        status: 'scheduled', // Always start as scheduled
        candidates: election.candidates.map((c: any) => ({
          ...c,
          votes: 0 // Reset votes
        })),
        created_at: new Date().toISOString(),
        start_time: new Date().toISOString(), // Reset start time to now
        end_time: new Date(Date.now() + 86400000).toISOString(), // Default end time 24h from now
        resultsPublished: false
      };

      await addElection(newElection);
      toast.success('Election duplicated successfully');
    } catch (error) {
      console.error('Error duplicating election:', error);
      toast.error('Failed to duplicate election');
    }
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

      </div>

      {elections.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="pt-10 pb-10 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">No elections created yet</p>
            <Button onClick={() => navigate('/admin/create-election')} className="bg-red-600 hover:bg-red-700 text-white">
              Create First Election
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {elections.map((election) => (
            <Card key={election.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-snug">{election.title}</CardTitle>
                    <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{election.description}</CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(election.status)} dark:bg-opacity-20 shrink-0 font-bold px-3 py-1`}>
                    {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500 mb-0.5">Department</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{election.department}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500 mb-0.5">Position</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{election.standing_post}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500 mb-0.5">Candidates</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{election.candidates?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500 mb-0.5">Total Votes</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {election.candidates?.reduce((sum: number, c: any) => sum + c.votes, 0) || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-2">


                  {election.status === 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(election.id, 'active')}
                      className="flex-1 sm:flex-none text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    >
                      Activate
                    </Button>
                  )}

                  {election.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(election.id, 'completed')}
                      className="flex-1 sm:flex-none text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    >
                      Complete
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/edit-election/${election.id}`)}
                    className="aspect-square h-8 w-8 p-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateElection(election)}
                    title="Duplicate Election"
                    className="aspect-square h-8 w-8 p-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteElectionId(election.id)}
                    className="sm:ml-auto aspect-square h-8 w-8 p-0 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-none shadow-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteElectionId} onOpenChange={() => setDeleteElectionId(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogTitle className="text-gray-900 dark:text-white font-bold">Delete Election</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this election? This action cannot be undone and all voting data will be lost.
          </AlertDialogDescription>
          <div className="flex gap-4 justify-end mt-4">
            <AlertDialogCancel className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteElection} className="bg-red-600 hover:bg-red-700 text-white font-bold border-none">
              Delete Election
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageElections;
