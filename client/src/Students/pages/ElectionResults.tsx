import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ArrowLeft, BarChart3, Users, Trophy } from 'lucide-react';

import { useAuth } from '@/lib/auth';

const ElectionResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { elections } = useElections();
  const [completedElections, setCompletedElections] = useState<any[]>([]);

  useEffect(() => {
    const completed = elections.filter(e =>
      e.status === 'completed' &&
      (e.department === 'All Departments' || e.department === user?.department)
    );
    setCompletedElections(completed);
  }, [elections, user]);

  return (
    <div className="max-w-7xl mx-auto py-8">



      {completedElections.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-12 pb-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No completed elections yet</p>
            <p className="text-gray-500 dark:text-gray-500">Results will appear here once elections are completed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {completedElections.map((election) => {
            const totalVotes = election.candidates?.reduce((sum: number, c: any) => sum + c.votes, 0) || 0;
            const winner = election.candidates?.reduce((prev: any, current: any) =>
              (prev.votes > current.votes) ? prev : current
            );

            return (
              <Card key={election.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{election.title}</CardTitle>
                    <Badge className="bg-green-600 dark:bg-green-700">Completed</Badge>
                  </div>
                  <CardDescription className="text-gray-700 dark:text-gray-400">{election.department}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{election.description}</p>

                  {winner && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-600 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="font-bold text-yellow-900 dark:text-yellow-300">Winner</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{winner.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{winner.votes} votes</p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{election.candidates?.length || 0} Candidates</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <BarChart3 className="w-4 h-4" />
                      <span>{totalVotes} Total Votes</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/results/${election.id}`)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Full Results
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ElectionResults;
