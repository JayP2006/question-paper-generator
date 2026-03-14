import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import { toast } from 'sonner';

export default function SettingsPage() {

  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  );

  const handleSave = async () => {

    try {

      await updateProfile(form);

      toast.success('Profile updated successfully');

    } catch {

      toast.error('Failed to update profile');

    }

  };

  return (

    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      <div>

        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Settings
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>

      </div>


      {/* PROFILE */}

      <div className="card-elevated p-6 space-y-4">

        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>

            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Name
            </label>

            <input
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})}
              placeholder="Your name"
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
            />

          </div>


          <div>

            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Email
            </label>

            <input
              value={form.email}
              onChange={(e)=>setForm({...form,email:e.target.value})}
              placeholder="Email address"
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
            />

          </div>

        </div>


        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Save Changes
        </button>

      </div>


      {/* API CONFIG */}

      <div className="card-elevated p-6 space-y-4">

        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          API Configuration
        </h2>

        <div>

          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Backend API URL
          </label>

          <input
            value={apiUrl}
            onChange={(e)=>setApiUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-input text-foreground text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
          />

        </div>

      </div>

    </div>

  );

}