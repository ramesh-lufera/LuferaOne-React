import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  AppState, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput,
  type TextInputProps, useWindowDimensions, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, apiRequest } from '../../services/api';
import { saveAuthToken } from '../../services/authStorage';
import { signInWithProvider, type SocialProvider } from '../../services/socialSignIn';

const icons = {
  cloud: require('@/assets/images/sign-in/cloud.svg'),
  name: require('@/assets/images/sign-in/person.svg'),
  email: require('@/assets/images/sign-in/email.svg'),
  phone: require('@/assets/images/sign-in/phone.svg'),
  username: require('@/assets/images/sign-in/username.svg'),
  password: require('@/assets/images/sign-in/lock.svg'),
  eye: require('@/assets/images/sign-in/eye.svg'),
  eyeOff: require('@/assets/images/sign-in/eye-off.svg'),
  check: require('@/assets/images/sign-in/check.svg'),
  Facebook: require('@/assets/images/sign-in/facebook.svg'),
  Google: require('@/assets/images/sign-in/google.svg'),
};

const initialValues = { name: '', email: '', phone: '', username: '', password: '' };
type Field = keyof typeof initialValues;
const fields: { name: Field; label: string; input: TextInputProps }[] = [
  { name: 'name', label: 'Name', input: { autoComplete: 'name', maxLength: 255 } },
  { name: 'email', label: 'Email', input: { autoComplete: 'email', keyboardType: 'email-address', maxLength: 255 } },
  { name: 'phone', label: 'Phone No', input: { autoComplete: 'tel', keyboardType: 'phone-pad', maxLength: 30 } },
  { name: 'username', label: 'Username', input: { autoComplete: 'username', editable: false } },
  { name: 'password', label: 'Password', input: { autoComplete: 'new-password', maxLength: 128 } },
];

const ink = '#111827';
const secondary = '#475467';

