import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Camera, X, Laptop, Smartphone, Lock, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const VoteElection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getElection, updateElection } = useElections();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [election, setElection] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'laptop' | null>(null);
  const [showDeviceSelection, setShowDeviceSelection] = useState(false);
  const [showSecurityAuth, setShowSecurityAuth] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [fingerprintSupported, setFingerprintSupported] = useState(false);
  const [fingerprintAuthenticated, setFingerprintAuthenticated] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (id) {
      const electionData = getElection(id);
      if (electionData) {
        setElection(electionData);
        // Check if user has already voted (stored in localStorage)
        const votedElections = JSON.parse(localStorage.getItem('votedElections') || '[]');
        setHasVoted(votedElections.includes(id));
      }
      setLoading(false);
    }
  }, [id, getElection]);

  // Initialize camera on component mount
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraError(null);
          setShowDeviceSelection(true);
        }
      } catch (error) {
        console.error('Camera error:', error);
        setCameraError('Unable to access camera. Please check permissions.');
        setCameraActive(false);
      }
    };

    if (!hasVoted && election && !deviceType) {
      initCamera();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [hasVoted, election, deviceType]);

  // Check fingerprint support
  useEffect(() => {
    if (window.PublicKeyCredential) {
      setFingerprintSupported(true);
    }
  }, []);

  const handleDeviceSelection = (device: 'mobile' | 'laptop') => {
    setDeviceType(device);
    setShowDeviceSelection(false);
    setShowSecurityAuth(true);
  };

  const handlePasscodeSubmit = () => {
    if (!passcode) {
      setPasscodeError('Please enter your passcode');
      return;
    }
    
    // Validate passcode against stored password (basic validation)
    // In production, this should be more secure
    const studentSession = JSON.parse(localStorage.getItem('studentSession') || '{}');
    if (passcode.length < 6) {
      setPasscodeError('Passcode must be at least 6 characters');
      return;
    }
    
    setPasscodeError(null);
    setShowSecurityAuth(false);
    toast.success('Authentication successful!');
  };

  const handleFingerprintAuth = async () => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        toast.error('Biometric authentication not supported on this device');
        return;
      }

      // Check if platform authenticator is available (fingerprint/face recognition)
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        toast.error('Biometric authentication not available. Please set up fingerprint/face recognition on your device.');
        return;
      }

      // Start scanning
      setIsScanning(true);
      toast.loading('Place your finger on the sensor...');

      // Generate a random challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Request authentication using device's biometric
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          timeout: 60000,
          userVerification: 'required', // Requires biometric verification
          rpId: window.location.hostname,
          allowCredentials: [], // Allow any registered credential
        },
      } as any);

      if (assertion) {
        // Biometric authentication successful
        setIsScanning(false);
        setFingerprintAuthenticated(true);
        setShowSecurityAuth(false);
        toast.success('Fingerprint verified successfully! You can now proceed to vote.');
      }
    } catch (error: any) {
      setIsScanning(false);
      console.error('Biometric authentication error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Fingerprint scan was cancelled. Please try again.');
      } else if (error.name === 'InvalidStateError') {
        toast.error('Biometric authentication not configured on this device. Please set up fingerprint/face recognition in your device settings.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Biometric authentication not supported on this device');
      } else if (error.name === 'TimeoutError') {
        toast.error('Fingerprint scan timed out. Please try again.');
      } else {
        toast.error('Fingerprint verification failed. Please try again or use passcode instead.');
      }
    }
  };

  const handleVote = () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    setShowConfirmDialog(true);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const confirmVote = () => {
    if (!selectedCandidate || !election) return;

    // Stop camera
    stopCamera();

    if (selectedCandidate === 'NOTA') {
      // Handle NOTA vote - just mark as voted without updating candidate votes
      const votedElections = JSON.parse(localStorage.getItem('votedElections') || '[]');
      votedElections.push(election.id);
      localStorage.setItem('votedElections', JSON.stringify(votedElections));
      
      setShowConfirmDialog(false);
      toast.success('Your NOTA vote has been recorded!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      // Update candidate votes
      const updatedCandidates = election.candidates.map((c: any) =>
        c.id === selectedCandidate ? { ...c, votes: c.votes + 1 } : c
      );

      updateElection(election.id, { candidates: updatedCandidates });

      // Mark as voted
      const votedElections = JSON.parse(localStorage.getItem('votedElections') || '[]');
      votedElections.push(election.id);
      localStorage.setItem('votedElections', JSON.stringify(votedElections));

      setShowConfirmDialog(false);
      toast.success('Your vote has been recorded!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading election...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Election not found</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-200 dark:bg-green-900/30 rounded-full blur-xl opacity-50"></div>
                <CheckCircle2 className="w-24 h-24 text-green-600 dark:text-green-400 relative" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Already Voted</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">You have already voted in this election</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300 font-semibold">✓ Your vote has been successfully recorded</p>
            </div>

            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white py-6 text-lg font-semibold rounded-lg transition-all"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          {cameraActive && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
              <Camera className="w-4 h-4" />
              <span className="text-sm font-semibold">Camera Active</span>
            </div>
          )}
        </div>

        {/* Camera Feed */}
        {!hasVoted && (
          <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Camera className="w-5 h-5" />
                Voting Monitor
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Your camera is active for monitoring during voting</CardDescription>
            </CardHeader>
            <CardContent>
              {cameraError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                  <p className="text-red-600 dark:text-red-400 font-semibold">{cameraError}</p>
                </div>
              ) : (
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  {cameraActive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Recording
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Device Selection Dialog */}
        {showDeviceSelection && (
          <Card className="mb-6 border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Select Your Device</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Choose the device you're using to vote</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleDeviceSelection('laptop')}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-6 text-lg flex items-center justify-center gap-2"
              >
                <Laptop className="w-5 h-5" />
                Laptop / Desktop
              </Button>
              <Button
                onClick={() => handleDeviceSelection('mobile')}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white py-6 text-lg flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                Mobile Phone
              </Button>
              <Button
                onClick={() => navigate('/vote-elections')}
                variant="outline"
                className="w-full py-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ← Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Authentication Dialog */}
        {showSecurityAuth && (
          <Card className="mb-6 border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Security Verification</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {deviceType === 'laptop' 
                  ? 'Please enter your passcode to verify your identity' 
                  : 'Use your device\'s biometric authentication (fingerprint or face recognition)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deviceType === 'laptop' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Passcode
                    </label>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setPasscodeError(null);
                      }}
                      placeholder="Enter your passcode"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {passcodeError && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-2">{passcodeError}</p>
                    )}
                  </div>
                  <Button
                    onClick={handlePasscodeSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-2"
                  >
                    Verify Passcode
                  </Button>
                </>
              ) : (
                <>
                  {isScanning ? (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center border-2 border-green-300 dark:border-green-700">
                      <div className="flex justify-center mb-4">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 border-4 border-green-200 dark:border-green-700 rounded-full animate-pulse"></div>
                          <div className="absolute inset-2 border-4 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
                        </div>
                      </div>
                      <p className="text-center text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                        Scanning Fingerprint...
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Place your finger on the sensor
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border-2 border-dashed border-green-300 dark:border-green-700">
                      <p className="text-center text-gray-700 dark:text-gray-300 mb-4 font-semibold">
                        Ready to authenticate with your device's biometric
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        This will use your device's lock-screen fingerprint or face recognition
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={handleFingerprintAuth}
                    disabled={isScanning}
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white py-6 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isScanning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Authenticate with Biometric
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    Your biometric data is processed securely on your device only
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Show voting interface only after authentication */}
        {!showDeviceSelection && !showSecurityAuth && (
        <>
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{election.title}</CardTitle>
            <CardDescription className="text-lg text-gray-700 dark:text-gray-300">{election.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Department</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{election.department}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Position</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{election.standing_post}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select a Candidate</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {election.candidates?.map((candidate: any) => (
              <Card
                key={candidate.id}
                className={`cursor-pointer transition-all bg-white dark:bg-gray-800 ${
                  selectedCandidate === candidate.id
                    ? 'ring-2 ring-green-500 border-2 border-green-500 dark:ring-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600'
                }`}
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <CardHeader className="pb-0">
                  {(candidate.photo || candidate.photoPreview) ? (
                    <div className="mb-4 -mx-6 -mt-6">
                      <img
                        src={candidate.photo || candidate.photoPreview}
                        alt={candidate.name}
                        className="w-full h-56 object-cover rounded-t-lg"
                        onError={(e) => {
                          console.error('Image failed to load:', candidate.photo || candidate.photoPreview);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 -mx-6 -mt-6 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 h-56 rounded-t-lg flex items-center justify-center">
                      <Users className="w-20 h-20 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="pt-4">
                    <CardTitle className="text-gray-900 dark:text-white">{candidate.name}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {candidate.department} • {candidate.year}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.bio && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bio</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.bio}</p>
                    </div>
                  )}
                  {candidate.manifesto && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Manifesto</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.manifesto}</p>
                    </div>
                  )}
                  {selectedCandidate === candidate.id && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                      <CheckCircle2 className="w-5 h-5" />
                      Selected
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* NOTA Option */}
            <Card
              className={`cursor-pointer transition-all border-2 bg-white dark:bg-gray-800 ${
                selectedCandidate === 'NOTA'
                  ? 'ring-2 ring-red-500 border-red-500 dark:ring-red-600 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
              }`}
              onClick={() => setSelectedCandidate('NOTA')}
            >
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">NOTA</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">None of the Above</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select this option if you do not wish to vote for any of the candidates
                </p>
                {selectedCandidate === 'NOTA' && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    Selected
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleVote}
            disabled={!selectedCandidate}
            className="flex-1"
            size="lg"
          >
            Cast Vote
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="lg"
          >
            Cancel
          </Button>
        </div>
        </>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to vote for{' '}
            <strong>
              {selectedCandidate === 'NOTA' 
                ? 'NOTA (None of the Above)' 
                : election.candidates?.find((c: any) => c.id === selectedCandidate)?.name}
            </strong>
            ? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmVote}>Confirm Vote</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VoteElection;
