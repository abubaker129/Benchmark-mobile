import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useEffect } from "react";
import Loader from "../components/Loader";

const { width } = Dimensions.get("window");

export default function Splash({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      
      navigation.replace("Login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Dummy Logo Placeholder */}
      {/* <View style={styles.logoBox}>
        <Text style={styles.logoText}>LOGO</Text>
      </View> */}

      <Text style={styles.title}>Benchmark</Text>
      <Text style={styles.subtitle}>Client Portal</Text>

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
  logoBox: {
    width: width * 0.35,
    height: width * 0.35,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoText: {
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 2,
  },
  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "600",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
  },
  version: {
    position: "absolute",
    bottom: 24,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
});
