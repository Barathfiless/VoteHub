import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useElections, Candidate, Election } from '@/context/ElectionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Shield, Calendar, Clock, Image as ImageIcon, Briefcase, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';

interface CandidateForm extends Candidate {
  photoPreview: string | null;
}

const CreateElection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addElection, getElection, updateElection } = useElections();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/departments`);
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'All Departments',
    standing_post: '',
    start_time: '',
    end_time: '',
    eligible_years: 'All Years',
    restrictions: 'None',
  });

  const [candidates, setCandidates] = useState<CandidateForm[]>([
    {
      id: '1',
      name: '',
      photo: null,
      photoPreview: null,
      bio: '',
      department: '',
      year: '',
      manifesto: '',
      votes: 0,
    },
  ]);

  // Load election data if editing
  useEffect(() => {
    if (id) {
      const election = getElection(id);
      if (election) {
        setFormData({
          title: election.title,
          description: election.description,
          department: election.department,
          standing_post: election.standing_post,
          start_time: election.start_time.slice(0, 16), // Format for datetime-local
          end_time: election.end_time.slice(0, 16),
          eligible_years: 'All Years', // Default or fetch if available in schema
          restrictions: 'None',
        });
        setLogoPreview(election.logo_url || null);

        if (election.candidates && election.candidates.length > 0) {
          setCandidates(election.candidates.map((c: any) => ({
            id: c.id,
            name: c.name,
            photo: null,
            photoPreview: c.photo || null,
            bio: c.bio || '',
            department: c.department || '',
            year: c.year || '',
            manifesto: c.manifesto || '',
            votes: c.votes || 0,
          })));
        }
      } else {
        toast.error('Election not found');
        navigate('/admin/manage');
      }
    }
  }, [id, getElection, navigate]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo is too large. Max 5MB allowed.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
        toast.success('Logo uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCandidatePhotoChange = (candidateId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image is too large. Max 5MB allowed.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setCandidates(candidates.map(c =>
          c.id === candidateId ? { ...c, photoPreview: base64String } : c
        ));
        toast.success('Photo uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const addCandidate = () => {
    setCandidates([
      ...candidates,
      {
        id: Date.now().toString(),
        name: '',
        photo: null,
        photoPreview: null,
        bio: '',
        department: '',
        year: '',
        manifesto: '',
        votes: 0,
      },
    ]);
  };

  const removeCandidate = (id: string) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  const updateCandidate = (id: string, field: keyof CandidateForm, value: string) => {
    setCandidates(candidates.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.department ||
      !formData.standing_post || !formData.start_time || !formData.end_time) {
      toast.error('Please fill in all election details');
      return;
    }
    if (candidates.some(c => !c.name)) {
      toast.error('All candidates must have a name');
      return;
    }

    setLoading(true);
    try {
      const candidatesData: Candidate[] = candidates.map(c => ({
        id: c.id,
        name: c.name,
        photo: c.photoPreview,
        bio: c.manifesto.substring(0, 50) || 'Candidate', // Simple fallback for bio
        department: c.department || 'N/A', // Ensure department is not empty
        year: c.year || 'N/A',
        manifesto: c.manifesto || 'Candidate Manifesto',
        votes: c.votes || 0,
      }));

      const electionData: Partial<Election> = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        standing_post: formData.standing_post,
        logo_url: logoPreview,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        candidates: candidatesData,
      };

      if (id) {
        // Update existing election
        await updateElection(id, electionData);
        toast.success('Election updated successfully!');
      } else {
        // Create new election
        const newElection: Election = {
          ...electionData as Election,
          id: Date.now().toString(),
          status: 'scheduled',
          created_by: 'admin-demo',
          created_at: new Date().toISOString(),
        };
        await addElection(newElection);
        toast.success('Election created successfully!');
      }

      navigate('/admin/manage');
    } catch (error: any) {
      console.error('Error saving election:', error);
      toast.error(error.message || 'Failed to save election');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-[1600px] flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
            {/* COLUMN 1: ELECTION DETAILS */}
            <Card className="bg-white dark:bg-card border-neutral-200 dark:border-border backdrop-blur-xl shadow-xl h-fit overflow-hidden">
              <CardHeader className="pb-3 border-b border-neutral-100 dark:border-border/40 px-6 py-4">
                <CardTitle className="flex items-center gap-2.5 text-sm md:text-base font-bold text-neutral-900 dark:text-white tracking-tight font-sans">
                  <div className="flex items-center justify-center w-6 md:w-7 h-6 md:h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-inner shrink-0">
                    <span className="font-bold text-[10px] md:text-xs">01</span>
                  </div>
                  Election Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-1.5 opacity-80">
                    <FileText className="w-3 h-3" />
                    General Information
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-1.5 group">
                      <Label htmlFor="title" className="text-xs text-neutral-500 dark:text-muted-foreground">Election Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="bg-neutral-50 dark:bg-background/80 border-neutral-200 dark:border-border/60 focus:border-primary/50 h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 group">
                      <Label htmlFor="standing_post" className="text-xs text-neutral-500 dark:text-muted-foreground">Target Position *</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                        <Input
                          id="standing_post"
                          value={formData.standing_post}
                          onChange={(e) => setFormData({ ...formData, standing_post: e.target.value })}
                          required
                          className="bg-neutral-50 dark:bg-background/80 border-neutral-200 dark:border-border/60 pl-9 h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 group">
                      <Label htmlFor="description" className="text-xs text-neutral-500 dark:text-muted-foreground">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        required
                        className="bg-neutral-50 dark:bg-background/80 border-neutral-200 dark:border-border/60 text-sm min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-border/40">
                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-1.5 opacity-80">
                    <Clock className="w-3 h-3" />
                    Timeline & Scheduling
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="start_time" className="text-xs text-neutral-500 dark:text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Start Date
                      </Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required
                        className="bg-neutral-50 dark:bg-background/80 border-neutral-200 dark:border-border/60 h-10 text-[11px] md:text-xs px-2"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="end_time" className="text-xs text-neutral-500 dark:text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> End Date
                      </Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        required
                        className="bg-neutral-50 dark:bg-background/80 border-neutral-200 dark:border-border/60 h-10 text-[11px] md:text-xs px-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest opacity-80">
                      <ImageIcon className="w-3 h-3" />
                      Election Branding
                    </div>
                    {logoPreview && (
                      <button type="button" onClick={() => setLogoPreview(null)} className="text-[10px] text-red-600 hover:underline font-bold">Remove</button>
                    )}
                  </div>
                  <div className="relative group/upload h-32 flex items-center justify-center border-2 border-dashed rounded-xl border-neutral-200 dark:border-border/60 bg-neutral-50 dark:bg-background/50 overflow-hidden hover:border-primary/30 transition-all">
                    {logoPreview ? (
                      <div className="flex items-center gap-3 p-4 w-full h-full">
                        <img src={logoPreview} alt="Logo" className="h-full aspect-square object-contain rounded-lg bg-white p-2 border border-neutral-200 shadow-sm" />
                        <div className="flex-1">
                          <h4 className="text-neutral-900 dark:text-white font-bold text-xs">Image uploaded</h4>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Plus className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                        <p className="text-neutral-600 dark:text-slate-300 font-bold text-xs">Upload Logo</p>
                      </div>
                    )}
                    <label className="absolute inset-0 cursor-pointer z-10">
                      <Input type="file" accept="image/*" onChange={handleLogoChange} className="sr-only" />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* COLUMN 2: CANDIDATES + ELIGIBILITY */}
            <div className="space-y-8">
              <Card className="bg-white dark:bg-card border-neutral-200 dark:border-border backdrop-blur-xl shadow-xl h-fit overflow-hidden">
                <CardHeader className="pb-3 border-b border-neutral-100 dark:border-border/40 px-6 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2.5 text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600">
                      <span className="font-bold text-xs">02</span>
                    </div>
                    Candidates
                  </CardTitle>
                  <Button type="button" size="sm" onClick={addCandidate} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-8 shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4 bg-neutral-50/50 dark:bg-background/20">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="relative bg-white dark:bg-background/40 border border-neutral-200 dark:border-border/60 rounded-xl p-4 shadow-sm group/card transition-all hover:border-indigo-500/30">
                      <div className="absolute right-3 top-3 z-10">
                        {candidates.length > 1 && (
                          <button type="button" className="text-neutral-400 hover:text-red-500 transition-colors" onClick={() => removeCandidate(candidate.id)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <div className="shrink-0">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-background border border-neutral-200 dark:border-border/60 group/photo shadow-inner">
                            {candidate.photoPreview ? (
                              <img src={candidate.photoPreview} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Plus className="w-6 h-6 text-neutral-300 dark:text-slate-700" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                              <ImageIcon className="w-5 h-5 mb-1" />
                              <span className="text-[10px] font-bold uppercase">{candidate.photoPreview ? 'Change' : 'Choose'}</span>
                              <label className="absolute inset-0 cursor-pointer z-10">
                                <Input type="file" accept="image/*" className="sr-only" onChange={(e) => handleCandidatePhotoChange(candidate.id, e)} />
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Name *</Label>
                            <Input value={candidate.name} onChange={(e) => updateCandidate(candidate.id, 'name', e.target.value)} required className="h-8 text-xs bg-neutral-50 dark:bg-background/60 border-neutral-200 dark:border-border/60" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Roll No</Label>
                            <Input value={candidate.department} onChange={(e) => updateCandidate(candidate.id, 'department', e.target.value)} className="h-8 text-xs bg-neutral-50 dark:bg-background/60 border-neutral-200 dark:border-border/60" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Motto</Label>
                            <Textarea value={candidate.manifesto} onChange={(e) => updateCandidate(candidate.id, 'manifesto', e.target.value)} className="h-16 text-[11px] bg-neutral-50 dark:bg-background/60 border-neutral-200 dark:border-border/60 resize-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ELIGIBILITY BELOW CANDIDATES */}
              <Card className="bg-white dark:bg-card border-neutral-200 dark:border-border backdrop-blur-xl shadow-xl h-fit overflow-hidden">
                <CardHeader className="pb-3 border-b border-neutral-100 dark:border-border/40 px-6 py-4">
                  <CardTitle className="flex items-center gap-2.5 text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600">
                      <span className="font-bold text-xs">03</span>
                    </div>
                    Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-neutral-500 dark:text-muted-foreground">Target Department *</Label>
                      <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                        <SelectTrigger className="h-9 text-sm bg-neutral-50 dark:bg-background/80 border-neutral-200 dark:border-border/60 focus:ring-primary/20">
                          <SelectValue placeholder="Select Dept" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-card dark:border-border">
                          <SelectItem value="All Departments">All Departments</SelectItem>
                          {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-neutral-500 dark:text-muted-foreground">Target Year *</Label>
                      <Select value={formData.eligible_years} onValueChange={(v) => setFormData({ ...formData, eligible_years: v })}>
                        <SelectTrigger className="h-9 text-sm bg-neutral-50 dark:bg-background/80 border-neutral-200 dark:border-border/60 focus:ring-primary/20">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-card dark:border-border">
                          <SelectItem value="All Years">All Years</SelectItem>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
        <Button onClick={handleSubmit} disabled={loading} className="bg-red-600 hover:bg-red-500 text-white min-w-[160px] shadow-2xl shadow-red-500/30 font-bold h-12 rounded-xl border-none">
          {loading ? 'Processing...' : (id ? 'Update Election' : 'Launch Election')}
        </Button>
      </div>
    </div>
  );
};

export default CreateElection;
