import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { elections } = useElections();
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const electionId = searchParams.get('election');

  useEffect(() => {
    if (electionId) {
      const election = elections.find(e => e.id === electionId);
      setSelectedElection(election);
    } else if (elections.length > 0) {
      setSelectedElection(elections[0]);
    }
  }, [electionId, elections]);

  useEffect(() => {
    if (selectedElection) {
      const data = selectedElection.candidates?.map((c: any) => ({
        name: c.name,
        votes: c.votes,
      })) || [];
      setChartData(data);
    }
  }, [selectedElection]);

  const totalVotes = chartData.reduce((sum: number, item: any) => sum + item.votes, 0);
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Vote Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Analyze voting trends and statistics</p>
        </div>

        {elections.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No elections to analyze</p>
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
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-4 mb-8">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Votes</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalVotes}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Candidates</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{selectedElection.candidates?.length || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedElection.status}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Department</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedElection.department}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Bar Chart */}
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Vote Distribution</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">Votes per candidate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Bar dataKey="votes" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-gray-600 dark:text-gray-400 py-8">No votes yet</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pie Chart */}
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Vote Percentage</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">Distribution by percentage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {chartData.length > 0 && totalVotes > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, votes }) => `${name}: ${Math.round((votes / totalVotes) * 100)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="votes"
                            >
                              {chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-gray-600 dark:text-gray-400 py-8">No votes yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Candidate Details */}
                <Card className="mt-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Candidate Details</CardTitle>
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
