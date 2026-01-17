import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trophy } from 'lucide-react';
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
      resultsPublished: true, // Explicitly publish results
    });

    setShowConfirmDialog(false);
  };

  const totalVotes = selectedElection?.candidates?.reduce((sum: number, c: any) => sum + c.votes, 0) || 0;
  const winner = selectedElection?.candidates?.reduce((prev: any, current: any) =>
    (prev?.votes > current?.votes) ? prev : current
    , null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

      </div>

      {elections.length === 0 ? (
        <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-10 pb-10 text-center">
            <p className="text-gray-600 dark:text-slate-400">No elections available</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Election Selector */}
          <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">Select Election</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {elections.map((election) => (
                  <Button
                    key={election.id}
                    variant={selectedElection?.id === election.id ? 'default' : 'outline'}
                    onClick={() => setSelectedElection(election)}
                    size="sm"
                    className={`text-xs font-semibold ${selectedElection?.id === election.id ? 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900' : 'dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-[#020617]'}`}
                  >
                    {election.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedElection && (
            <div className="space-y-6">
              {/* Election Details */}
              <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 text-left">
                    <div className="flex-1">
                      <CardTitle className="text-lg md:text-xl font-bold text-gray-900 dark:text-slate-200">{selectedElection.title}</CardTitle>
                      <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-slate-400 mt-1">{selectedElection.description}</CardDescription>
                    </div>
                    <Badge className={selectedElection.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}>
                      {selectedElection.status.charAt(0).toUpperCase() + selectedElection.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-[#1e293b]/50 border border-gray-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400 mb-0.5">Department</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-200 line-clamp-1">{selectedElection.department}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400 mb-0.5">Position</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-200 line-clamp-1">{selectedElection.standing_post}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400 mb-0.5">Total Votes</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{totalVotes}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400 mb-0.5">Candidates</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">{selectedElection.candidates?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Winner Highlight */}
              {winner && (
                <Card className="border-2 border-yellow-400 dark:border-yellow-600/50 bg-gradient-to-br from-yellow-50 to-white dark:from-[#020617] dark:to-[#1e293b] shadow-md shadow-yellow-500/5 mb-4">
                  <CardHeader className="py-2 px-3 md:px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-full bg-yellow-400 text-white shadow-sm">
                        <Trophy className="w-3 h-3" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-200 text-left">Election Winner</CardTitle>
                        <CardDescription className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-500">Leading the polls</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-3 md:px-4 pb-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {winner.photoPreview ? (
                        <div className="relative shrink-0">
                          <img
                            src={winner.photoPreview}
                            alt={winner.name}
                            className="w-12 h-12 rounded-lg object-cover border border-white dark:border-slate-700 shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-white dark:border-slate-700 shadow-sm shrink-0">
                          <Trophy className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                        </div>
                      )}
                      <div className="text-center sm:text-left space-y-0.5">
                        <p className="text-lg font-bold text-gray-900 dark:text-slate-200 leading-tight">{winner.name}</p>
                        <p className="text-[10px] font-medium text-gray-600 dark:text-slate-400">{winner.department} • {winner.year}</p>
                        <div className="inline-block px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
                          <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400 leading-none">
                            {winner.votes} <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Votes</span>
                            <span className="ml-1 text-[10px] opacity-60">({totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0}%)</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Results Table/List */}
              <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="py-2 px-3 md:px-4">
                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-200">Detailed Results</CardTitle>
                  <CardDescription className="text-[10px] text-gray-600 dark:text-slate-400">Vote distribution among all candidates</CardDescription>
                </CardHeader>
                <CardContent className="py-0 px-3 md:px-4 pb-2">
                  <div className="space-y-1.5">
                    {selectedElection.candidates?.map((candidate: any, index: number) => (
                      <div key={candidate.id} className="group flex items-center justify-between p-1.5 border border-gray-100 dark:border-slate-800 rounded-md bg-slate-50/30 dark:bg-[#1e293b]/30 hover:bg-slate-50 dark:hover:bg-[#1e293b]/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center font-bold text-[10px] text-gray-400 dark:text-slate-500">
                            #{index + 1}
                          </div>
                          {candidate.photoPreview && (
                            <img
                              src={candidate.photoPreview}
                              alt={candidate.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-white dark:ring-slate-700 shadow-sm"
                            />
                          )}
                          <div>
                            <p className="font-bold text-gray-900 dark:text-slate-200 text-xs">{candidate.name}</p>
                            <p className="text-[8px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{candidate.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-slate-200">{candidate.votes}</p>
                          <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400">
                            {totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {!selectedElection.resultsPublished ? (
                  <>
                    <Button
                      onClick={handlePostResults}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-lg shadow-blue-500/20"
                      size="lg"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Post Results
                    </Button>
                    <Button
                      onClick={() => navigate('/admin/manage')}
                      variant="outline"
                      size="lg"
                      className="flex-1 h-12 font-bold dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-[#020617]"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-green-600/20 text-green-600 dark:bg-green-500/10 dark:text-green-400 font-bold h-12 border border-green-200/50 dark:border-green-900/50"
                    size="lg"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Posted
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800">
          <AlertDialogTitle className="text-gray-900 dark:text-slate-200 font-bold">Post Election Results</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-slate-400">
            Are you sure you want to finalize and post the results for <strong className="text-gray-900 dark:text-white">{selectedElection?.title}</strong>?
            This will make the results visible to all students and mark the election as completed.
          </AlertDialogDescription>
          <div className="flex gap-4 justify-end mt-4">
            <AlertDialogCancel className="font-bold dark:bg-[#1e293b] dark:text-slate-200 dark:border-slate-700 dark:hover:bg-[#0f172a]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPostResults} className="bg-blue-600 hover:bg-blue-700 text-white font-bold border-none">
              Confirm & Post
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostResults;
