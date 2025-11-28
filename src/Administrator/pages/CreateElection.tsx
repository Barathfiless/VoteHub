import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useElections, Candidate, Election } from '@/context/ElectionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CandidateForm extends Candidate {
  photoPreview: string | null;
}

const CreateElection = () => {
  const navigate = useNavigate();
  const { addElection } = useElections();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    standing_post: '',
    start_time: '',
    end_time: '',
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCandidatePhotoChange = (candidateId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setCandidates(candidates.map(c => 
          c.id === candidateId 
            ? { ...c, photoPreview: base64String }
            : c
        ));
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
      // Create election with candidates
      const candidatesData: Candidate[] = candidates.map(c => ({
        id: c.id,
        name: c.name,
        photo: c.photoPreview,
        bio: c.bio,
        department: c.department,
        year: c.year,
        manifesto: c.manifesto,
        votes: 0,
      }));

      const newElection: Election = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        department: formData.department,
        standing_post: formData.standing_post,
        logo_url: logoPreview,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        status: 'scheduled',
        created_by: 'admin-demo',
        candidates: candidatesData,
        created_at: new Date().toISOString(),
      };

      await addElection(newElection);
      toast.success('Election created successfully!');
      navigate('/admin/manage');
    } catch (error: any) {
      console.error('Error creating election:', error);
      toast.error(error.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <ThemeToggle />
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl text-gray-900 dark:text-white">Create New Election</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Set up election details, schedule, and add candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Election Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Election Details</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Election Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Student Election"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="standing_post">Standing Post *</Label>
                    <Input
                      id="standing_post"
                      value={formData.standing_post}
                      onChange={(e) => setFormData({ ...formData, standing_post: e.target.value })}
                      placeholder="e.g., Leader"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the election..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Computer Science, All Departments"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Date & Time *</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Date & Time *</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Election Logo (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="flex-1"
                    />
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded object-cover" />
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Candidates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Candidates</h3>
                  <Button type="button" onClick={addCandidate} variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                </div>

                {candidates.map((candidate, index) => (
                  <Card key={candidate.id} className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-gray-900 dark:text-white">Candidate {index + 1}</CardTitle>
                        {candidates.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCandidate(candidate.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Candidate Name *</Label>
                          <Input
                            value={candidate.name}
                            onChange={(e) => updateCandidate(candidate.id, 'name', e.target.value)}
                            placeholder="Full name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Input
                            value={candidate.department}
                            onChange={(e) => updateCandidate(candidate.id, 'department', e.target.value)}
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Year/Class</Label>
                        <Input
                          value={candidate.year}
                          onChange={(e) => updateCandidate(candidate.id, 'year', e.target.value)}
                          placeholder="e.g., 3rd Year, Senior"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Photo</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCandidatePhotoChange(candidate.id, e)}
                            className="flex-1"
                          />
                          {candidate.photoPreview && (
                            <img
                              src={candidate.photoPreview}
                              alt="Candidate preview"
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                          value={candidate.bio}
                          onChange={(e) => updateCandidate(candidate.id, 'bio', e.target.value)}
                          placeholder="Brief biography..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Manifesto</Label>
                        <Textarea
                          value={candidate.manifesto}
                          onChange={(e) => updateCandidate(candidate.id, 'manifesto', e.target.value)}
                          placeholder="Campaign promises and goals..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating Election...' : 'Create Election'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateElection;
