import React, { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function FloatingInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "none",
  textContentType,
  returnKeyType,
  onSubmitEditing,
  editable = true,
}) {
  const [isFocused, setIsFocused] = useState(false);

  // "active" means label should float (focused OR has value)
  const active = useMemo(() => isFocused || !!value, [isFocused, value]);
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, {
      duration: 160,
      easing: Easing.out(Easing.cubic),
    });
  }, [active]);

  const labelAnimStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [14, -8]);
    const scale = interpolate(progress.value, [0, 1], [1.0, 0.88]);
    const color = interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(17,24,39,0.55)", "#0c4a6e"]
    );
    return {
      transform: [{ translateY }, { scale }],
      color,
    };
  });

  const containerAnimStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(209,213,219,1)", "#0c4a6e"]
    );
    return { borderColor };
  });

  return (
    <Animated.View style={[styles.container, containerAnimStyle]}>
      <Animated.Text style={[styles.label, labelAnimStyle]}>
        {label}
      </Animated.Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        textContentType={textContentType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        placeholder={active ? "" : ""}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 12, android: 10 }),
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  label: {
    position: "absolute",
    left: 14,
    top: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 2,
    color: "#111827",
  },
});
