'use client';

import { useState, useEffect, useCallback } from 'react';
import { ImageStudio, VideoStudio, LipSyncStudio, CinemaStudio } from 'studio';
import ProviderSettingsModal from '@/components/settings/ProviderSettingsModal';
import { getAllKeys, hasKey, setKey, removeKey } from 'studio/providers/keyStore';

const TABS = [
  { id: 'image',   label: 'Image Studio' },
  { id: 'video',   label: 'Video Studio' },
  { id: 'lipsync', label: 'Lip Sync' },
  { id: 'cinema',  label: 'Cinema Studio' },
];

export default function StandaloneShell() {
  const [activeTab, setActiveTab] = useState('image');
  const [showSettings, setShowSettings] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [activeKeys, setActiveKeys] = useState({});

  useEffect(() => {
    setHasMounted(true);
    setActiveKeys(getAllKeys());
  }, []);

  const handleKeysChange = useCallback(() => {
    setActiveKeys(getAllKeys());
  }, []);

  const handleKeyChange = useCallback((providerId) => {
    removeKey(providerId);
    setActiveKeys(getAllKeys());
  }, []);

  if (!hasMounted) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-spin text-[#d9ff00] text-3xl">◌</div>
    </div>
  );

  const hasAnyKey = Object.values(activeKeys).some(k => k && k.trim());

  if (!hasAnyKey) {
    // Show first-time setup modal
    return (
      <ProviderSettingsModal 
        isOpen={true} 
        onClose={() => {}} // Prevent closing until keys added
        onKeysChange={handleKeysChange}
      />
    );
  }

  return (
    <div className="h-screen bg-[#050505] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-lg tracking-wider uppercase">
            Open Higgsfield AI
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#d9ff00] text-black'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(true)}
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          ⚙ Settings
        </button>
      </header>

      {/* Studio Content */}
      <div className="flex-1">
        {activeTab === 'image'   && <ImageStudio   />}
        {activeTab === 'video'   && <VideoStudio   />}
        {activeTab === 'lipsync' && <LipSyncStudio />}
        {activeTab === 'cinema'  && <CinemaStudio  />}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <ProviderSettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)}
          onKeysChange={handleKeysChange}
        />
      )}
    </div>
  );
}