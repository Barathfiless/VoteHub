import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Trophy } from 'lucide-react';

const ViewResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getElection } = useElections();
  
  const [election, setElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const electionData = getElection(id);
      if (electionData) {
        setElection(electionData);
      }
      setLoading(false);
    }
  }, [id, getElection]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Election not found</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalVotes = election.candidates?.reduce((sum: number, c: any) => sum + c.votes, 0) || 0;
  const sortedCandidates = [...(election.candidates || [])].sort((a: any, b: any) => b.votes - a.votes);
  const winner = sortedCandidates[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <ThemeToggle />
        </div>

        <Card className="mb-8 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-3xl text-gray-900 dark:text-white">{election.title} - Results</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">{election.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 font-semibold">Department</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white mt-1">{election.department}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 font-semibold">Position</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white mt-1">{election.standing_post}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-600 dark:text-blue-400 font-semibold">Total Votes</p>
                <p className="font-bold text-2xl text-blue-900 dark:text-blue-300 mt-1">{totalVotes}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-purple-600 dark:text-purple-400 font-semibold">Candidates</p>
                <p className="font-bold text-2xl text-purple-900 dark:text-purple-300 mt-1">{election.candidates?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Detailed Results</h2>
          <div className="space-y-4">
            {sortedCandidates.map((candidate: any, index: number) => {
              const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
              const isWinner = index === 0;
              
              return (
                <Card key={candidate.id} className={isWinner ? 'border-2 border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                      {candidate.photoPreview && (
                        <img
                          src={candidate.photoPreview}
                          alt={candidate.name}
                          className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full">
                                #{index + 1}
                              </span>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{candidate.name}</p>
                              {isWinner && (
                                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {candidate.department} • {candidate.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{candidate.votes}</p>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{percentage}%</p>
                          </div>
                        </div>
                        <Progress
                          value={percentage}
                          className="h-3"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Button onClick={() => navigate('/dashboard')} className="w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ViewResults;
