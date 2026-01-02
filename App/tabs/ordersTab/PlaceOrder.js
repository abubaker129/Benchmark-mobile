import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Colors from "../../constants/colors";

//CONSTANTS 

const ORDER_TYPES = [
  "2D Floor Plan",
  "3D Floorplan",
  "EPC",
  "Site Plan",
  "Photo Editing",
  "Video Editing",
  "Virtual Staging",
  "Video Slideshows",
  "Walkthrough Animation",
  "CGI",
];

/*SCREEN*/

export default function PlaceOrder() {
  const [address, setAddress] = useState("");
  const [orderType, setOrderType] = useState("");
  const [code, setCode] = useState("");
  const [filesLink, setFilesLink] = useState("");
  const [preferences, setPreferences] = useState("");
  const [open, setOpen] = useState(false);

  const isValid = address.trim() && orderType;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Place a New Order</Text>

          {/* Address / Order ID */}
          <Label text="Address / Order ID" required />
          <TextInput
            style={styles.input}
            placeholder="Enter property address or order ID"
            value={address}
            onChangeText={setAddress}
          />

          {/* Order Type Dropdown */}
          <Label text="Order Type" required />
          <Pressable style={styles.input} onPress={() => setOpen(true)}>
            <Text
              style={{
                color: orderType ? Colors.text : Colors.placeholder,
              }}
            >
              {orderType || "Select order type"}
            </Text>
          </Pressable>

          {/* Code */}
          <Label text="Code" />
          <TextInput
            style={styles.input}
            placeholder="Enter client code (optional)"
            value={code}
            onChangeText={setCode}
          />

          {/* Files Link */}
          <Label text="Files Link (URL)" />
          <TextInput
            style={styles.input}
            placeholder="Dropbox, WeTransfer etc."
            value={filesLink}
            onChangeText={setFilesLink}
          />

          {/* Preferences */}
          <Label text="Preferences" />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter order preferences"
            value={preferences}
            onChangeText={setPreferences}
            multiline
          />

          {/* Upload Placeholder */}
          <View style={styles.uploadBox}>
            <Text style={styles.uploadText}>
              Choose files or drag & drop
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              !isValid && styles.submitDisabled,
            ]}
            disabled={!isValid}
            onPress={() => {
              console.log({
                address,
                orderType,
                code,
                filesLink,
                preferences,
              });
            }}
          >
            <Text style={styles.submitText}>Submit Form</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ORDER TYPE MODAL */}
      <Modal visible={open} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modal}>
            {ORDER_TYPES.map(item => (
              <Pressable
                key={item}
                style={styles.option}
                onPress={() => {
                  setOrderType(item);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* REUSABLE LABEL */

function Label({ text, required }) {
  return (
    <Text style={styles.label}>
      {text} {required && <Text style={styles.required}>*</Text>}
    </Text>
  );
}

/* STYLES  */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: Colors.text,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.text,
  },
  required: {
    color: Colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadText: {
    color: Colors.placeholder,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
  },
});
