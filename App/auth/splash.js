import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useEffect } from "react";
import { getToken } from "../utils/token";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const { width } = Dimensions.get("window");

export default function Splash({ navigation }) {
  const { login } = useAuth();

  useEffect(() => {
    const bootstrap = async () => {
      const token = await getToken();

      if (token) {
        await login(token);
        console.log("SPLASH MOUNTED");
        navigation.replace("AppTabs");
      } else {
        navigation.replace("Login");
      }
    };

    const timer = setTimeout(bootstrap, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Benchmark</Text>
      <Text style={styles.subtitle}>Client Portal</Text>

      {/* LOTTIE / LOADER */}
      <Loader size={90} />

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c4a6e",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26, color: "#fff", fontWeight: "600" },
  subtitle: { color: "rgba(255,255,255,0.7)", marginBottom: 24 },
  version: {
    position: "absolute",
    bottom: 24,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
});
