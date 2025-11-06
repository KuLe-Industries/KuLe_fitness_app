import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Dialog from '@/components/common/Dialog';
import ThemeToggle from '@/components/common/ThemeToggle';
import { exportToFile, importFromFile, factoryReset } from '@/utils/export';
import { googleSheetsService } from '@/services/googleSheets';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser, signOut } = useAuthStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [defaultRestSec, setDefaultRestSec] = useState(90);
  const [sheetsApiKey, setSheetsApiKey] = useState('');
  const [sheetsSpreadsheetId, setSheetsSpreadsheetId] = useState('');
  const [useGoogleSheets, setUseGoogleSheets] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setUnits(user.preferences.units);
      setSoundEnabled(user.preferences.soundEnabled);
      setDefaultRestSec(user.preferences.defaultRestSec);
      
      // Load Google Sheets config
      const config = localStorage.getItem('kule_google_sheets_config');
      if (config) {
        try {
          const parsed = JSON.parse(config);
          setSheetsApiKey(parsed.apiKey || '');
          setSheetsSpreadsheetId(parsed.spreadsheetId || '');
          setUseGoogleSheets(parsed.enabled || false);
        } catch (e) {
          console.error('Failed to load Google Sheets config', e);
        }
      }
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    await updateUser({
      displayName,
      preferences: {
        ...user.preferences,
        units,
        soundEnabled,
        defaultRestSec,
      },
    });
    toast.success('Settings saved');
  };

  const handleReset = async () => {
    if (!confirm('Are you sure? This will delete ALL your data and cannot be undone.')) return;
    await factoryReset();
    toast.success('Data reset complete');
    navigate('/signin');
  };

  const handleExport = async () => {
    try {
      await exportToFile();
      toast.success('Data exported');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importFromFile(file);
          toast.success('Data imported successfully');
          window.location.reload();
        } catch (error) {
          toast.error('Failed to import data');
        }
      }
    };
    input.click();
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your preferences and data</p>
      </div>

      {/* Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Theme</label>
            <ThemeToggle />
          </div>
          <Select
            label="Units"
            value={units}
            onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
            options={[
              { value: 'metric', label: 'Metric (kg)' },
              { value: 'imperial', label: 'Imperial (lbs)' },
            ]}
          />
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Sound Enabled</label>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <Input
            label="Default Rest (seconds)"
            type="number"
            value={defaultRestSec}
            onChange={(e) => setDefaultRestSec(parseInt(e.target.value) || 90)}
          />
          <Button variant="primary" onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Google Sheets Integration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Google Sheets Integration</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Sync all your workout data to Google Sheets. You'll need a Google API key and a Google
          Sheets spreadsheet ID.
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable Google Sheets Sync</label>
            <input
              type="checkbox"
              checked={useGoogleSheets}
              onChange={(e) => setUseGoogleSheets(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          {useGoogleSheets && (
            <>
              <Input
                label="Google Sheets API Key"
                type="password"
                value={sheetsApiKey}
                onChange={(e) => setSheetsApiKey(e.target.value)}
                placeholder="Enter your Google API key"
              />
              <Input
                label="Spreadsheet ID"
                value={sheetsSpreadsheetId}
                onChange={(e) => setSheetsSpreadsheetId(e.target.value)}
                placeholder="Enter your Google Sheets ID"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get your API key from{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Google Cloud Console
                </a>
                . Enable the Google Sheets API for your project.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  if (sheetsApiKey && sheetsSpreadsheetId) {
                    googleSheetsService.initialize({
                      apiKey: sheetsApiKey,
                      spreadsheetId: sheetsSpreadsheetId,
                    });
                    localStorage.setItem(
                      'kule_google_sheets_config',
                      JSON.stringify({
                        apiKey: sheetsApiKey,
                        spreadsheetId: sheetsSpreadsheetId,
                        enabled: useGoogleSheets,
                      })
                    );
                    toast.success('Google Sheets configured successfully');
                  } else {
                    toast.error('Please enter both API key and Spreadsheet ID');
                  }
                }}
              >
                Save Google Sheets Config
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button variant="primary" onClick={handleExport}>
              Export Data
            </Button>
            <Button variant="outline" onClick={handleImport}>
              Import Data
            </Button>
          </div>
          <Button variant="destructive" onClick={() => setShowResetDialog(true)}>
            Factory Reset
          </Button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </div>

      <Dialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        title="Factory Reset"
        size="md"
      >
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This will delete all your data including workouts, plans, exercises, and settings. This
          action cannot be undone. Make sure to export your data first if you want to keep a backup.
        </p>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleReset}>
            Reset Everything
          </Button>
          <Button variant="outline" onClick={() => setShowResetDialog(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

