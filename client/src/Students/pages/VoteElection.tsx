import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as faceapi from 'face-api.js';

import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Camera, X, Laptop, Smartphone, Lock, Users, AlertTriangle, Fingerprint, KeyRound } from 'lucide-react';
import { loginStudent } from '@/integrations/mongo/authService';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionInterval = useRef<any>(null);

  const [election, setElection] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'laptop' | null>(null);
  const [currentStep, setCurrentStep] = useState<'device_selection' | 'security_auth' | 'voting'>('device_selection');

  // Removed individual boolean states to strictly enforce flow order
  // const [showDeviceSelection, setShowDeviceSelection] = useState(true);
  // const [showSecurityAuth, setShowSecurityAuth] = useState(false);
  // const [securityVerified, setSecurityVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fingerprintSupported, setFingerprintSupported] = useState(false);
  const [fingerprintAuthenticated, setFingerprintAuthenticated] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

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

  // Load Face API Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face models:', error);
        toast.error('Failed to load face detection models');
      }
    };
    loadModels();
  }, []);

  // Initialize camera on component mount - removed deviceType dependency to prevent camera stopping
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
          // Only show device selection if we haven't selected one yet
          if (!deviceType && currentStep !== 'voting') {
            // If we're not already voting, ensure we're at least selecting a device or authenticating
            if (currentStep !== 'security_auth') {
              setCurrentStep('device_selection');
            }
          }
        }
      } catch (error) {
        console.error('Camera error:', error);
        setCameraError('Unable to access camera. Please check permissions.');
        setCameraActive(false);
      }
    };

    if (!hasVoted && election) {
      initCamera();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [hasVoted, election]); // Removed deviceType from dependencies

  const handleVideoPlay = () => {
    if (detectionInterval.current) clearInterval(detectionInterval.current);

    detectionInterval.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current && modelsLoaded && cameraActive) {
        if (videoRef.current.paused || videoRef.current.ended) return;

        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        };

        // Match canvas dimensions to video source dimensions
        if (canvasRef.current.width !== displaySize.width || canvasRef.current.height !== displaySize.height) {
          faceapi.matchDimensions(canvasRef.current, displaySize);
        }

        // Detect faces with a lower threshold for better sensitivity
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
        );

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          faceapi.draw.drawDetections(canvas, resizedDetections);
          ctx.restore();
        }

        if (detections.length > 0) {
          setFaceDetected(true);
        } else {
          setFaceDetected(false);
        }
      }
    }, 500);
  };


  // Check fingerprint support
  useEffect(() => {
    if (window.PublicKeyCredential) {
      setFingerprintSupported(true);
    }
  }, []);

  const handleDeviceSelection = (device: 'mobile' | 'laptop') => {
    setDeviceType(device);
    setCurrentStep('security_auth');
  };
  const handlePasswordSubmit = async () => {
    if (!password) {
      setPasswordError('Please enter your password');
      return;
    }

    if (!user?.rollNo) {
      toast.error('User session error. Please log in again.');
      return;
    }

    setIsVerifyingPassword(true);
    try {
      const student = await loginStudent(user.rollNo, password);
      if (student) {
        setPasswordError(null);
        setCurrentStep('voting');
        toast.success('Authentication successful!');
      } else {
        setPasswordError('Invalid password. Please try again.');
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setPasswordError('Error verifying password');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleFingerprintAuth = async () => {
    // Ensure we have a valid user ID for storage key
    const currentUserId = user?.id || user?.rollNo || 'anonymous';
    const storageKey = `votehub_biometric_${currentUserId}`;

    try {
      if (!window.PublicKeyCredential) {
        toast.error('Biometric authentication not supported on this device');
        return;
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        toast.error('Biometric authentication not available. Please set up fingerprint/face recognition on your device.');
        return;
      }

      setIsScanning(true);

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Check if we have already registered a biometric credential 
      const storedCredId = localStorage.getItem(storageKey);

      if (storedCredId && storedCredId !== 'undefined' && storedCredId !== 'null') {
        try {
          const credId = Uint8Array.from(atob(storedCredId), c => c.charCodeAt(0));

          const assertion = await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'required',
              rpId: window.location.hostname,
              allowCredentials: [{
                id: credId,
                type: 'public-key',
                transports: ['internal'],
              }],
            },
          }) as any;

          if (assertion) {
            setIsScanning(false);
            setFingerprintAuthenticated(true);
            setCurrentStep('voting');
            toast.success('Verified successfully!');
            return;
          }
        } catch (getErr: any) {
          console.warn('Biometric "get" failed, trying "create" as fallback:', getErr);
          // If the stored credential is no longer valid or found on device, clear it
          if (getErr.name === 'NotFoundError' || getErr.name === 'InvalidStateError') {
            localStorage.removeItem(storageKey);
          } else if (getErr.name === 'NotAllowedError') {
            setIsScanning(false);
            toast.error('Verification cancelled.');
            return;
          }
          // Continue to "create" flow as fallback
        }
      }

      // "Create" flow (First time or fallback) - Prompts for Phone Lock
      toast.info('Linking your device lock...', { duration: 2000 });

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "VoteHub", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(currentUserId),
            name: user?.name || 'Voter',
            displayName: user?.name || 'Voter',
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        }
      }) as any;

      if (credential) {
        const idBase64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        localStorage.setItem(storageKey, idBase64);

        setIsScanning(false);
        setFingerprintAuthenticated(true);
        setCurrentStep('voting');
        toast.success('Phone lock verified and linked!');
      }
    } catch (error: any) {
      setIsScanning(false);
      console.error('Biometric authentication error:', error);

      if (error.name === 'NotAllowedError') {
        toast.error('Action cancelled.');
      } else {
        toast.error('Device lock verification failed. Please use your password.');
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
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
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
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-6">
        {cameraActive && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full w-fit">
              <Camera className="w-4 h-4" />
              <span className="text-sm font-semibold">Camera Active</span>
            </div>
            {modelsLoaded && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${faceDetected ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {faceDetected ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span className="text-sm font-semibold">{faceDetected ? 'Face Detected' : 'No Face Detected'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Layout */}
      {!hasVoted && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="overflow-hidden bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex flex-col md:flex-row h-full">
              {/* Logo Section */}
              {election.logo_url && (
                <div className="md:w-40 h-24 md:h-auto relative border-b md:border-b-0 md:border-r border-blue-200 dark:border-blue-700 shrink-0">
                  <img
                    src={election.logo_url}
                    alt={election.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Info Section */}
              <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                <CardHeader className="p-0 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-0.5 truncate">{election.title}</CardTitle>
                      <CardDescription className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{election.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-1.5 px-3 border border-blue-100 dark:border-blue-800">
                      <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Department</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{election.department}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-1.5 px-3 border border-blue-100 dark:border-blue-800">
                      <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Position</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{election.standing_post}</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Left Column: Video Monitor */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Video Monitor</h2>
              <Card className="h-fit flex flex-col border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  {cameraError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                      <p className="text-red-600 dark:text-red-400 font-semibold">{cameraError}</p>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        onPlay={handleVideoPlay}
                        className="w-full h-full object-contain transform scale-x-[-1]"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none transform scale-x-[-1]"
                      />
                      {cameraActive && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          Recording
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Workflow Steps */}
            <div className="space-y-4">

              {/* Step 1: Device Selection */}
              {currentStep === 'device_selection' && (
                <>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Voting Setup (1/2)</h2>
                  <div className="max-w-sm mx-auto">
                    <Card>
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg">Select Voting Device</CardTitle>
                        <CardDescription>Select the device you are using</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3 p-4 pt-0">
                        <Button
                          variant="outline"
                          className="h-16 text-base gap-3 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => handleDeviceSelection('laptop')}
                        >
                          <Laptop className="w-5 h-5" />
                          This Laptop/PC
                        </Button>
                        <Button
                          variant="outline"
                          className="h-16 text-base gap-3 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => handleDeviceSelection('mobile')}
                        >
                          <Smartphone className="w-5 h-5" />
                          Mobile Device
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-10 text-sm gap-2 text-muted-foreground hover:text-foreground"
                          onClick={() => navigate('/dashboard')}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Step 2: Security Auth */}
              {currentStep === 'security_auth' && (
                <>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Voting Setup (2/2)</h2>
                  <div className="max-w-[360px] mx-auto w-full">
                    <Card className="bg-[#030712] border border-gray-800 shadow-2xl rounded-2xl p-6">
                      <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                          <Lock className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Security Verification</h2>
                        <p className="text-gray-400 text-sm">Authenticate to continue</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white flex justify-start">Enter Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                            placeholder="Enter your account password"
                            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                          />
                          {passwordError && (
                            <p className="text-xs text-red-500 font-medium mt-1">{passwordError}</p>
                          )}
                        </div>

                        <Button
                          className="w-full h-12 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded-xl font-bold text-base transition-colors"
                          onClick={handlePasswordSubmit}
                          disabled={isVerifyingPassword}
                        >
                          {isVerifyingPassword ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Verifying...
                            </div>
                          ) : 'Verify Password'}
                        </Button>

                        {deviceType === 'mobile' && (
                          <>
                            <div className="relative flex items-center py-2">
                              <div className="flex-grow border-t border-gray-800"></div>
                              <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-[#030712] px-2">OR CONTINUE WITH</span>
                              <div className="flex-grow border-t border-gray-800"></div>
                            </div>

                            <Button
                              variant="outline"
                              className="w-full h-12 bg-transparent border border-gray-800 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-gray-900 transition-all"
                              onClick={handleFingerprintAuth}
                              disabled={isScanning || !fingerprintSupported}
                            >
                              {isScanning ? (
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <span className="font-bold">{isScanning ? 'Scanning...' : 'Biometric Auth'}</span>
                            </Button>
                          </>
                        )}

                        <div className="pt-2">
                          <Button
                            variant="ghost"
                            className="w-full text-gray-400 hover:text-white flex items-center justify-center gap-2"
                            onClick={() => {
                              setCurrentStep('device_selection');
                              setPassword('');
                              setPasswordError(null);
                            }}
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Device Selection
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              )}

              {/* Step 3: Candidate Selection (Final) */}
              {currentStep === 'voting' && (
                <>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Select a Candidate</h2>
                  <div className="space-y-3">
                    {election.candidates?.map((candidate: any) => (
                      <Card
                        key={candidate.id}
                        className={`cursor-pointer transition-all bg-white dark:bg-gray-800 overflow-hidden ${selectedCandidate === candidate.id
                          ? 'ring-2 ring-green-500 border-2 border-green-500 dark:ring-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600'
                          }`}
                        onClick={() => setSelectedCandidate(candidate.id)}
                      >
                        <div className="flex items-center p-3 gap-4">
                          {/* Avatar */}
                          <div className="shrink-0">
                            {candidate.photo || candidate.photoPreview ? (
                              <img
                                src={candidate.photo || candidate.photoPreview}
                                alt={candidate.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{candidate.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{candidate.department} • {candidate.year}</p>
                            {candidate.manifesto && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">"{candidate.manifesto}"</p>
                            )}
                          </div>

                          {/* Selection Indicator */}
                          <div className="shrink-0 px-2">
                            {selectedCandidate === candidate.id ? (
                              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* NOTA Option */}
                    <Card
                      className={`cursor-pointer transition-all border-2 bg-white dark:bg-gray-800 ${selectedCandidate === 'NOTA'
                        ? 'ring-2 ring-red-500 border-red-500 dark:ring-red-600 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
                        }`}
                      onClick={() => setSelectedCandidate('NOTA')}
                    >
                      <div className="flex items-center p-3 gap-4">
                        <div className="shrink-0">
                          <div className="w-16 h-16 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center border border-red-200 dark:border-red-800">
                            <X className="w-8 h-8 text-red-500" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-red-600 dark:text-red-400">NOTA</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">None of the Above</p>
                        </div>
                        <div className="shrink-0 px-2">
                          {selectedCandidate === 'NOTA' ? (
                            <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVote}
                      disabled={!selectedCandidate}
                      size="lg"
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Confirm Vote
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to vote for{' '}
            <strong>
              {selectedCandidate === 'NOTA'
                ? 'NOTA (None of the Above)'
                : election.candidates?.find(c => c.id === selectedCandidate)?.name}
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
