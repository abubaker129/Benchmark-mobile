import LottieView from "lottie-react-native";
import { View } from "react-native";

export default function Loader({ size = 140 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LottieView
        source={require("../assets/lottie/loader.json")}
        autoPlay
        loop
        style={{
          width: 240,
          height: 240,
        }}
      />
    </View>
  );
}