export default function SignUpScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const titleSize = Math.min(36, Math.max(22, 17.52 + width * 0.014));
  const [values, setValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [logo, setLogo] = useState<string>();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field | 'terms', string>>>({});
  const [message, setMessage] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [statusPath, setStatusPath] = useState<string>();
  const [busy, setBusy] = useState<'form' | SocialProvider>();
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<{ images?: { logo_url?: string } }>('/auth/branding', { signal: controller.signal })
      .then((branding) => {
        if (!controller.signal.aborted) setLogo(branding?.images?.logo_url);
      })
      .catch(() => {});
    return () => {
      controller.abort();
      request.current?.abort();
    };
  }, []);

  useEffect(() => {
    const endpoint = statusPath;
    if (!endpoint) return;
    const controller = new AbortController();
    let checking = false;

    async function checkStatus() {
      if (!endpoint || checking || AppState.currentState !== 'active' || controller.signal.aborted) return;
      checking = true;
      try {
        const result = await apiRequest<{ verified: boolean }>(endpoint, { signal: controller.signal });
        if (!controller.signal.aborted && result?.verified) {
          setStatusPath(undefined);
          setVerificationMessage('Registration successful!');
        }
      } catch (error) {
        if (!controller.signal.aborted && error instanceof ApiError && [403, 410].includes(error.status)) {
          setStatusPath(undefined);
          setVerificationMessage('');
          setMessage('This verification link has expired. Please sign up again.');
        }
      } finally {
        checking = false;
      }
    }

    const interval = setInterval(checkStatus, 4000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void checkStatus();
    });
    void checkStatus();
    return () => {
      controller.abort();
      subscription.remove();
      clearInterval(interval);
    };
  }, [statusPath]);

  function changeField(name: Field, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === 'email' ? { username: value.split('@')[0] } : {}),
    }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'email' ? { username: undefined } : {}),
    }));
    setMessage('');
  }

  async function submit() {
    if (request.current) return;
    const nextErrors: typeof errors = {};
    if (!values.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    const phone = values.phone.trim();
    const phoneDigits = phone.replace(/\D/g, '');
    if (!/^\+?[0-9 ()-]+$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      nextErrors.phone = 'Enter a phone number with 7 to 15 digits.';
    }
    if (!/^[a-z0-9_.-]{3,50}$/i.test(values.username.trim())) {
      nextErrors.username = 'Use 3–50 letters, numbers, dots, hyphens, or underscores.';
    }
    if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!terms) nextErrors.terms = 'Please accept the Terms & Conditions and Privacy Policy.';
    setErrors(nextErrors);
    setMessage('');
    if (Object.keys(nextErrors).length) return;

    const controller = new AbortController();
    request.current = controller;
    setBusy('form');
    setVerificationMessage('');
    setStatusPath(undefined);
    const timeout = setTimeout(() => {
      if (controller.signal.aborted) return;
      setMessage('The request timed out. Check your email for a verification link or try again.');
      setBusy(undefined);
      request.current = null;
      controller.abort();
    }, 20000);
    try {
      const result = await apiRequest<{ statusPath?: string }>('/register', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          username: values.username.trim().toLowerCase(),
          phone,
          terms,
        }),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (result?.statusPath && /^\/api\/register\/status\/[a-f0-9-]{36}\?/.test(result.statusPath)) {
        setStatusPath(result.statusPath.slice(4));
      }
      setVerificationMessage('Check your email to verify your account.');
      setValues(initialValues);
      setTerms(false);
      setShowPassword(false);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 422) {
        for (const name of [...fields.map((field) => field.name), 'terms'] as const) {
          nextErrors[name] = error.errors?.[name]?.[0];
        }
        setErrors({ ...nextErrors });
        setMessage('Please correct the highlighted fields.');
      } else if (error instanceof ApiError && error.status === 503) {
        setMessage('Unable to send the sign-up email. Please try again later.');
      } else if (error instanceof ApiError && error.status === 429) {
        setMessage('Too many registration attempts. Please try again in a minute.');
      } else {
        setMessage(error instanceof TypeError
          ? 'Unable to connect. Check your connection and try again.'
          : 'Registration is temporarily unavailable. Please try again.');
      }
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted) setBusy(undefined);
      }
    }
  }

  async function signUpWithProvider(provider: SocialProvider) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(provider);
    setMessage('');
    setErrors({});
    try {
      const result = await signInWithProvider(provider, false, controller.signal, { terms });
      if (!result || controller.signal.aborted) return;
      if (!result.token) throw new Error('Unable to finish sign-up. Please try again.');
      await saveAuthToken(result.token, false);
      if (!controller.signal.aborted) router.replace('/dashboard');
    } catch (error) {
      if (controller.signal.aborted) return;
      setMessage(error instanceof TypeError
        ? 'Unable to connect. Check your connection and try again.'
        : error instanceof Error ? error.message : `Unable to sign up with ${provider}.`);
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setBusy(undefined);
    }
  }

  async function openPolicy(path: '/terms-condition' | '/privacy-policy') {
    try {
      const settings = await apiRequest<{ mobileWebOrigin?: string }>('/auth/settings');
      if (!settings.mobileWebOrigin) throw new Error('Missing website address');
      await Linking.openURL(new URL(path, settings.mobileWebOrigin).href);
    } catch {
      setMessage('Unable to open this page. Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Link href="/" asChild>
              <Pressable accessibilityLabel="Lufera Infotech home" style={styles.brand}>
                {logo && (
                  <Image
                    source={logo}
                    contentFit="contain"
                    contentPosition="left center"
                    style={[styles.logo, !logoLoaded && styles.pendingLogo]}
                    onLoad={() => setLogoLoaded(true)}
                    onError={() => setLogo(undefined)}
                  />
                )}
                {(!logo || !logoLoaded) && (
                  <>
                    <Image source={icons.cloud} style={styles.brandIcon} />
                    <Text style={styles.brandText}>Lufera<Text style={styles.brandAccent}>Infotech</Text></Text>
                  </>
                )}
              </Pressable>
            </Link>

            <Text accessibilityRole="header" style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.2 }]}>Sign Up</Text>
            <Text style={styles.intro}>Welcome back! Enter your details</Text>
            {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
            {verificationMessage ? (
              <Text accessibilityLiveRegion="polite" style={styles.success}>{verificationMessage}</Text>
            ) : null}

            <View style={styles.fields}>
              {fields.map(({ name, label, input }) => (
                <View key={name}>
                  <View style={[styles.field, errors[name] && styles.invalid]}>
                    <Image source={icons[name]} style={styles.fieldIcon} />
                    <TextInput
                      {...input}
                      editable={!busy && input.editable !== false}
                      accessibilityLabel={label}
                      autoCapitalize={name === 'name' ? 'words' : 'none'}
                      autoCorrect={false}
                      placeholder={label}
                      placeholderTextColor={secondary}
                      secureTextEntry={name === 'password' && !showPassword}
                      style={styles.input}
                      value={values[name]}
                      onChangeText={(value) => changeField(name, value)}
                    />
                    {name === 'password' && (
                      <Pressable
                        accessibilityRole="togglebutton"
                        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                        accessibilityState={{ checked: showPassword }}
                        onPress={() => setShowPassword((current) => !current)}
                        style={styles.visibility}>
                        <Image source={showPassword ? icons.eyeOff : icons.eye} style={styles.icon} />
                      </Pressable>
                    )}
                  </View>
                  {errors[name] ? <Text accessibilityRole="alert" style={styles.error}>{errors[name]}</Text> : null}
                </View>
              ))}
            </View>

            <View style={styles.terms}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel="Accept Terms & Conditions and Privacy Policy"
                accessibilityState={{ checked: terms }}
                disabled={Boolean(busy)}
                hitSlop={8}
                onPress={() => {
                  setTerms((current) => !current);
                  setErrors((current) => ({ ...current, terms: undefined }));
                  setMessage('');
                }}
                style={[styles.checkbox, terms && styles.checked]}>
                {terms && <Image source={icons.check} style={styles.checkIcon} />}
              </Pressable>
              <Text style={styles.termsText}>
                By creating an account means you agree to the{' '}
                <Text accessibilityRole="link" style={styles.link} onPress={() => void openPolicy('/terms-condition')}>Terms &amp; Conditions</Text>
                {' '}and our{' '}
                <Text accessibilityRole="link" style={styles.link} onPress={() => void openPolicy('/privacy-policy')}>Privacy Policy</Text>
              </Text>
            </View>
            {errors.terms ? <Text accessibilityRole="alert" style={styles.error}>{errors.terms}</Text> : null}

            <Pressable accessibilityRole="button" disabled={Boolean(busy)} onPress={() => void submit()} style={styles.submit}>
              <Text style={styles.submitText}>{busy === 'form' ? 'Creating account…' : 'Sign Up'}</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Or sign up with</Text>
              <View style={styles.line} />
            </View>
            <View style={styles.providers}>
              {(['Facebook', 'Google'] as const).map((provider) => (
                <Pressable
                  key={provider}
                  accessibilityRole="button"
                  disabled={Boolean(busy)}
                  accessibilityState={{ busy: busy === provider, disabled: Boolean(busy) }}
                  onPress={() => void signUpWithProvider(provider)}
                  style={styles.provider}>
                  <Image source={icons[provider]} style={styles.icon} />
                  <Text style={styles.providerText}>{provider}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.footer}>
              Already have an account? <Link href="/sign-in" dismissTo style={styles.link}>Sign In</Link>
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
  brand: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 32 },
  brandIcon: { width: 32, height: 32 },
  brandText: { color: '#183b40', fontSize: 25, lineHeight: 35 },
  brandAccent: { color: '#087a7e' },
  logo: { width: 220, maxWidth: '100%', height: 48 },
  pendingLogo: { position: 'absolute', opacity: 0 },
  title: { color: ink, fontWeight: '600', marginBottom: 12 },
  intro: { color: secondary, fontSize: 18, lineHeight: 27, marginBottom: 32 },
  fields: { gap: 16 },
  field: {
    minHeight: 56, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f6fa', borderColor: '#d1d5df', borderWidth: 1, borderRadius: 12,
  },
  invalid: { borderColor: '#b42318' },
  fieldIcon: { width: 20, height: 20, marginHorizontal: 10 },
  icon: { width: 20, height: 20 },
  input: { flex: 1, minWidth: 0, minHeight: 54, paddingVertical: 0, paddingRight: 12, color: secondary, fontSize: 16 },
  visibility: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  terms: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 20, gap: 12 },
  checkbox: {
    width: 18, height: 18, marginTop: 4, borderWidth: 1, borderColor: '#d5d9e2', borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  checked: { backgroundColor: '#487fff', borderColor: '#487fff' },
  checkIcon: { width: 12, height: 12 },
  termsText: { flex: 1, color: secondary, fontSize: 14, lineHeight: 21 },
  link: { color: '#008b8b', fontWeight: '600' },
  submit: {
    marginTop: 32, minHeight: 55, borderRadius: 12, backgroundColor: '#198b8b',
    alignItems: 'center', justifyContent: 'center',
  },
  submitText: { color: '#071b1b', fontSize: 14, lineHeight: 21 },
  divider: { marginTop: 32, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dividerText: { color: secondary, fontSize: 16, lineHeight: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#d3d8e0' },
  providers: { marginTop: 32, flexDirection: 'row', gap: 16 },
  provider: {
    flex: 1, minHeight: 54, paddingHorizontal: 8, paddingVertical: 8, borderWidth: 1, borderColor: '#e1e5ec',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12,
  },
  providerText: { color: ink, flexShrink: 1, fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 32, color: secondary, textAlign: 'center', fontSize: 14, lineHeight: 21 },
  message: { color: '#b42318', fontSize: 14, marginBottom: 16 },
  success: { color: '#18794e', fontSize: 14, marginBottom: 16 },
  error: { color: '#b42318', fontSize: 14, marginTop: 4 },
});
