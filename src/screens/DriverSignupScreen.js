import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors, spacing, typography, radius } from '../theme/theme';
import BrandAccent from '../components/BrandAccent';
import LogoMark from '../components/LogoMark';
import PrimaryButton from '../components/PrimaryButton';
import { onboardDriver } from '../api/client';

export default function DriverSignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+233');
  const [ghanaCard, setGhanaCard] = useState('');
  const [license, setLicense] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState(''); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || phone.trim().length < 10 || !ghanaCard.trim() || !license.trim()) {
      Alert.alert('Missing details', 'Please fill in every field before continuing.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(licenseExpiry.trim())) {
      Alert.alert('Check the date', 'Enter your license expiry as YYYY-MM-DD, e.g. 2027-06-30.');
      return;
    }
    setLoading(true);
    try {
      await onboardDriver({
        phone: phone.trim(),
        name: name.trim(),
        ghana_card_number: ghanaCard.trim(),
        license_number: license.trim(),
        license_expiry: licenseExpiry.trim(),
      });
      Alert.alert(
        'Application received',
        "You're registered. Your documents are pending review — once verified, you can log in and go online as a driver.",
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert(
        'Could not register',
        err?.response?.data?.detail || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <LogoMark size={48} />
        <Text style={styles.headerText}>Become a Driver</Text>
      </View>
      <BrandAccent height={8} />

      <View style={styles.form}>
        <Text style={[typography.caption, { marginBottom: spacing.lg }]}>
          Fill in your details below. An admin reviews your Ghana Card and
          license before you can go online — this usually only needs to
          happen once.
        </Text>

        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Kwame Mensah"
          placeholderTextColor={colors.slate}
        />

        <Text style={styles.label}>Phone number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+233 20 111 2233"
          placeholderTextColor={colors.slate}
        />

        <Text style={styles.label}>Ghana Card number</Text>
        <TextInput
          style={styles.input}
          value={ghanaCard}
          onChangeText={setGhanaCard}
          autoCapitalize="characters"
          placeholder="GHA-XXXXXXXXX-X"
          placeholderTextColor={colors.slate}
        />

        <Text style={styles.label}>Driver's license number</Text>
        <TextInput
          style={styles.input}
          value={license}
          onChangeText={setLicense}
          autoCapitalize="characters"
          placeholder="License number"
          placeholderTextColor={colors.slate}
        />

        <Text style={styles.label}>License expiry date</Text>
        <TextInput
          style={styles.input}
          value={licenseExpiry}
          onChangeText={setLicenseExpiry}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.slate}
        />

        <View style={{ height: spacing.lg }} />
        <PrimaryButton title="Submit Application" onPress={handleSubmit} loading={loading} />
        <PrimaryButton
          title="Back to Login"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.pink,
    paddingTop: 70,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headerText: { fontSize: 20, fontWeight: '800', color: colors.cyan, marginTop: spacing.sm },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: '600', color: colors.charcoal, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.charcoal,
    backgroundColor: colors.white,
  },
});
