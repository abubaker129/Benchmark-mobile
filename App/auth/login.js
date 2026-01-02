import { SafeAreaProvider } from 'react-native-safe-area-context';

import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  Switch,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import FloatingInput from "../components/FloatingInput"
import Loader from "../components/Loader";



export default function Login({ navigation }) {
  // your existing code


  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  const compact = useSharedValue(0);
  const overlay = useSharedValue(0);

  const onLoginPress = () => {
    if (loggingIn) return;
    setLoggingIn(true);

    compact.value = withTiming(1, { duration: 220 });
    overlay.value = withTiming(1, { duration: 220 });

    setTimeout(() => {
      overlay.value = withTiming(0, { duration: 200 });
      compact.value = withTiming(0, { duration: 220 });
      setLoggingIn(false);
      navigation.replace("AppTabs");
    }, 4200);
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(compact.value, [0, 1], [1, 0.96]) },
      { translateY: interpolate(compact.value, [0, 1], [0, -18]) },
    ],
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(overlay.value, [0, 1], [140, 0]) },
    ],
    opacity: overlay.value,
  }));

  return (
    <SafeAreaView style={styles.root } edges={['top', 'left', 'right']}>
      <ImageBackground
        source={require("../assets/images/bg.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "undefined"}
      >
       <ScrollView
  contentContainerStyle={{ paddingBottom: 20 }}
  keyboardShouldPersistTaps="handled"
  bounces={false}
>

          <Animated.View
            style={[
              styles.cardWrap,
              {
                marginTop: height * 0.42,
                paddingTop: insets.top > 0 ? 16 : 24,
              },
              cardAnimStyle,
            ]}
          >
            <Text style={styles.brand}>Benchmark</Text>

            <Text style={styles.head}>Let’s Get Started</Text>
            <Text style={styles.subhead}>
              Sign in to continue to your client portal.
            </Text>

            <FloatingInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loggingIn}
            />

            <FloatingInput
              label="Password"
              value={pass}
              onChangeText={setPass}
              secureTextEntry
              onSubmitEditing={onLoginPress}
              editable={!loggingIn}
            />

            <View style={styles.rememberRow}>
              <Switch
                value={remember}
                onValueChange={setRemember}
                disabled={loggingIn}
                trackColor={{ false: "#D1D5DB", true: "#7fb0c7" }}
                thumbColor={remember ? "#0c4a6e" : "#f4f4f5"}
              />
              <Text style={styles.rememberText}>Remember me</Text>
            </View>

            <Pressable
              onPress={onLoginPress}
              disabled={loggingIn}
              style={[styles.loginBtn, loggingIn && { opacity: 0.7 }]}
            >
              <Text style={styles.loginBtnText}>Log In</Text>
            </Pressable>
          </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>

      <Animated.View style={[styles.loginOverlay, overlayAnimStyle]}>
        
        <View style={{ marginLeft: 14 }}>
          <Text style={styles.overlayTitle}>Logging in…</Text>
          <Text style={styles.overlayText}>Please wait a moment</Text>
        </View>
        <View style={{marginLeft:137}}>
        <Loader size={28} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0c4a6e",
  },
  bg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    
    
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12,74,110,0.12)",
  },
  cardWrap: {
    width: "100%",
borderTopLeftRadius: 25,
borderTopRightRadius: 25,
borderBottomLeftRadius: 0,
borderBottomRightRadius: 0,
    backgroundColor: "#fff",
    
    paddingHorizontal: 18,
    paddingBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0c4a6e",
    marginBottom: 10,
  },
  head: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  subhead: {
    fontSize: 13,
    color: "rgba(17,24,39,0.6)",
    marginBottom: 14,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 14,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(17,24,39,0.7)",
  },
  loginBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0c4a6e",
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  loginOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  overlayTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0c4a6e",
  },
  overlayText: {
    fontSize: 12,
    color: "rgba(17,24,39,0.6)",
    marginTop: 2,
  },
});
