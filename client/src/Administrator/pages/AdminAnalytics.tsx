import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminAnalytics = () => {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

      </div>

      {elections.length === 0 ? (
        <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-10 pb-10 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400 font-medium">No elections to analyze</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Election Selector */}
          <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
              <CardTitle className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Select Election</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {elections.map((election) => (
                  <Button
                    key={election.id}
                    variant={selectedElection?.id === election.id ? 'default' : 'outline'}
                    onClick={() => setSelectedElection(election)}
                    size="sm"
                    className={`text-xs font-bold transition-all ${selectedElection?.id === election.id ? 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900' : 'dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-[#020617]'}`}
                  >
                    {election.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedElection && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="p-4 pt-6">
                    <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 mb-1">Total Votes</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{totalVotes}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="p-4 pt-6">
                    <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 mb-1">Candidates</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-200">{selectedElection.candidates?.length || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="p-4 pt-6 text-left">
                    <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 mb-1">Status</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-200 capitalize truncate">{selectedElection.status}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="p-4 pt-6 text-left">
                    <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 mb-1">Department</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-200 truncate">{selectedElection.department}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-slate-200">Vote Distribution</CardTitle>
                    <CardDescription className="text-xs">Bar representation of votes</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[200px] md:h-[250px]">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            style={{ fontSize: '10px', fontWeight: 'bold' }}
                            stroke="#64748b"
                          />
                          <YAxis style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#64748b" />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="votes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-gray-500 dark:text-slate-400 italic">No votes recorded yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-slate-200">Vote Share</CardTitle>
                    <CardDescription className="text-xs">Percentage distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[200px] md:h-[250px]">
                    {chartData.length > 0 && totalVotes > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius="80%"
                            innerRadius="50%"
                            paddingAngle={5}
                            dataKey="votes"
                          >
                            {chartData.map((_entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-gray-500 dark:text-slate-400 italic">No share data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Leaderboard Cards */}
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-slate-200">Live Leaderboard</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 max-h-[250px] overflow-y-auto">
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                      {selectedElection.candidates?.sort((a: any, b: any) => b.votes - a.votes).map((candidate: any, index: number) => (
                        <div key={candidate.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#1e293b]/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                              }`}>
                              {index + 1}
                            </div>
                            {candidate.photoPreview && (
                              <img
                                src={candidate.photoPreview}
                                alt={candidate.name}
                                className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-slate-900"
                              />
                            )}
                            <div>
                              <p className="font-bold text-gray-900 dark:text-slate-200 text-sm">{candidate.name}</p>
                              <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider leading-none mt-1">{candidate.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-slate-200 leading-none">{candidate.votes}</p>
                            <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase">
                              {totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
