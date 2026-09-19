import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Save,
  Check,
  Key,
  Shield,
  Users,
  Globe,
  Settings,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  ExternalLink,
  Lock,
  X,
} from 'lucide-react';
import { Project, TestAccount } from '../types';
import { TagBadge } from '../components/Badges';
import { useTheme } from '../theme/ThemeContext';

interface ProjectSetupScreenProps {
  currentProject: Project;
  onUpdateProject?: (updated: Project) => void;
}

export const ProjectSetupScreen: React.FC<ProjectSetupScreenProps> = ({
  currentProject,
  onUpdateProject,
}) => {
  const { currentConfig } = useTheme();
  const [project, setProject] = useState<Project>({ ...currentProject });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newScopeUrl, setNewScopeUrl] = useState('');
  const [newExcludedUrl, setNewExcludedUrl] = useState('');
  const [showTokenMap, setShowTokenMap] = useState<Record<string, boolean>>({});

  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<TestAccount>>({
    name: '',
    email: '',
    role: 'Standard Customer',
    status: 'Active',
    token_preview: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  });

  const handleSave = () => {
    if (onUpdateProject) {
      onUpdateProject(project);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddScope = () => {
    if (!newScopeUrl.trim()) return;
    setProject((prev) => ({
      ...prev,
      in_scope: [...prev.in_scope, newScopeUrl.trim()],
    }));
    setNewScopeUrl('');
  };

  const handleRemoveScope = (index: number) => {
    setProject((prev) => ({
      ...prev,
      in_scope: prev.in_scope.filter((_, i) => i !== index),
    }));
  };

  const handleAddExcluded = () => {
    if (!newExcludedUrl.trim()) return;
    setProject((prev) => ({
      ...prev,
      excluded_scope: [...prev.excluded_scope, newExcludedUrl.trim()],
    }));
    setNewExcludedUrl('');
  };

  const handleRemoveExcluded = (index: number) => {
    setProject((prev) => ({
      ...prev,
      excluded_scope: prev.excluded_scope.filter((_, i) => i !== index),
    }));
  };

  const handleCreateAccount = () => {
    if (!newAccount.name || !newAccount.email) return;
    const account: TestAccount = {
      id: `acc_${Date.now()}`,
      name: newAccount.name!,
      email: newAccount.email!,
      role: newAccount.role || 'Standard Customer',
      status: 'Active',
      token_preview: newAccount.token_preview || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    };
    setProject((prev) => ({
      ...prev,
      test_accounts: [...prev.test_accounts, account],
    }));
    setShowAddAccountModal(false);
    setNewAccount({
      name: '',
      email: '',
      role: 'Standard Customer',
      status: 'Active',
      token_preview: '',
    });
  };

  const handleRemoveAccount = (id: string) => {
    setProject((prev) => ({
      ...prev,
      test_accounts: prev.test_accounts.filter((a) => a.id !== id),
    }));
  };

  const toggleTokenVisibility = (id: string) => {
    setShowTokenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl cyber-card bg-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              PROJECT CONFIGURATION & SCOPE
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold uppercase"
              style={{
                backgroundColor: currentConfig.badgeBg,
                color: currentConfig.badgeText,
                borderColor: currentConfig.badgeBorder,
              }}
            >
              {project.id}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            Define target environments, authorization scopes, and multi-identity test tokens for differential probing.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 cyber-glow-btn rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="h-4 w-4 text-white" />
              <span>Configuration Saved</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General Metadata */}
        <div className="lg:col-span-1 space-y-6 font-sans">
          <div className="p-6 rounded-2xl cyber-card space-y-4 bg-white">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-3 font-mono">
              <Settings className="h-4 w-4" style={{ color: currentConfig.primary }} />
              General Information
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Name</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProject({ ...project, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Environment</label>
                <input
                  type="text"
                  value={project.environment}
                  onChange={(e) => setProject({ ...project, environment: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Business Owner</label>
                <input
                  type="text"
                  value={project.business_owner}
                  onChange={(e) => setProject({ ...project, business_owner: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Architecture Type</label>
                <input
                  type="text"
                  value={project.project_type}
                  onChange={(e) => setProject({ ...project, project_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={project.description}
                  onChange={(e) => setProject({ ...project, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Compliance Tags</label>
                <div className="flex flex-wrap gap-1.5 font-mono">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: In-Scope Targets & Multi-Identity Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* In-Scope / Out-of-Scope Targets */}
          <div className="p-6 rounded-2xl cyber-card space-y-4 bg-white">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-3 font-mono">
              <Globe className="h-4 w-4 text-emerald-600" />
              Target Scope Patterns (In-Scope & Excluded)
            </h3>

            {/* In-Scope Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">In-Scope API Base URLs (* Wildcard Supported)</span>
                <span className="text-emerald-700 font-bold font-mono">
                  {project.in_scope.length} Active Rules
                </span>
              </div>

              <div className="space-y-1.5">
                {project.in_scope.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-purple-700 font-semibold"
                  >
                    <span>{url}</span>
                    <button
                      onClick={() => handleRemoveScope(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove scope pattern"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add In-Scope Input */}
              <div className="flex gap-2 pt-1 font-mono">
                <input
                  type="text"
                  placeholder="https://api.acmeprod.io/v3/*"
                  value={newScopeUrl}
                  onChange={(e) => setNewScopeUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                />
                <button
                  onClick={handleAddScope}
                  className="px-4 py-2.5 cyber-glow-btn rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  <Plus className="h-4 w-4 inline mr-1" /> Add Scope
                </button>
              </div>
            </div>

            {/* Excluded Scope Section */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-800">Explicitly Excluded Scopes (Do Not Probe)</span>
                <span className="text-slate-500 font-mono">
                  {project.excluded_scope.length} Exclusions
                </span>
              </div>

              <div className="space-y-1.5">
                {project.excluded_scope.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800 font-semibold"
                  >
                    <span>{url}</span>
                    <button
                      onClick={() => handleRemoveExcluded(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Excluded Input */}
              <div className="flex gap-2 pt-1 font-mono">
                <input
                  type="text"
                  placeholder="https://*.sandbox.acmeprod.io/*"
                  value={newExcludedUrl}
                  onChange={(e) => setNewExcludedUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                />
                <button
                  onClick={handleAddExcluded}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4 inline mr-1" /> Exclude
                </button>
              </div>
            </div>
          </div>

          {/* Test Accounts & Multi-Identity Matrix */}
          <div className="p-6 rounded-2xl cyber-card space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Differential Test Identity Matrix ({project.test_accounts.length})
                </h3>
              </div>
              <button
                onClick={() => setShowAddAccountModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-mono text-xs font-bold border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Identity
              </button>
            </div>

            <div className="space-y-3">
              {project.test_accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 hover:border-slate-300 transition-all font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                        {acc.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{acc.name}</div>
                        <div className="text-[10px] text-slate-500">{acc.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                        Role: {acc.role}
                      </span>
                      <button
                        onClick={() => handleRemoveAccount(acc.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Token Preview */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                      <Key className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {showTokenMap[acc.id] ? acc.token_preview : `${acc.token_preview.slice(0, 24)}••••••••••••`}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleTokenVisibility(acc.id)}
                      className="text-slate-500 hover:text-slate-900 ml-2 shrink-0 cursor-pointer"
                    >
                      {showTokenMap[acc.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Test Account */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-mono">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Add Test Account Identity</h3>
              <button onClick={() => setShowAddAccountModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alice (Victim Account)"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="alice@tenant-a.com"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Type</label>
                <select
                  value={newAccount.role}
                  onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden font-mono"
                >
                  <option value="Standard Customer">Standard Customer</option>
                  <option value="Tenant Admin">Tenant Admin</option>
                  <option value="Merchant Admin">Merchant Admin</option>
                  <option value="System Operator">System Operator</option>
                  <option value="Unauthenticated / Anonymous">Unauthenticated / Anonymous</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">JWT / Bearer Token Value</label>
                <textarea
                  rows={2}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={newAccount.token_preview}
                  onChange={(e) => setNewAccount({ ...newAccount, token_preview: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 font-mono">
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                className="px-4 py-2 rounded-xl cyber-glow-btn text-xs font-bold uppercase"
              >
                Save Identity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
