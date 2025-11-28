import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ArrowLeft, Clock, Users, Calendar } from 'lucide-react';

function UpcomingElections() {
  const navigate = useNavigate();
  const { elections, loading } = useElections();
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => {
    if (elections && elections.length > 0) {
      const scheduledElections = elections.filter(e => e.status === 'scheduled');
      setUpcoming(scheduledElections);
      console.log('Scheduled elections found:', scheduledElections.length);
    }
  }, [elections]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Upcoming Elections
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading elections...' : `${upcoming.length} scheduled elections`}
          </p>
        </div>

        {loading && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">Loading elections...</p>
            </CardContent>
          </Card>
        )}

        {!loading && upcoming.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No upcoming elections scheduled</p>
            </CardContent>
          </Card>
        )}

        {!loading && upcoming.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((election) => (
              <Card key={election.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{election.title}</CardTitle>
                    <Badge className="bg-purple-600 dark:bg-purple-700 text-white">Scheduled</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{election.department}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{election.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>{election.candidates?.length || 0} candidates</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>{election.standing_post}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>{formatDate(election.start_time)}</span>
                    </div>
                  </div>

                  <Button disabled className="w-full mt-4 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingElections;
