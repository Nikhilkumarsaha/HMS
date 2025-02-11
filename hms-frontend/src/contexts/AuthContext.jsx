import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          setUserRole(profile?.role);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking user session:', error);
        setLoading(false);
      }
    };

    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        setUserRole(profile?.role);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, role, firstName, lastName }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: authData.user.id,
              role,
              first_name: firstName,
              last_name: lastName,
              email
            }
          ]);

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      setUserRole(profile?.role);

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    userRole,
    isAdmin: userRole === 'admin',
    isDoctor: userRole === 'doctor',
    isPatient: userRole === 'patient',
    isNurse: userRole === 'nurse',
    isPharmacist: userRole === 'pharmacist',
    isLabTechnician: userRole === 'lab_technician',
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}