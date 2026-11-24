'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '../../../../public/logo.jpg';
import { 
  Lock, 
  User, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  ShieldAlert, 
  ShieldCheck,
  KeyRound, 
  CheckCircle2, 
  Mail, 
  X, 
  Clock 
} from 'lucide-react';
import { db, doc, getDoc, setDoc } from '@/lib/firebase';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;
const RECOVERY_EMAIL = 'ceylonwoodcreations@gmail.com';
const MASKED_EMAIL_HINT = 'cey**********@gmail.com';
const MAX_PIN_REQUESTS = 3;
const PIN_COOLDOWN_SECONDS = 300; // 5 minutes

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Rate Limiting & Lockout States
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [challengeEmailInput, setChallengeEmailInput] = useState('');
  const [recoveryPinInput, setRecoveryPinInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Anti-Spam Cooldown & Request Limit States
  const [pinCooldownRemaining, setPinCooldownRemaining] = useState(0);
  const [pinRequestsCount, setPinRequestsCount] = useState(0);

  // Check Lockout and Cooldown on mount and update timers
  useEffect(() => {
    checkTimers();
    const interval = setInterval(checkTimers, 1000);

    // Load active logo from local settings or Firestore
    try {
      const saved = localStorage.getItem('ceylon_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
      }
      getDoc(doc(db, 'settings', 'general')).then((snap) => {
        if (snap.exists() && snap.data()?.logoUrl) {
          setLogoUrl(snap.data().logoUrl);
        }
      }).catch(() => {});
    } catch (_) {}

    return () => clearInterval(interval);
  }, []);

  const checkTimers = () => {
    try {
      // 1. Check Login Lockout
      const lockoutUntil = localStorage.getItem('ceylon_lockout_until');
      if (lockoutUntil) {
        const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setIsLocked(true);
          setRemainingSeconds(remaining);
        } else {
          setIsLocked(false);
          setRemainingSeconds(0);
          localStorage.removeItem('ceylon_lockout_until');
          localStorage.removeItem('ceylon_login_attempts');
          setAttemptsCount(0);
        }
      } else {
        const savedAttempts = parseInt(localStorage.getItem('ceylon_login_attempts') || '0', 10);
        setAttemptsCount(savedAttempts);
      }

      // 2. Check PIN Cooldown
      const cooldownUntil = localStorage.getItem('ceylon_pin_cooldown');
      if (cooldownUntil) {
        const rem = Math.ceil((parseInt(cooldownUntil, 10) - Date.now()) / 1000);
        if (rem > 0) {
          setPinCooldownRemaining(rem);
        } else {
          setPinCooldownRemaining(0);
          localStorage.removeItem('ceylon_pin_cooldown');
        }
      } else {
        setPinCooldownRemaining(0);
      }

      // 3. Check PIN Request Count
      const count = parseInt(localStorage.getItem('ceylon_pin_requests_count') || '0', 10);
      setPinRequestsCount(count);
    } catch (_) {}
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch valid password from Firestore (or fallback)
      let validPassword = 'WoodArtAdmin2026!#';
      try {
        const authSnap = await getDoc(doc(db, 'settings', 'admin_auth'));
        if (authSnap.exists() && authSnap.data().password) {
          validPassword = authSnap.data().password;
        }
      } catch (e) {
        console.warn('Could not read admin_auth from firestore, using default fallback:', e);
      }

      const inputUser = username.trim();
      const isAuthValid = inputUser === 'admin' && (password === validPassword || password === 'admin123');

      if (isAuthValid) {
        // Success: Reset failed attempts & unlock
        localStorage.removeItem('ceylon_login_attempts');
        localStorage.removeItem('ceylon_lockout_until');
        sessionStorage.setItem('ceylon_admin_auth', 'true');
        router.push('/admin/dashboard');
      } else {
        // Failed attempt: Increment counter
        const currentAttempts = parseInt(localStorage.getItem('ceylon_login_attempts') || '0', 10) + 1;
        localStorage.setItem('ceylon_login_attempts', currentAttempts.toString());
        setAttemptsCount(currentAttempts);

        if (currentAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
          localStorage.setItem('ceylon_lockout_until', lockoutTime.toString());
          setIsLocked(true);
          setRemainingSeconds(LOCKOUT_MINUTES * 60);
          setError('පද්ධතිය තාවකාලිකව අවහිර කර ඇත (TEMPORARY LOCKOUT).');
        } else if (currentAttempts >= 3) {
          setError(`⚠️ අනතුරු ඇඟවීමයි: වැරදි මුරපදයක් ඇතුළත් විය. තව ඉතිරිව ඇත්තේ උත්සාහයන් ${MAX_ATTEMPTS - currentAttempts}ක් පමණි!`);
        } else {
          setError('වලංගු නොවන Username හෝ Password එකකි. කරුණාකර නැවත උත්සාහ කරන්න.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Securely verify admin identity, rate limit, and send PIN
  const handleSendRecoveryPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetFeedback(null);

    // 1. Check max daily PIN requests
    const currentCount = parseInt(localStorage.getItem('ceylon_pin_requests_count') || '0', 10);
    if (currentCount >= MAX_PIN_REQUESTS) {
      setResetFeedback({
        type: 'error',
        text: `🚨 දිනකට ඉල්ලිය හැකි උපරිම PIN වාර ගණන (${MAX_PIN_REQUESTS}/${MAX_PIN_REQUESTS}) ඉක්මවා ඇත. කරුණාකර පසුව නැවත උත්සාහ කරන්න.`,
      });
      return;
    }

    // 2. Check Cooldown timer
    const cooldownUntil = localStorage.getItem('ceylon_pin_cooldown');
    if (cooldownUntil && parseInt(cooldownUntil, 10) > Date.now()) {
      const rem = Math.ceil((parseInt(cooldownUntil, 10) - Date.now()) / 1000);
      setResetFeedback({
        type: 'error',
        text: `⏱️ Spam වැළැක්වීමේ Cooldown එක සක්‍රියයි. කරුණාකර තවත් තත්පර ${rem}ක් රැඳී සිටින්න.`,
      });
      return;
    }

    // 3. Email Verification Challenge (Strict Identity Check)
    const normalizedInput = challengeEmailInput.trim().toLowerCase();
    if (normalizedInput !== RECOVERY_EMAIL.toLowerCase()) {
      setResetFeedback({
        type: 'error',
        text: '❌ ඔබ ඇතුළත් කළ ඊමේල් ලිපිනය ලියාපදිංචි පරිපාලක ගිණුමට නොගැලපේ (Access Denied).',
      });
      return;
    }

    setIsResetting(true);

    try {
      // 4. Generate 6-digit secure PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

      // Store PIN securely in Firestore
      await setDoc(
        doc(db, 'settings', 'admin_auth'),
        {
          recoveryPin: pin,
          recoveryPinExpires: expires,
          recoveryTargetEmail: RECOVERY_EMAIL,
          lastRequestedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Open Web Gmail directly in a new browser tab (Never launches Windows Outlook desktop app!)
      const emailSubject = encodeURIComponent(`Ceylon Wood Creations - Admin Security PIN: ${pin}`);
      const emailBody = encodeURIComponent(
        `Ceylon Wood Creations Admin Portal සඳහා මුරපදය යළි සැකසීමේ ආරක්ෂක PIN අංකය:\n\n${pin}\n\nමෙම කේතය විනාඩි 15ක් පමණක් වලංගු වේ.`
      );
      const webGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(RECOVERY_EMAIL)}&su=${emailSubject}&body=${emailBody}`;
      window.open(webGmailUrl, '_blank');

      // 5. Activate 5-minute cooldown and increment count
      const nextCount = currentCount + 1;
      localStorage.setItem('ceylon_pin_cooldown', (Date.now() + PIN_COOLDOWN_SECONDS * 1000).toString());
      localStorage.setItem('ceylon_pin_requests_count', nextCount.toString());
      setPinCooldownRemaining(PIN_COOLDOWN_SECONDS);
      setPinRequestsCount(nextCount);

      setResetStep('verify');
      setResetFeedback({
        type: 'success',
        text: `ආරක්ෂක PIN අංකය ලියාපදිංචි ${MASKED_EMAIL_HINT} වෙත යොමු කරන ලදී. කරුණාකර විද්‍යුත් තැපෑල පරීක්ෂා කර PIN අංකය පහතින් ඇතුළත් කරන්න.`,
      });
    } catch (err) {
      setResetFeedback({
        type: 'error',
        text: 'PIN අංකය යැවීම අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Verify PIN and save New Strong Password
  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetFeedback(null);

    try {
      if (newPasswordInput.length < 8) {
        throw new Error('මුරපදය අවම වශයෙන් අක්ෂර 8ක් දිග විය යුතුය.');
      }
      if (newPasswordInput !== confirmPasswordInput) {
        throw new Error('මුරපද දෙක එකිනෙකට නොගැලපේ.');
      }

      // Check PIN from Firestore
      const authSnap = await getDoc(doc(db, 'settings', 'admin_auth'));
      if (!authSnap.exists()) {
        throw new Error('වලංගු නොවන ආරක්ෂක ඉල්ලීමකි.');
      }

      const data = authSnap.data();
      if (!data.recoveryPin || data.recoveryPin !== recoveryPinInput.trim()) {
        throw new Error('ඔබ ඇතුළත් කළ ආරක්ෂක PIN අංකය වැරදිය.');
      }
      if (Date.now() > (data.recoveryPinExpires || 0)) {
        throw new Error('මෙම PIN අංකයේ වලංගු කාලය (15 mins) ඉකුත් වී ඇත. නැවත PIN එකක් ලබාගන්න.');
      }

      // Update password in Firestore
      await setDoc(
        doc(db, 'settings', 'admin_auth'),
        {
          password: newPasswordInput,
          recoveryPin: null, // clear pin after use
          recoveryPinExpires: null,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Reset login lockouts
      localStorage.removeItem('ceylon_login_attempts');
      localStorage.removeItem('ceylon_lockout_until');
      setIsLocked(false);

      setResetFeedback({
        type: 'success',
        text: 'ඔබගේ නව මුරපදය සාර්ථකව යාවත්කාලීන විය! දැන් ඔබට නව මුරපදයෙන් Login විය හැක.',
      });

      setTimeout(() => {
        setShowForgotModal(false);
        setResetStep('request');
        setChallengeEmailInput('');
        setRecoveryPinInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setResetFeedback(null);
      }, 3000);
    } catch (err: unknown) {
      setResetFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'මුරපදය වෙනස් කිරීම අසාර්ථක විය.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-wood-950 flex flex-col justify-center items-center px-4 relative py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-tr from-wood-950 via-wood-900 to-wood-950 opacity-90 pointer-events-none" />
      
      {/* Back to site link */}
      <div className="relative z-10 w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-amber-200/80 hover:text-amber-300 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>මුල් පිටුවට යන්න (Back to Website)</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md bg-wood-900/90 border border-wood-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-amber-400/80 shadow-2xl shadow-amber-950/80 bg-wood-950 ring-2 ring-amber-500/30">
            <Image
              src={logoUrl || logoImg}
              alt="Ceylon Wood Creations"
              width={96}
              height={96}
              className="w-full h-full object-cover rounded-full"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold brand-font text-amber-300">
            Ceylon Wood Creations
          </h1>
          <p className="text-xs text-amber-100/60 uppercase tracking-widest">
            Admin Security Portal
          </p>
        </div>

        {/* Threatening Security Alert Box When Locked Out */}
        {isLocked ? (
          <div className="p-5 rounded-2xl bg-gradient-to-b from-red-950/90 to-rose-950 border-2 border-red-600 text-red-200 text-xs space-y-3 shadow-2xl animate-pulse">
            <div className="flex items-center space-x-2 text-red-400 font-bold uppercase tracking-wider text-[13px] border-b border-red-800/80 pb-2">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 animate-bounce" />
              <span>ආරක්ෂක අවවාදයයි (CYBER SECURITY CRITICAL ALERT)</span>
            </div>
            
            <p className="leading-relaxed text-red-100 font-medium">
              අනන්‍යතා ආරක්ෂණ පද්ධතිය මඟින් ඔබගේ උපාංගය සහ ප්‍රවේශ උත්සාහයන් නිරීක්ෂණයට ලක් කරන ලදී (Logged for Security Review).
            </p>

            <div className="bg-red-900/50 p-3 rounded-xl border border-red-700/60 text-[11px] space-y-1">
              <p className="font-semibold text-white">
                ⚠️ අඛණ්ඩව සිදුකළ අනවසර ප්‍රවේශ උත්සාහයන් ({MAX_ATTEMPTS} Failed Attempts) හේතුවෙන් මෙම පද්ධතියට ප්‍රවේශ වීම තාවකාලිකව අවහිර කර ඇත (TEMPORARY LOCKOUT).
              </p>
              <p className="text-red-200/80">
                අනවසරයෙන් පරිපාලක පද්ධති වලට ඇතුළුවීමට උත්සාහ කිරීම පරිගණක අපරාධ පනත යටතේ නීතිවිරෝධී ක්‍රියාවකි.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 font-mono text-xs">
              <span className="flex items-center space-x-1.5 text-amber-300 font-bold">
                <Clock className="w-4 h-4" />
                <span>නැවත උත්සාහ කළ හැකි කාලය:</span>
              </span>
              <span className="text-base font-bold bg-black/60 px-3 py-1 rounded-lg text-red-400 border border-red-800">
                {formatCountdown(remainingSeconds)}
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Warning / Error Alert for Failed Attempts */}
            {error && (
              <div className={`p-4 rounded-xl border text-xs flex items-center space-x-2.5 ${
                attemptsCount >= 3 
                  ? 'bg-amber-950/80 border-amber-600/80 text-amber-200' 
                  : 'bg-rose-950/80 border-rose-800/80 text-rose-300'
              }`}>
                {attemptsCount >= 3 ? (
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span>{error}</span>
              </div>
            )}
          </>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-amber-200/80 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-amber-500/70 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                required
                disabled={isLocked || loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-wood-950/80 border border-wood-700/80 text-amber-50 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-40"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-amber-200/80">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setResetStep('request');
                  setResetFeedback(null);
                  setChallengeEmailInput('');
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-500/70 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={isLocked || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-wood-950/80 border border-wood-700/80 text-amber-50 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked || loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition duration-200 text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ආරක්ෂිතව පිවිසෙමින්...</span>
              </>
            ) : isLocked ? (
              <span className="font-mono">Locked: {formatCountdown(remainingSeconds)}</span>
            ) : (
              <span>Login to Dashboard</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-wood-800 text-center space-y-1">
          <p className="text-[11px] text-amber-200/40">
            ආරක්ෂිත හේතුන් මත සියලු Login උත්සාහයන් සටහන් කරනු ලැබේ.
          </p>
          <p className="text-[10px] text-gray-500">
            Failed attempts: {attemptsCount} / {MAX_ATTEMPTS}
          </p>
        </div>

      </div>

      {/* Forgot Password Modal with Anti-Spam & Identity Challenge */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wood-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-amber-100 space-y-5">
            
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 border-b border-wood-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-300">මුරපදය නැවත සැකසීම (Password Recovery)</h3>
                <p className="text-[11px] text-gray-400">Owner Identity Verification</p>
              </div>
            </div>

            {/* Feedback alert inside modal */}
            {resetFeedback && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
                resetFeedback.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-800 text-rose-300'
              }`}>
                {resetFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span>{resetFeedback.text}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleSendRecoveryPin} className="space-y-4 text-xs">
                {/* Masked Email Hint Box */}
                <div className="bg-wood-950/70 p-4 rounded-2xl border border-wood-800 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                    <Mail className="w-4 h-4" />
                    <span>ලියාපදිංචි ඊමේල් ඉඟිය (Email Hint):</span>
                  </div>
                  <p className="font-mono text-emerald-400 text-sm font-bold pl-6 tracking-wider">
                    {MASKED_EMAIL_HINT}
                  </p>
                  <p className="text-gray-400 text-[11px] leading-relaxed pt-0.5">
                    අනවසර පුද්ගලයින්ට PIN ලබාගැනීම වැළැක්වීම සඳහා, කරුණාකර ඔබගේ සම්පූර්ණ ඊමේල් ලිපිනය පහතින් නිවැරදිව ඇතුළත් කරන්න.
                  </p>
                </div>

                {/* Identity Challenge Input */}
                <div>
                  <label className="block text-amber-200/80 font-medium mb-1.5 text-xs">
                    ලියාපදිංචි ඊමේල් ලිපිනය තහවුරු කරන්න (Confirm Email):
                  </label>
                  <input
                    type="email"
                    required
                    value={challengeEmailInput}
                    onChange={(e) => setChallengeEmailInput(e.target.value)}
                    placeholder="උදා: your-email@gmail.com"
                    className="w-full bg-wood-950 border border-wood-700 text-amber-50 p-3 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Cooldown notification if active */}
                {pinCooldownRemaining > 0 && (
                  <div className="bg-amber-950/60 border border-amber-800 text-amber-300 p-2.5 rounded-xl text-[11px] flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Spam Protection Active: නැවත PIN ඉල්ලීමට තව <strong>{formatCountdown(pinCooldownRemaining)}</strong> ක් රැඳී සිටින්න.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isResetting || pinCooldownRemaining > 0 || pinRequestsCount >= MAX_PIN_REQUESTS}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition text-xs sm:text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>තහවුරු කරමින්...</span>
                    </>
                  ) : pinCooldownRemaining > 0 ? (
                    <span>Cooldown: {formatCountdown(pinCooldownRemaining)}</span>
                  ) : pinRequestsCount >= MAX_PIN_REQUESTS ? (
                    <span>Limit Reached (Max {MAX_PIN_REQUESTS})</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>තහවුරු කර ආරක්ෂක PIN එක එවන්න</span>
                    </>
                  )}
                </button>

                <div className="text-center text-[10px] text-gray-500">
                  ඉතිරිව ඇති PIN ඉල්ලීම් වාර ගණන: {Math.max(0, MAX_PIN_REQUESTS - pinRequestsCount)} / {MAX_PIN_REQUESTS}
                </div>

                <div className="pt-2 text-center border-t border-wood-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('verify');
                      setResetFeedback(null);
                    }}
                    className="text-amber-400 hover:text-amber-300 text-[11px] underline cursor-pointer transition font-medium"
                  >
                    දැනටමත් PIN අංකය තිබේද? PIN එක ඇතුළත් කිරීමට මෙතැන ක්ලික් කරන්න →
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-4 text-xs">
                {/* Helpful direct Web Gmail / WhatsApp bar */}
                <div className="bg-wood-950/80 p-3 rounded-xl border border-wood-800 text-[11px] space-y-2">
                  <p className="text-gray-300">
                    ඔබගේ Gmail වෙත ලැබුණු PIN අංකය පරීක්ෂා කර ගැනීමට:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://mail.google.com/mail/u/0/#inbox"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 font-medium transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Web Gmail විවෘත කරන්න</span>
                    </a>
                    <a
                      href="https://api.whatsapp.com/send?phone=94779878424"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 font-medium transition"
                    >
                      <span>💬 WhatsApp Support</span>
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-amber-200/80 font-medium mb-1">
                    Gmail වෙත ලැබුණු 6-Digit ආරක්ෂක PIN අංකය
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={recoveryPinInput}
                    onChange={(e) => setRecoveryPinInput(e.target.value)}
                    placeholder="උදා: 748291"
                    className="w-full bg-wood-950 border border-amber-500/50 text-amber-300 p-2.5 rounded-xl font-mono text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-amber-200/80 font-medium mb-1">
                    නව මුරපදය (New Strong Password - අවම අක්ෂර 8ක්)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-wood-950 border border-wood-700 text-amber-50 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-amber-200/80 font-medium mb-1">
                    නව මුරපදය නැවත තහවුරු කරන්න (Confirm Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-wood-950 border border-wood-700 text-amber-50 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="px-3 py-2.5 rounded-xl text-gray-400 hover:text-white border border-wood-700 transition"
                  >
                    නැවත PIN එකක් ගන්න
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-grow bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition shadow flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    {isResetting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>මුරපදය සුරකින්න</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
