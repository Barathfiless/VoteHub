import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ArrowLeft, Users, Calendar, Vote } from 'lucide-react';

const VoteElections = () => {
  const navigate = useNavigate();
  const { elections } = useElections();
  const [activeElections, setActiveElections] = useState<any[]>([]);

  useEffect(() => {
    // Show all active elections regardless of time window
    const active = elections.filter(e => e.status === 'active');
    setActiveElections(active);
  }, [elections]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Vote in Elections</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Cast your vote in active elections</p>
        </div>

        {activeElections.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Vote className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No active elections at the moment</p>
              <p className="text-gray-500 dark:text-gray-500">Check back later for upcoming elections</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeElections.map((election) => (
              <Card key={election.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{election.title}</CardTitle>
                    <Badge className="bg-green-600 dark:bg-green-700">Active</Badge>
                  </div>
                  <CardDescription className="text-gray-700 dark:text-gray-400">{election.department}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{election.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{election.candidates?.length || 0} Candidates</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{election.standing_post}</span>
                    </div>
                  </div>

                  {election.candidates && election.candidates.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Candidates:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {election.candidates.slice(0, 3).map((candidate: any) => (
                          <div key={candidate.id} className="flex flex-col items-center gap-1">
                            {candidate.photo || candidate.photoPreview ? (
                              <img
                                src={candidate.photo || candidate.photoPreview}
                                alt={candidate.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <Users className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                              </div>
                            )}
                            <p className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">{candidate.name}</p>
                          </div>
                        ))}
                        {election.candidates.length > 3 && (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">+{election.candidates.length - 3}</span>
                            </div>
                            <p className="text-xs text-center text-gray-600 dark:text-gray-400">More</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => navigate(`/vote/${election.id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
                  >
                    <Vote className="w-4 h-4 mr-2" />
                    Vote Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteElections;
