import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';
import Dialog from '@/components/common/Dialog';
import Input from '@/components/common/Input';

export default function SignIn() {
  const navigate = useNavigate();
  const { signInAsGuest, signInWithGoogle, signInWithEmail, signInWithFacebook } = useAuthStore();
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    setShowOfflineModal(true);
  };

  const handleEmailSignIn = async () => {
    await signInWithEmail(email, password);
    setShowOfflineModal(true);
  };

  const handleFacebookSignIn = async () => {
    await signInWithFacebook();
    setShowOfflineModal(true);
  };

  const handleGuestSignIn = async () => {
    await signInAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">KuLe Fitness</h1>
          <p className="text-gray-600 dark:text-gray-400">Your personal workout tracker</p>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleGuestSignIn}
          >
            Continue as Guest
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleFacebookSignIn}
          >
            Continue with Facebook
          </Button>

          <div className="mt-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-4"
            />
            <Button
              variant="secondary"
              size="lg"
              className="w-full mt-4"
              onClick={handleEmailSignIn}
            >
              Sign In with Email
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        title="Offline Mode"
        size="md"
      >
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This app currently runs in offline mode. Authentication features are not yet implemented.
          Please use "Continue as Guest" to start tracking your workouts.
        </p>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => {
            setShowOfflineModal(false);
            handleGuestSignIn();
          }}
        >
          Continue as Guest
        </Button>
      </Dialog>
    </div>
  );
}

