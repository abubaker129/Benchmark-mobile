import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  Switch,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";

import FloatingInput from "../components/FloatingInput";
import Loader from "../components/Loader";
import Colors from "../constants/colors";
import { useAuth } from "../context/AuthContext";

/* ===================== VALIDATION ===================== */

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

/* ===================== SCREEN ===================== */

export default function Login({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login: authLogin } = useAuth();

  const [remember, setRemember] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [serverError, setServerError] = useState("");

  const compact = useSharedValue(0);
  const overlay = useSharedValue(0);

  /* ===================== ANIMATIONS ===================== */

  const startLoadingAnim = () => {
    compact.value = withTiming(1, { duration: 220 });
    overlay.value = withTiming(1, { duration: 220 });
  };

  const stopLoadingAnim = () => {
    overlay.value = withTiming(0, { duration: 200 });
    compact.value = withTiming(0, { duration: 220 });
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(compact.value, [0, 1], [1, 0.96]) },
      { translateY: interpolate(compact.value, [0, 1], [0, -18]) },
    ],
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(overlay.value, [0, 1], [120, 0]) },
    ],
    opacity: overlay.value,
  }));

  /* ===================== LOGIN HANDLER ===================== */

  const handleLogin = async (values) => {
    if (loggingIn) return;

    setServerError("");

    try {
      setLoggingIn(true);
      startLoadingAnim();

      const signInResult = await authLogin(values.email.trim(), values.password);
      if (!signInResult?.session) {
        throw new Error("Login succeeded but no active session was returned.");
      }
      navigation.replace("AppDrawer");

    } catch (err) {
      setServerError(err?.message || "Incorrect email or password. Please try again.");
    } finally {
      stopLoadingAnim();
      setLoggingIn(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/bg.png")}
        resizeMode="cover"
        style={styles.bg}
      >
        <View style={styles.bgOverlay} />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.contentWrapper}>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={true}
              >
                <View style={styles.spacer} />

                <Formik
                  initialValues={{ email: "", password: "" }}
                  validationSchema={LoginSchema}
                  onSubmit={handleLogin}
                >
                  {({
                    handleChange,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                    isValid,
                  }) => (
                    <>
                      <Animated.View
                        style={[
                          styles.cardWrap,
                          { paddingBottom: Math.max(insets.bottom, 22) },
                          cardAnimStyle,
                        ]}
                      >
                        <Text style={styles.brand}>Benchmark</Text>
                        <Text style={styles.head}>Let's Get Started</Text>
                        <Text style={styles.subhead}>
                          Sign in to continue to your client portal.
                        </Text>

                        {/* EMAIL */}
                        <FloatingInput
                          label="Email Address"
                          value={values.email}
                          onChangeText={(v) => {
                            setServerError("");
                            handleChange("email")(v);
                          }}
                          keyboardType="email-address"
                          error={touched.email && errors.email}
                        />
                        {touched.email && errors.email && (
                          <Text style={styles.errorText}>{errors.email}</Text>
                        )}

                        {/* PASSWORD */}
                        <FloatingInput
                          label="Password"
                          value={values.password}
                          onChangeText={(v) => {
                            setServerError("");
                            handleChange("password")(v);
                          }}
                          secureTextEntry
                          onSubmitEditing={handleSubmit}
                          error={touched.password && errors.password}
                        />
                        {touched.password && errors.password && (
                          <Text style={styles.errorText}>{errors.password}</Text>
                        )}
                        {serverError ? (
                          <Text style={styles.serverError}>{serverError}</Text>
                        ) : null}

                     <View style={styles.optionsRow}>
  {/* REMEMBER ME */}
  <View style={styles.rememberRow}>
    <Switch
      value={remember}
      onValueChange={setRemember}
      disabled={loggingIn}
    />
    <Text style={styles.rememberText}>Remember me</Text>
  </View>

  {/* FORGOT PASSWORD */}
  <Pressable
    onPress={() => navigation.navigate("ForgetPass")}
    disabled={loggingIn}
  >
    <Text style={styles.forgotText}>Forgot Password?</Text>
  </Pressable>
</View>

                        <Pressable
                          onPress={handleSubmit}
                          disabled={!isValid || loggingIn}
                          style={({ pressed }) => [
                            styles.loginBtn,
                            pressed && styles.loginBtnPressed,
                            (!isValid || loggingIn) && styles.disabledBtn,
                          ]}
                        >
                          <Text style={styles.loginBtnText}>Log In</Text>
                        </Pressable>
                      </Animated.View>

                      {/* LOADING OVERLAY */}
                      <Animated.View
                        pointerEvents={loggingIn ? "auto" : "none"}
                        style={[styles.loginOverlay, overlayAnimStyle]}
                      >
                        <Text style={styles.overlayTitle}>Logging in…</Text>
                        <Loader size={28} />
                      </Animated.View>
                    </>
                  )}
                </Formik>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: Colors.primary 
  },
  bg: { 
    ...StyleSheet.absoluteFillObject 
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(43,156,204,0.12)",
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  contentWrapper: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  spacer: {
    flex: 1,
    minHeight: 100,
  },

  cardWrap: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 22,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  brand: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: Colors.primary 
  },
  head: { 
    fontSize: 18, 
    fontWeight: "800", 
    marginTop: 8 
  },
  subhead: { 
    fontSize: 13, 
    opacity: 0.6, 
    marginBottom: 14 
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
  },

 optionsRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginVertical: 12,
},

rememberRow: {
  flexDirection: "row",
  alignItems: "center",
},

forgotText: {
  color: Colors.primary,
  fontWeight: "800",
  fontSize: 13,
  opacity: 0.9,
},


  forgotText: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: 13,
    opacity: 0.9,
  },

  serverError: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 10,
    textAlign: "center",
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    // borderRadius:
  },

  rememberText: { 
    marginLeft: 10, 
    fontWeight: "600", 
    opacity: 0.7 
  },

  loginBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabledBtn: { 
    opacity: 0.6 
  },

  loginBtnText: { 
    color: "#fff", 
    fontWeight: "800" 
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
    justifyContent: "center",
  },

  overlayTitle: { 
    fontWeight: "800", 
    color: Colors.primary,
    marginRight: 25 
  },
});
