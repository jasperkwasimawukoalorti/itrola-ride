import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function LogoMark({ size = 56 }) {
  return (
    <Image
      source={require('../assets/icon.png')}
      style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // add any shadow/border styling here if desired
  },
});