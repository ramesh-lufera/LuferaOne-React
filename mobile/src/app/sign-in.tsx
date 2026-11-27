import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ComponentRef, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, apiRequest } from '../../services/api';
import { getAuthToken, removeAuthToken, saveAuthToken } from '../../services/authStorage';
import { signInWithProvider, type SocialProvider } from '../../services/socialSignIn';

const icons = {
  cloud: require('@/assets/images/sign-in/cloud.svg'),
  email: require('@/assets/images/sign-in/email.svg'),
  lock: require('@/assets/images/sign-in/lock.svg'),
  eye: require('@/assets/images/sign-in/eye.svg'),
  eyeOff: require('@/assets/images/sign-in/eye-off.svg'),
  check: require('@/assets/images/sign-in/check.svg'),
  facebook: require('@/assets/images/sign-in/facebook.svg'),
  google: require('@/assets/images/sign-in/google.svg'),
};

const ink = '#0d1627';
const secondary = '#4b5b73';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');
  const [restoring, setRestoring] = useState(true);
  const [busy, setBusy] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const timeout = setTimeout(() => {
      controller.abort();
      setRestoring(false);
    }, 15000);
    apiRequest<{ images?: { logo_url?: string } }>('/auth/branding', { signal })
      .then((branding) => { if (!signal.aborted) setLogo(branding?.images?.logo_url || null); })
      .catch(() => {});

    async function restore() {
      try {
        const token = await getAuthToken();
        if (!token || signal.aborted) return;
        const result = await apiRequest<{ user?: { id: number } }>('/user', { token, signal });
        if (!signal.aborted && result?.user?.id) router.replace('/dashboard');
      } catch (error) {
        if (!signal.aborted && error instanceof ApiError && error.status === 401) {
          await removeAuthToken().catch(() => {});
        }
      } finally {
        if (!signal.aborted) setRestoring(false);
      }
    }

    void restore();
    return () => {
      clearTimeout(timeout);
      controller.abort();
      requestRef.current?.abort();
    };
  }, [router]);

  async function authenticate(request: (signal: AbortSignal) => Promise<{ token: string } | null>, provider?: SocialProvider) {
    if (restoring || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setMessage('');
    let timedOut = false;
    const timeout = provider ? undefined : setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);
    try {
      const result = await request(controller.signal);
      clearTimeout(timeout);
      if (!result || controller.signal.aborted) return;
      if (typeof result.token !== 'string' || !result.token.trim()) {
        throw new Error('Unable to sign in. Please try again.');
      }
      await saveAuthToken(result.token, remember);
      if (!controller.signal.aborted) router.replace('/dashboard');
    } catch (error) {
      if (timedOut) {
        setMessage('Sign-in timed out. Check your connection and try again.');
      } else if (controller.signal.aborted) {
        return;
      } else if (error instanceof ApiError && !provider && error.status === 401) {
        setMessage('Invalid email or password.');
      } else if (error instanceof ApiError && error.status === 429) {
        setMessage('Too many attempts. Please try again in a minute.');
      } else if (error instanceof TypeError) {
        setMessage('Unable to connect to the server. Please try again.');
      } else {
        setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
      }
    } finally {
      clearTimeout(timeout);
      requestRef.current = null;
      if (!controller.signal.aborted || timedOut) setBusy(false);
    }
  }

  function submit() {
    if (restoring || requestRef.current) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('Enter a valid email address.');
    } else if (!password) {
      setMessage('Enter your password.');
      passwordInput.current?.focus();
    } else {
      void authenticate(async (signal) => {
        const result = await apiRequest<{ token: string; user?: { id: number } } | null>('/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password, remember }),
          signal,
        });
        if (!result?.user?.id) throw new Error('Unable to sign in. Please try again.');
        return result;
      });
    }
  }

  const disabled = busy || restoring;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <View style={styles.brand}>
              {logo && (
                <Image
                  accessibilityLabel="Company logo"
                  source={logo}
                  contentFit="contain"
                  contentPosition="left center"
                  style={[styles.companyLogo, !logoLoaded && styles.pendingLogo]}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => setLogo(null)}
                />
              )}
              {(!logo || !logoLoaded) && (
                <>
                  <Image source={icons.cloud} style={styles.brandIcon} />
                  <Text style={styles.brandText}>Lufera<Text style={styles.brandAccent}>Infotech</Text></Text>
                </>
              )}
            </View>

            <Text accessibilityRole="header" style={styles.title}>Sign In</Text>
            <Text style={styles.intro}>Welcome back! Enter your details</Text>

            {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}

            <View style={[styles.field, styles.emailField]}>
              <Image source={icons.email} style={styles.fieldIcon} />
              <TextInput
                accessibilityLabel="Email"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                placeholder="Email"
                placeholderTextColor={secondary}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={() => passwordInput.current?.focus()}
              />
            </View>

            <View style={[styles.field, styles.passwordField]}>
              <Image source={icons.lock} style={styles.fieldIcon} />
              <TextInput
                ref={passwordInput}
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoComplete="current-password"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                returnKeyType="go"
                placeholder="Password"
                placeholderTextColor={secondary}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={submit}
              />
              <Pressable
                accessibilityRole="togglebutton"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityState={{ checked: showPassword }}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.visibility}>
                <Image source={showPassword ? icons.eyeOff : icons.eye} style={styles.icon} />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              disabled={disabled}
              accessibilityState={{ checked: remember }}
              onPress={() => setRemember(!remember)}
              hitSlop={8}
              style={styles.remember}>
              <View style={[styles.checkbox, remember && styles.checked]}>
                {remember && <Image source={icons.check} style={styles.checkIcon} />}
              </View>
              <Text style={styles.body}>Remember me</Text>
            </Pressable>

            <Pressable accessibilityRole="button" disabled={disabled} onPress={submit} style={styles.submit}>
              <Text style={styles.submitText}>{restoring ? 'Checking sign-in...' : busy ? 'Signing in...' : 'Sign In'}</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.body}>Or sign in with</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.providers}>
              {(['Facebook', 'Google'] as const).map((provider) => (
                <Pressable
                  key={provider}
                  accessibilityRole="button"
                  disabled={disabled}
                  onPress={() => void authenticate((signal) => signInWithProvider(provider, remember, signal), provider)}
                  style={styles.provider}>
                  <Image source={provider === 'Facebook' ? icons.facebook : icons.google} style={styles.icon} />
                  <Text style={styles.providerText}>{provider}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.footer}>
              Don’t have an account?{' '}
              <Text
                accessibilityRole="link"
                onPress={() => router.push('/sign-up')}
                style={styles.signUp}>
                Sign Up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  form: { width: '100%', maxWidth: 464 },
  brand: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 40 },
  brandIcon: { width: 30, height: 30 },
  companyLogo: { width: 220, maxWidth: '100%', height: 32 },
  pendingLogo: { position: 'absolute', opacity: 0 },
  brandText: { color: '#172c2e', fontSize: 26, fontWeight: '600', letterSpacing: -1.2, lineHeight: 32 },
  brandAccent: { color: '#007779' },
  title: { color: ink, fontSize: 36, fontWeight: '600', lineHeight: 43, marginBottom: 12 },
  intro: { color: secondary, fontSize: 18, lineHeight: 27, marginBottom: 32 },
  field: {
    minHeight: 56, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f6fa', borderColor: '#cfd4df', borderWidth: 1, borderRadius: 12,
  },
  emailField: { marginBottom: 16 },
  passwordField: { marginBottom: 20 },
  fieldIcon: { width: 20, height: 20, marginHorizontal: 10 },
  icon: { width: 20, height: 20 },
  input: { flex: 1, minWidth: 0, minHeight: 54, paddingVertical: 0, paddingRight: 12, color: secondary, fontSize: 16 },
  visibility: { width: 44, minHeight: 44, marginRight: 7, alignItems: 'center', justifyContent: 'center' },
  remember: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 12 },
  checkbox: {
    width: 18, height: 18, borderWidth: 1, borderColor: '#d5d9e2', borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  checked: { backgroundColor: '#487fff', borderColor: '#487fff' },
  checkIcon: { width: 12, height: 12 },
  body: { color: secondary, fontSize: 16, lineHeight: 24 },
  submit: { marginTop: 32, minHeight: 56, borderRadius: 12, backgroundColor: '#208d8f', alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#081321', fontSize: 14, fontWeight: '600' },
  divider: { marginTop: 32, flexDirection: 'row', alignItems: 'center', gap: 4 },
  line: { flex: 1, height: 1, backgroundColor: '#d3d8e0' },
  providers: { marginTop: 32, flexDirection: 'row', gap: 16 },
  provider: {
    flex: 1, minHeight: 54, paddingHorizontal: 8, paddingVertical: 8, borderWidth: 1, borderColor: '#e1e5ec',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12,
  },
  providerText: { color: ink, flexShrink: 1, fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 32, color: secondary, textAlign: 'center', fontSize: 14, lineHeight: 21 },
  signUp: { color: '#0097a5', fontWeight: '600' },
  message: { color: '#b42318', fontSize: 14, marginBottom: 16 },
});
