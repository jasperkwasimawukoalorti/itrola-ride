import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme/theme';
import BrandAccent from '../components/BrandAccent';
import LogoMark from '../components/LogoMark';
import PrimaryButton from '../components/PrimaryButton';
import { requestOtp } from '../api/client';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('+233');
  const [role, setRole] = useState('rider'); // 'rider' | 'driver'
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (phone.trim().length < 10) {
      Alert.alert('Check your number', 'Enter a valid phone number, e.g. +233209998877');
      return;
    }
    setLoading(true);
    try {
      await requestOtp(phone.trim());
      navigation.navigate('OTP', { phone: phone.trim(), role });
    } catch (err) {
      Alert.alert(
        'Could not send code',
        err?.response?.data?.detail || 'Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <LogoMark />
          <Text style={styles.logoText}>itrola Ride</Text>
          <Text style={styles.tagline}>Move around Ghana, your way.</Text>
        </View>
        <BrandAccent height={8} />

        <View style={styles.form}>
          <View style={styles.roleSwitch}>
            <TouchableOpacity
              style={[styles.rolePill, role === 'rider' && styles.rolePillActive]}
              onPress={() => setRole('rider')}
              activeOpacity={0.85}
            >
              <Text style={[styles.roleText, role === 'rider' && styles.roleTextActive]}>
                I'm a Rider
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rolePill, role === 'driver' && styles.rolePillActive]}
              onPress={() => setRole('driver')}
              activeOpacity={0.85}
            >
              <Text style={[styles.roleText, role === 'driver' && styles.roleTextActive]}>
                I'm a Driver
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[typography.h2, { marginTop: spacing.lg }]}>Enter your phone number</Text>
          <Text style={[typography.caption, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
            We'll text you a code to verify it's you.
          </Text>

          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+233 20 999 8877"
            placeholderTextColor={colors.slate}
          />

          <View style={{ height: spacing.lg }} />
          <PrimaryButton title="Continue" onPress={handleContinue} loading={loading} />

          {role === 'driver' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('DriverSignup')}
              style={{ marginTop: spacing.lg, alignItems: 'center' }}
            >
              <Text style={{ color: colors.cyan, fontWeight: '600' }}>
                New driver? Register here
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.pink,
    paddingTop: 70,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.cyan,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  tagline: { fontSize: 14, color: colors.background, marginTop: spacing.xs },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    padding: 4,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  rolePillActive: {
    backgroundColor: colors.pink,
  },
  roleText: { fontSize: 14, fontWeight: '700', color: colors.slate },
  roleTextActive: { color: colors.white },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.charcoal,
    backgroundColor: colors.white,
  },
});
