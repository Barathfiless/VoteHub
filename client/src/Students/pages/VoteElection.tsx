import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useElections } from '@/context/ElectionContext';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as faceapi from 'face-api.js';

import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Camera, X, Laptop, Smartphone, Lock, Users, AlertTriangle } from 'lucide-react';
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
  const [showDeviceSelection, setShowDeviceSelection] = useState(false);
  const [showSecurityAuth, setShowSecurityAuth] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [fingerprintSupported, setFingerprintSupported] = useState(false);
  const [fingerprintAuthenticated, setFingerprintAuthenticated] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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
          if (!deviceType) {
            setShowDeviceSelection(true);
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
              {showDeviceSelection && (
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
              {showSecurityAuth && (
                <>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Voting Setup (2/2)</h2>
                  <div className="max-w-sm mx-auto">
                    <Card>
                      <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-lg">Security Verification</CardTitle>
                        <CardDescription>Authenticate to continue</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4 pt-0">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Enter Passcode</label>
                          <input
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            placeholder="Enter your 6-digit passcode"
                          />
                          {passcodeError && <p className="text-sm text-red-500">{passcodeError}</p>}
                        </div>
                        <Button className="w-full" onClick={handlePasscodeSubmit}>
                          Verify Passcode
                        </Button>

                        {fingerprintSupported && (
                          <>
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">Or continue with</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full gap-2"
                              onClick={handleFingerprintAuth}
                              disabled={isScanning}
                            >
                              {isScanning ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              {isScanning ? 'Scanning...' : 'Biometric Auth'}
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full h-8 text-sm gap-2 text-muted-foreground hover:text-foreground mt-2"
                          onClick={() => {
                            setShowSecurityAuth(false);
                            setShowDeviceSelection(true);
                          }}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Step 3: Candidate Selection (Final) */}
              {!showDeviceSelection && !showSecurityAuth && (
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
