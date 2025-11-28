import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, CheckCircle2, Trophy } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PostResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { elections, updateElection } = useElections();
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const electionId = searchParams.get('election');

  useEffect(() => {
    if (electionId) {
      const election = elections.find(e => e.id === electionId);
      setSelectedElection(election);
    } else if (elections.length > 0) {
      setSelectedElection(elections[0]);
    }
  }, [electionId, elections]);

  const handlePostResults = () => {
    if (!selectedElection) return;
    setShowConfirmDialog(true);
  };

  const confirmPostResults = () => {
    if (!selectedElection) return;
    
    updateElection(selectedElection.id, {
      status: 'completed',
    });

    setShowConfirmDialog(false);
    navigate('/admin/manage');
  };

  const totalVotes = selectedElection?.candidates?.reduce((sum: number, c: any) => sum + c.votes, 0) || 0;
  const winner = selectedElection?.candidates?.reduce((prev: any, current: any) =>
    (prev.votes > current.votes) ? prev : current
  );

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Post Results</h1>
          <p className="text-gray-600 dark:text-gray-400">Publish election results</p>
        </div>

        {elections.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">No elections available</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Election Selector */}
            <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Select Election</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {elections.map((election) => (
                    <Button
                      key={election.id}
                      variant={selectedElection?.id === election.id ? 'default' : 'outline'}
                      onClick={() => setSelectedElection(election)}
                    >
                      {election.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedElection && (
              <>
                {/* Election Info */}
                <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-gray-900 dark:text-white">{selectedElection.title}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">{selectedElection.description}</CardDescription>
                      </div>
                      <Badge className={selectedElection.status === 'completed' ? 'bg-green-600 dark:bg-green-700' : 'bg-blue-600 dark:bg-blue-700'}>
                        {selectedElection.status.charAt(0).toUpperCase() + selectedElection.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedElection.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedElection.standing_post}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Votes</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{totalVotes}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Candidates</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedElection.candidates?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Winner */}
                {winner && (
                  <Card className="mb-8 border-2 border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <CardTitle className="text-gray-900 dark:text-white">Winner</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">Leading candidate</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6">
                        {winner.photoPreview && (
                          <img
                            src={winner.photoPreview}
                            alt={winner.name}
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{winner.name}</p>
                          <p className="text-gray-600 dark:text-gray-400">{winner.department} • {winner.year}</p>
                          <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mt-2">
                            {winner.votes} votes ({totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0}%)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results Preview */}
                <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Results Preview</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">How results will appear to students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedElection.candidates?.map((candidate: any, index: number) => (
                        <div key={candidate.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-4">
                            {candidate.photoPreview && (
                              <img
                                src={candidate.photoPreview}
                                alt={candidate.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">#{index + 1} {candidate.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{candidate.votes}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {selectedElection.status !== 'completed' ? (
                    <>
                      <Button
                        onClick={handlePostResults}
                        className="flex-1"
                        size="lg"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Post Results
                      </Button>
                      <Button
                        onClick={() => navigate('/admin/manage')}
                        variant="outline"
                        size="lg"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => navigate('/admin/manage')}
                      className="w-full"
                      size="lg"
                    >
                      Back to Manage Elections
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogTitle className="text-gray-900 dark:text-white">Post Results</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            Are you sure you want to post the results for <strong className="text-gray-900 dark:text-white">{selectedElection?.title}</strong>?
            This will make the results visible to all students.
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPostResults} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">Post Results</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostResults;
