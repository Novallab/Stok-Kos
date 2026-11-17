import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { saveToken, saveUserSession } from './authStorage';
import { C, s } from './shared';

type Props = {
  onLoginSuccess: (email: string) => void;
};

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    if (loading) return;
    setError(null);

    // 1. Validasi Input Kosong
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Format email tidak valid (harus mengandung @ dan domain).');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal harus terdiri dari 6 karakter.');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError('Nama lengkap wajib diisi untuk registrasi.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.');
        return;
      }
    }

    setLoading(true);

    try {
      // Simulasi delay keamanan & verifikasi
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simulasi kredensial (admin / petugas kos)
      const validEmail = 'admin@roomcheck.com';
      const validPass = 'admin123';

      if (!isRegister && (email.trim().toLowerCase() !== validEmail || password !== validPass)) {
        // Izinkan juga jika user mencoba email demo apapun dengan pass "password"
        if (password !== 'password' && password !== 'admin123') {
          throw new Error('Email atau password salah. Cek kredensial Anda.');
        }
      }

      // Simpan session & token secara aman ke Expo SecureStore (TIDAK menyimpan password plain text)
      const mockToken = `sec_jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await saveToken(mockToken);
      await saveUserSession(email.trim());

      onLoginSuccess(email.trim());
    } catch (e: any) {
      setError(e?.message ?? 'Terjadi kesalahan pada sistem autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.headerArea}>
          <Text style={styles.brandTitle} accessibilityRole="header">
            RoomCheck
          </Text>
          <Text style={styles.subtitle}>
            {isRegister ? 'Buat Akun Baru Petugas Kos' : 'Masuk untuk Melanjutkan'}
          </Text>
        </View>

        {/* Tab Switcher: Login / Register */}
        <View style={styles.switchRow}>
          <Pressable
            style={[styles.switchBtn, !isRegister && styles.switchBtnActive]}
            onPress={() => {
              setIsRegister(false);
              setError(null);
            }}
            accessibilityRole="tab"
            accessibilityLabel="Pilih Form Masuk"
          >
            <Text style={[styles.switchText, !isRegister && styles.switchTextActive]}>
              Masuk
            </Text>
          </Pressable>
          <Pressable
            style={[styles.switchBtn, isRegister && styles.switchBtnActive]}
            onPress={() => {
              setIsRegister(true);
              setError(null);
            }}
            accessibilityRole="tab"
            accessibilityLabel="Pilih Form Daftar"
          >
            <Text style={[styles.switchText, isRegister && styles.switchTextActive]}>
              Daftar Baru
            </Text>
          </Pressable>
        </View>

        {isRegister && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama lengkap"
              accessibilityLabel="Nama Lengkap"
              accessibilityHint="Masukkan nama lengkap Anda"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@roomcheck.com"
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Email"
            accessibilityHint="Masukkan email akun Anda"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              ref={passwordRef}
              style={[s.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              accessibilityLabel="Password"
              accessibilityHint="Masukkan password akun Anda"
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={styles.toggleBtn}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>
        </View>

        {isRegister && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Password</Text>
            <TextInput
              ref={confirmRef}
              style={s.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Ulangi password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              accessibilityLabel="Konfirmasi Password"
            />
          </View>
        )}

        {/* Pesan Kesalahan / Validasi */}
        {error && (
          <View style={styles.errorBox} accessibilityLiveRegion="assertive">
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <Pressable
          style={[styles.btnSubmit, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={isRegister ? 'Daftar Akun' : 'Masuk Aplikasi'}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnSubmitText}>
              {isRegister ? 'Daftar' : 'Masuk'}
            </Text>
          )}
        </Pressable>

        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>Demo Akun Tersedia:</Text>
          <Text style={styles.hintItem}>Email: admin@roomcheck.com</Text>
          <Text style={styles.hintItem}>Password: admin123 (atau 'password')</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.primary,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  switchBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.muted,
  },
  switchTextActive: {
    color: C.primary,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleBtn: {
    minHeight: 48,
    paddingHorizontal: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.line,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
  },
  btnSubmit: {
    backgroundColor: C.primary,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  hintBox: {
    marginTop: 18,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 2,
  },
  hintItem: {
    fontSize: 12,
    color: '#3B82F6',
  },
});
