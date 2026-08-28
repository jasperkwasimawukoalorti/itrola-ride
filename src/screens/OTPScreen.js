import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors, spacing, typography, radius } from '../theme/theme';
import BrandAccent from '../components/BrandAccent';
import LogoMark from '../components/LogoMark';
import PrimaryButton from '../components/PrimaryButton';
import { verifyOtp, requestOtp } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OTPScreen({ route, navigation }) {
  const { phone, role } = route.params; // role: 'rider' | 'driver'
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();

  const handleVerify = async () => {
    if (otp.trim().length < 4) {
      Alert.alert('Enter the code', 'Please enter the 4-6 digit code sent to your phone.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp.trim(), role);
      // Backend now returns user_id alongside access_token — see BACKEND_PATCH.md
      const { access_token, user_id } = res.data;
      if (!user_id) {
        Alert.alert(
          'Missing user id',
          'Login succeeded but no user_id came back from /auth/verify-otp. Apply the backend patch first.'
        );
        setLoading(false);
        return;
      }
      await login(access_token, phone, role, user_id);
      // Navigation resets automatically once AuthContext's isAuthenticated flips —
      // see RootNavigator.
    } catch (err) {
      Alert.alert(
        'Invalid code',
        err?.response?.data?.detail || 'That code was incorrect or has expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await requestOtp(phone);
      Alert.alert('Code sent', `A new code was sent to ${phone}`);
    } catch (err) {
      Alert.alert('Could not resend', 'Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <LogoMark size={44} />
        <Text style={styles.headerText}>Verify your number</Text>
      </View>
      <BrandAccent height={8} />

      <View style={styles.form}>
        <Text style={typography.body}>
          Enter the code sent to <Text style={{ fontWeight: '700' }}>{phone}</Text>
        </Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          placeholder="• • • • • •"
          placeholderTextColor={colors.slate}
          maxLength={6}
        />

        <View style={{ height: spacing.md }} />
        <PrimaryButton title="Verify & Continue" onPress={handleVerify} loading={loading} />

        <PrimaryButton
          title={resending ? 'Resending…' : 'Resend code'}
          onPress={handleResend}
          variant="outline"
          disabled={resending}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { backgroundColor: colors.pink, paddingTop: 70, paddingBottom: spacing.xl, alignItems: 'center' },
  headerText: { fontSize: 22, fontWeight: '800', color: colors.cyan, marginTop: spacing.sm },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  otpInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.charcoal,
    backgroundColor: colors.white,
    marginTop: spacing.lg,
  },
});
