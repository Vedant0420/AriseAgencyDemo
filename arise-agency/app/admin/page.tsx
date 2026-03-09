// redeploy-keyword-2026-01-01
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailLink, sendSignInLinkToEmail, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { logAdminAction, sanitizeErrorMessage } from '../../lib/security';

interface Contact {
  id: string;
  name: string;
  email: string;
  platform?: string;
  message?: string;
  role?: string;
  emailSent?: boolean;
  responseReceived?: boolean;
  timestamp: Timestamp;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  notes: string;
  timestamp: Timestamp;
}

interface Content {
  services: {
    contentStrategyImage: string;
    videoEditingImage: string;
    creatorManagementImage: string;
  };
  portfolio: {
    item1: { type: 'image' | 'video'; url: string };
    item2: { type: 'image' | 'video'; url: string };
    item3: { type: 'image' | 'video'; url: string };
  };
  about: {
    expertiseImage: string;
    innovationImage: string;
    resultsImage: string;
  };
  showReviews?: boolean;
}

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadRole, setNewLeadRole] = useState('');
  const [newLeadPlatform, setNewLeadPlatform] = useState('');
  const [newLeadEmailSent, setNewLeadEmailSent] = useState(false);
  const [newLeadResponseReceived, setNewLeadResponseReceived] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [content, setContent] = useState<Content>({
    services: { 
      contentStrategyImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', 
      videoEditingImage: 'https://images.unsplash.com/photo-1770785284639-67d65a0e20e2?w=400&h=300&fit=crop', 
      creatorManagementImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop' 
    },
    portfolio: { 
      item1: { type: 'image', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop' }, 
      item2: { type: 'image', url: 'https://images.unsplash.com/photo-1770785284639-67d65a0e20e2?w=400&h=300&fit=crop' }, 
      item3: { type: 'image', url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop' } 
    },
    about: { 
      expertiseImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop', 
      innovationImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop', 
      resultsImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' 
    },
    showReviews: false,
  });

  // Admin email must be set in environment variables - no fallback for security
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  console.log('Admin email from env:', adminEmail);

  if (!adminEmail) {
    console.error('NEXT_PUBLIC_ADMIN_EMAIL is not set. Admin panel will not function properly.');
  }

  const fetchData = async () => {
    if (!db) return;
    const contactsQuery = query(collection(db, 'contacts'), orderBy('timestamp', 'desc'));
    const contactsSnapshot = await getDocs(contactsQuery);
    const contactsData = contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
    setContacts(contactsData);

    const bookingsQuery = query(collection(db, 'bookings'), orderBy('timestamp', 'desc'));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    setBookings(bookingsData);
  };

  const fetchContent = useCallback(async () => {
    if (!db) return;
    const contentDoc = await getDoc(doc(db, 'content', 'main'));
    if (contentDoc.exists()) {
      const data = contentDoc.data() as Content;
      setContent({ ...data, showReviews: data.showReviews !== false });
    } else {
      // Save default content
      const defaultContent: Content = {
        services: { 
          contentStrategyImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', 
          videoEditingImage: 'https://images.unsplash.com/photo-1770785284639-67d65a0e20e2?w=400&h=300&fit=crop', 
          creatorManagementImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop' 
        },
        portfolio: { 
          item1: { type: 'image', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop' }, 
          item2: { type: 'image', url: 'https://images.unsplash.com/photo-1770785284639-67d65a0e20e2?w=400&h=300&fit=crop' }, 
          item3: { type: 'image', url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop' } 
        },
        about: { 
          expertiseImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop', 
          innovationImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop', 
          resultsImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' 
        },
        showReviews: false,
      };
      await setDoc(doc(db, 'content', 'main'), defaultContent);
    }
  }, []);

  const saveContent = async () => {
    if (!db || !user) return;
    try {
      await setDoc(doc(db, 'content', 'main'), content);
      
      // Log the action for audit
      await logAdminAction(
        'UPDATE_CONTENT',
        'content',
        user,
        'main',
        { 
          showReviews: content.showReviews,
          hasServicesImages: !!content.services.contentStrategyImage,
          hasPortfolioItems: !!content.portfolio.item1.url
        }
      );
      
      await fetchContent();
      alert('Content updated successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      const errorMessage = sanitizeErrorMessage(error);
      alert(errorMessage);
    }
  };

  const handleDeleteBooking = async (bookingId: string, bookingName: string) => {
    if (!db || !user) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the booking for ${bookingName}? This action cannot be undone.`)) {
      return;
    }

    setDeletingBookingId(bookingId);
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      
      // Log the action for audit
      await logAdminAction(
        'DELETE_BOOKING',
        'bookings',
        user,
        bookingId,
        { bookingName, bookingEmail: bookings.find(b => b.id === bookingId)?.email }
      );
      
      // Refresh bookings list
      await fetchData();
      alert('Booking deleted successfully!');
    } catch (error) {
      console.error('Error deleting booking:', error);
      const errorMessage = sanitizeErrorMessage(error);
      alert(errorMessage);
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    if (!newLeadName || !newLeadEmail) {
      alert('Please fill in name and email');
      return;
    }

    setSavingLead(true);
    try {
      const leadsRef = collection(db, 'contacts');
      const docRef = doc(leadsRef);
      
      await setDoc(docRef, {
        name: newLeadName,
        email: newLeadEmail,
        role: newLeadRole,
        platform: newLeadPlatform,
        message: `${newLeadRole}${newLeadPlatform ? ` - ${newLeadPlatform}` : ''}`.trim(),
        emailSent: newLeadEmailSent,
        responseReceived: newLeadResponseReceived,
        timestamp: Timestamp.now(),
      });

      // Log the action for audit
      await logAdminAction(
        'ADD_LEAD',
        'contacts',
        user,
        docRef.id,
        { name: newLeadName, email: newLeadEmail, role: newLeadRole }
      );

      // Clear form and refresh
      setNewLeadName('');
      setNewLeadEmail('');
      setNewLeadRole('');
      setNewLeadPlatform('');
      setNewLeadEmailSent(false);
      setNewLeadResponseReceived(false);
      setShowAddLeadForm(false);
      await fetchData();
      alert('Lead added successfully!');
    } catch (error) {
      console.error('Error adding lead:', error);
      const errorMessage = sanitizeErrorMessage(error);
      alert(errorMessage);
    } finally {
      setSavingLead(false);
    }
  };

  const handleToggleLead = async (leadId: string, field: 'emailSent' | 'responseReceived', currentValue: boolean) => {
    if (!db || !user) return;

    try {
      await setDoc(doc(db, 'contacts', leadId), 
        { [field]: !currentValue },
        { merge: true }
      );

      // Log the action for audit
      await logAdminAction(
        `UPDATE_LEAD_${field.toUpperCase()}`,
        'contacts',
        user,
        leadId,
        { [field]: !currentValue }
      );

      // Refresh leads list
      await fetchData();
    } catch (error) {
      console.error(`Error updating lead ${field}:`, error);
      const errorMessage = sanitizeErrorMessage(error);
      alert(errorMessage);
    }
  };

  const handleSignOut = useCallback(async () => {
    if (!auth) return;
    // Clear inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    await signOut(auth);
    setSessionExpired(false);
  }, []);

  // Reset inactivity timer on user activity
  const resetInactivityTimer = useCallback(() => {
    if (!user || !auth) return;
    
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      setSessionExpired(true);
      handleSignOut();
    }, SESSION_TIMEOUT_MS);
  }, [user, handleSignOut]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && user.email === adminEmail) {
        fetchData();
        fetchContent();
        resetInactivityTimer();
      } else {
        setSessionExpired(false);
      }
    });
    return unsubscribe;
  }, [adminEmail, fetchContent, resetInactivityTimer]);

  // Set up activity listeners for session timeout
  useEffect(() => {
    if (!user || sessionExpired) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer, true);
    });

    // Initial timer
    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer, true);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, sessionExpired, resetInactivityTimer]);

  useEffect(() => {
    if (typeof window !== 'undefined' && auth) {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const oobCode = urlParams.get('oobCode');
      if (mode === 'signIn' && oobCode) {
        signInWithEmailLink(auth, localStorage.getItem('emailForSignIn') || '', window.location.href)
          .then(() => {
            localStorage.removeItem('emailForSignIn');
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }, []);

  const handleSendLink = async (e?: React.FormEvent | { preventDefault: () => void }) => {
    if (e) {
      e.preventDefault();
    }
    
    console.log('handleSendLink called');
    console.log('auth:', auth);
    console.log('email:', email);
    console.log('adminEmail:', adminEmail);

    if (!auth) {
      console.error('Auth not configured - check Firebase config');
      setErrorMessage('Auth not configured - check Firebase config');
      return;
    }
    if (!email) {
      console.log('No email entered');
      setErrorMessage('Please enter an email address');
      return;
    }
    if (email !== adminEmail) {
      console.log('Email mismatch:', email, '!==', adminEmail);
      setErrorMessage('Access denied. Only admin email allowed.');
      return;
    }

    console.log('Setting loading to true');
    setLoading(true);
    setErrorMessage('');

    try {
      console.log('About to call sendSignInLinkToEmail');
      const result = await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/admin`,
        handleCodeInApp: true,
      });
      console.log('sendSignInLinkToEmail result:', result);
      console.log('Sign-in link sent successfully');
      setLinkSent(true);
      localStorage.setItem('emailForSignIn', email);
      setEmail(''); // Clear email field after success
    } catch (error: unknown) {
      console.error('Error sending sign-in link:', error);

      if (error instanceof Error) {
        // FirebaseAuthError has `code` but it's not in base Error
        const firebaseError = error as Error & { code?: string };

        if (firebaseError.code) {
          console.error('Firebase error code:', firebaseError.code);
          console.error('Firebase error message:', firebaseError.message);
          setErrorMessage(`Error: ${firebaseError.code} - ${firebaseError.message}`);
          return;
        }
      }

      console.error('Generic error:', error);
      setErrorMessage(sanitizeErrorMessage(error));
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  if (!adminEmail) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-white border border-neutral-200 rounded-lg p-8 max-w-md w-full">
          <h1 className="text-xl font-bold mb-4 text-neutral-900">Configuration Error</h1>
          <p className="text-neutral-600 text-sm">
            Admin email is not configured. Please set NEXT_PUBLIC_ADMIN_EMAIL in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.email !== adminEmail) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-white border border-neutral-200 rounded-lg p-8 max-w-md w-full">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-4">Arise Agency</p>
          <h1 className="text-xl font-bold mb-1 text-neutral-900">Admin Login</h1>
          <p className="text-sm text-neutral-500 mb-6">Enter your admin email to receive a sign-in link.</p>
          
          {linkSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-green-900 mb-1">Magic link sent! 🎉</p>
              <p className="text-sm text-green-800 mb-3">
                Check your email for a sign-in link. Click the link to log in.
              </p>
              <button
                onClick={() => setLinkSent(false)}
                className="text-sm font-semibold text-green-700 hover:underline"
              >
                Send another link
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!email) {
                    setErrorMessage('Please enter an email address');
                    return;
                  }
                  handleSendLink({ preventDefault: () => {} } as React.FormEvent);
                }}
                disabled={loading}
                className="w-full bg-blue-700 text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show session expired message if needed
  if (sessionExpired) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-white border border-neutral-200 rounded-lg p-8 max-w-md w-full">
          <h1 className="text-xl font-bold mb-2 text-neutral-900">Session Expired</h1>
          <p className="text-neutral-600 text-sm mb-6">
            Your session expired due to inactivity. Please sign in again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-700 text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors duration-200"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-neutral-900">Arise Agency</span>
              <span className="text-neutral-300">|</span>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-500 hidden sm:block">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm font-semibold text-neutral-600 hover:text-red-600 transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab bar */}
        <div className="mb-8 flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
          {(['dashboard', 'leads', 'bookings', 'content'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors duration-150 ${
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab === 'leads' ? `Leads (${contacts.length})` : tab === 'bookings' ? `Bookings (${bookings.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-1">Total Leads</p>
              <p className="text-4xl font-bold text-blue-700">{contacts.length}</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-1">Total Bookings</p>
              <p className="text-4xl font-bold text-neutral-900">{bookings.length}</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-1">Signed in as</p>
              <p className="text-sm font-semibold text-neutral-700 mt-2 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Add Lead Button */}
            <button
              onClick={() => setShowAddLeadForm(!showAddLeadForm)}
              className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors"
            >
              {showAddLeadForm ? 'Cancel' : '+ Add New Lead'}
            </button>

            {/* Add Lead Form */}
            {showAddLeadForm && (
              <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <h3 className="text-sm font-bold text-neutral-900 mb-4">Add New Lead</h3>
                <form onSubmit={handleAddLead} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={newLeadName}
                      onChange={(e) => setNewLeadName(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Lead name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">What They Do (Role)</label>
                    <input
                      type="text"
                      value={newLeadRole}
                      onChange={(e) => setNewLeadRole(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., TikTok Creator, Influencer, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">Platform/Contact Info</label>
                    <input
                      type="text"
                      value={newLeadPlatform}
                      onChange={(e) => setNewLeadPlatform(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., @username, Instagram, Phone, etc."
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newLeadEmailSent}
                        onChange={(e) => setNewLeadEmailSent(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300"
                      />
                      <span className="text-xs font-semibold text-neutral-700">Email Sent</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newLeadResponseReceived}
                        onChange={(e) => setNewLeadResponseReceived(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300"
                      />
                      <span className="text-xs font-semibold text-neutral-700">Response Received</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingLead}
                    className="w-full bg-green-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {savingLead ? 'Saving...' : 'Save Lead'}
                  </button>
                </form>
              </div>
            )}

            {/* Leads Table */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden overflow-x-auto">
              {contacts.length === 0 ? (
                <div className="p-10 text-center text-sm text-neutral-500">No leads yet.</div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      {['Name', 'Email', 'Role', 'Platform/Contact', 'Email Sent', 'Response', 'Date'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-neutral-50 transition-colors duration-100">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">{contact.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{contact.email}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{contact.role || '-'}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">{contact.platform || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleLead(contact.id, 'emailSent', contact.emailSent ?? false)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              contact.emailSent
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-neutral-300 hover:border-blue-400'
                            }`}
                          >
                            {contact.emailSent && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleLead(contact.id, 'responseReceived', contact.responseReceived ?? false)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              contact.responseReceived
                                ? 'bg-green-600 border-green-600'
                                : 'border-neutral-300 hover:border-green-400'
                            }`}
                          >
                            {contact.responseReceived && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {contact.timestamp?.toDate().toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden overflow-x-auto">
            {bookings.length === 0 ? (
              <div className="p-10 text-center text-sm text-neutral-500">No bookings yet.</div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {['Name', 'Email', 'Date', 'Time', 'Notes', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-neutral-50 transition-colors duration-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">{booking.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{booking.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{booking.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{booking.time}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">{booking.notes}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteBooking(booking.id, booking.name)}
                          disabled={deletingBookingId === booking.id}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                          title="Delete booking"
                        >
                          {deletingBookingId === booking.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-neutral-900">Content Management</h2>

            {/* Services Images */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-5">Services Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Content Strategy', key: 'contentStrategyImage' as const },
                  { label: 'Video Editing', key: 'videoEditingImage' as const },
                  { label: 'Creator Management', key: 'creatorManagementImage' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={content.services[key]}
                      onChange={(e) => setContent({ ...content, services: { ...content.services, [key]: e.target.value } })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Media */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-5">Portfolio Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Item {num}</label>
                    <select
                      value={content.portfolio[`item${num}` as keyof typeof content.portfolio].type}
                      onChange={(e) => setContent({
                        ...content,
                        portfolio: {
                          ...content.portfolio,
                          [`item${num}`]: { ...content.portfolio[`item${num}` as keyof typeof content.portfolio], type: e.target.value as 'image' | 'video' }
                        }
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      aria-label={`Portfolio item ${num} type`}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <input
                      type="text"
                      value={content.portfolio[`item${num}` as keyof typeof content.portfolio].url}
                      onChange={(e) => setContent({
                        ...content,
                        portfolio: {
                          ...content.portfolio,
                          [`item${num}`]: { ...content.portfolio[`item${num}` as keyof typeof content.portfolio], url: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/media"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* About Images */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-5">About Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Expertise', key: 'expertiseImage' as const },
                  { label: 'Innovation', key: 'innovationImage' as const },
                  { label: 'Results', key: 'resultsImage' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={content.about[key]}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, [key]: e.target.value } })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-5">Settings</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  id="showReviews"
                  type="checkbox"
                  checked={content.showReviews !== false}
                  onChange={e => setContent({ ...content, showReviews: e.target.checked })}
                  className="w-4 h-4 accent-blue-700"
                />
                <span className="text-sm text-neutral-700">Show Reviews section on home page</span>
              </label>
            </div>

            <button
              onClick={saveContent}
              className="bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}