import { View, Text, StyleSheet, Dimensions } from "react-native";
import Loader from "../components/Loader";
import Colors from "../constants/colors";

const { width } = Dimensions.get("window");

export default function Splash() {
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
    backgroundColor: Colors.primary,
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
