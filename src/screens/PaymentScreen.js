import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { colors, spacing, typography, radius, shadow } from '../theme/theme';
import BrandAccent from '../components/BrandAccent';
import AppMenu, { MenuButton } from '../components/AppMenu';
import PrimaryButton from '../components/PrimaryButton';
import { payForTrip, getTrip } from '../api/client';
import { useAuth } from '../context/AuthContext';

const NETWORKS = [
  { key: 'mtn', label: 'MTN MoMo' },
  { key: 'vodafone', label: 'Telecel Cash' },
  { key: 'airteltigo', label: 'AirtelTigo Money' },
];

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90000;

export default function PaymentScreen({ route, navigation }) {
  const { tripId, fare } = route.params;
  const [momoNumber, setMomoNumber] = useState('');
  const [network, setNetwork] = useState('mtn');
  const [paying, setPaying] = useState(false);
  const [waitingConfirm, setWaitingConfirm] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout } = useAuth();

  const pollPaymentStatus = () => {
    const start = Date.now();
    setWaitingConfirm(true);
    const interval = setInterval(async () => {
      try {
        const res = await getTrip(tripId);
        if (res.data.payment_status === 'paid') {
          clearInterval(interval);
          setWaitingConfirm(false);
          Alert.alert('Payment received', 'Thanks for riding with itrola!', [
            { text: 'Done', onPress: () => navigation.navigate('Home') },
          ]);
        } else if (res.data.payment_status === 'failed') {
          clearInterval(interval);
          setWaitingConfirm(false);
          Alert.alert('Payment failed', 'Please try again.');
        } else if (Date.now() - start > POLL_TIMEOUT_MS) {
          clearInterval(interval);
          setWaitingConfirm(false);
          Alert.alert(
            'Still processing',
            'Your payment is taking longer than expected. Check back shortly — it may still complete.'
          );
        }
      } catch (e) {
        // keep polling through transient errors
      }
    }, POLL_INTERVAL_MS);
  };

  const handlePay = async () => {
    if (momoNumber.trim().length < 9) {
      Alert.alert('Check your number', 'Enter the mobile money number to charge.');
      return;
    }
    setPaying(true);
    try {
      await payForTrip(tripId, momoNumber.trim(), network);
      Alert.alert(
        'Approve on your phone',
        'A prompt has been sent to your phone. Approve it to complete payment.'
      );
      pollPaymentStatus();
    } catch (err) {
      Alert.alert('Could not start payment', err?.response?.data?.detail || 'Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Trip complete</Text>
        <Text style={styles.fareText}>GH₵ {Number(fare || 0).toFixed(2)}</Text>
        <MenuButton onPress={() => setMenuVisible(true)} />
      </View>
      <BrandAccent height={8} />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={typography.h3}>Pay with Mobile Money</Text>

        <View style={styles.networkRow}>
          {NETWORKS.map((n) => (
            <View
              key={n.key}
              style={[
                styles.networkChip,
                network === n.key && styles.networkChipActive,
              ]}
              onTouchEnd={() => setNetwork(n.key)}
            >
              <Text
                style={[
                  styles.networkText,
                  network === n.key && { color: colors.white },
                ]}
              >
                {n.label}
              </Text>
            </View>
          ))}
        </View>

        <TextInput
          style={styles.input}
          value={momoNumber}
          onChangeText={setMomoNumber}
          keyboardType="phone-pad"
          placeholder="MoMo number, e.g. 0209998877"
          placeholderTextColor={colors.slate}
        />

        <View style={{ height: spacing.lg }} />
        <PrimaryButton
          title={waitingConfirm ? 'Waiting for approval…' : 'Pay Now'}
          onPress={handlePay}
          loading={paying}
          disabled={waitingConfirm}
          variant="accent"
        />
      </ScrollView>

      <AppMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={[{ label: 'Log out', danger: true, onPress: logout }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { backgroundColor: colors.pink, paddingTop: 70, paddingBottom: spacing.xl, alignItems: 'center' },
  heroLabel: { fontSize: 16, color: colors.background },
  fareText: { fontSize: 34, fontWeight: '800', color: colors.cyan, marginTop: spacing.xs },
  body: { flexGrow: 1, padding: spacing.lg },
  networkRow: { flexDirection: 'row', marginTop: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  networkChip: {
    borderWidth: 1.5,
    borderColor: colors.pink,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  networkChipActive: { backgroundColor: colors.pink },
  networkText: { fontSize: 13, fontWeight: '600', color: colors.pink },
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
