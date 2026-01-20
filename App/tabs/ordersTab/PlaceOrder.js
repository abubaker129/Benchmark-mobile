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
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/colors";
import { submitOrder } from "../../api/orders.api";

/* ===================== CONSTANTS ===================== */

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

const MAX_IMAGES = 20;

/* ===================== SCREEN ===================== */

export default function PlaceOrder() {
  const [address, setAddress] = useState("");
  const [orderType, setOrderType] = useState("");
  const [code, setCode] = useState("");
  const [filesLink, setFilesLink] = useState("");
  const [preferences, setPreferences] = useState("");
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [markings, setMarkings] = useState({});
const openMarkingEditor = (img) => setEditingImage(img);
const closeMarkingEditor = () => setEditingImage(null);
  const isValid = address.trim() && orderType;

  /* ===================== IMAGE PICK ===================== */

  const pickImages = async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        Alert.alert("Limit Reached", `Max ${MAX_IMAGES} images allowed.`);
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Allow gallery access.");
        return;
      }

      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const remaining = MAX_IMAGES - images.length;
        const newImages = result.assets.slice(0, remaining).map((asset, i) => ({
          ...asset,
          id: Date.now() + i,
          marked: false,
        }));

        setImages(prev => [...prev, ...newImages]);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to pick images");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== IMAGE REMOVE ===================== */

  const removeImage = (id) => {
    Alert.alert("Remove Image?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setImages(prev => prev.filter(img => img.id !== id));
          setMarkings(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        },
      },
    ]);
  };

  /* ===================== MARKING ===================== */

  const toggleImageMark = (id) => {
    setImages(prev =>
      prev.map(img =>
        img.id === id ? { ...img, marked: !img.marked } : img
      )
    );
  };

 

  /* ===================== SUBMIT ===================== */

  const handleSubmit = () => {
    Alert.alert("Submit Order", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: async () => {
          try {
            setLoading(true);

          const result = await submitOrder(formData);
            Alert.alert(
              "Success",
              `Order submitted successfully!\nOrder ID: ${result.order_id}`
            );

            // RESET STATE ON SUCCESS
            setAddress("");
            setOrderType("");
            setCode("");
            setFilesLink("");
            setPreferences("");
            setImages([]);
            setMarkings({});
          } catch (e) {
            Alert.alert("Error", e.message || "Failed to submit order");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };


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
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Place a New Order</Text>

          <Label text="Address / Order ID" required />
          <TextInput
            style={styles.input}
            placeholder="Enter property address or order ID"
            value={address}
            onChangeText={setAddress}
          />

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

          <Label text="Code" />
          <TextInput
            style={styles.input}
            placeholder="Client code (optional)"
            value={code}
            onChangeText={setCode}
          />

          <Label text="Files Link (URL)" />
          <TextInput
            style={styles.input}
            placeholder="Dropbox, Google Drive, etc."
            value={filesLink}
            onChangeText={setFilesLink}
            keyboardType="url"
            autoCapitalize="none"
          />

          <Label text="Preferences" />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Order preferences"
            value={preferences}
            onChangeText={setPreferences}
            multiline
          />

          {/* IMAGE PICKER */}
          <View style={styles.imageSection}>
            <View style={styles.imageSectionHeader}>
              <Label text="Reference Images" />
              {images.length > 0 && (
                <Text style={styles.imageCount}>
                  {images.length}/{MAX_IMAGES}
                </Text>
              )}
            </View>

            <Pressable
              style={styles.uploadBox}
              onPress={pickImages}
              disabled={loading || images.length >= MAX_IMAGES}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={32}
                    color={Colors.primary}
                  />
                  <Text style={styles.uploadTitle}>Upload Images</Text>
                  <Text style={styles.uploadSubtitle}>
                    {images.length >= MAX_IMAGES
                      ? "Maximum limit reached"
                      : "Tap to select multiple images"}
                  </Text>
                </>
              )}
            </Pressable>

            {/* IMAGE GRID */}
            {images.length > 0 && (
              <View style={styles.imageGrid}>
                {images.map((img, index) => (
                  <View key={img.id} style={styles.imageCard}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => openMarkingEditor(img)}
                    >
                      <Image
                        source={{ uri: img.uri }}
                        style={styles.gridImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>

                    {/* Marked Badge */}
                    {img.marked && (
                      <View style={styles.markedBadge}>
                        <Ionicons name="star" size={14} color="#FCD34D" />
                      </View>
                    )}

                    {/* Has Note Badge */}
                    {markings[img.id] && (
                      <View style={styles.noteBadge}>
                        <Ionicons name="chatbox" size={12} color="#fff" />
                      </View>
                    )}

                    {/* Remove Button */}
                    <TouchableOpacity
                      style={styles.removeIcon}
                      onPress={() => removeImage(img.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color="#EF4444"
                      />
                    </TouchableOpacity>

                    {/* Image Number */}
                    <View style={styles.imageNumber}>
                      <Text style={styles.imageNumberText}>{index + 1}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !isValid && styles.submitDisabled]}
            disabled={!isValid}
            activeOpacity={0.85}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>Submit Order</Text>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Order Type</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {ORDER_TYPES.map(item => (
                <Pressable
                  key={item}
                  style={[
                    styles.option,
                    orderType === item && styles.optionSelected,
                  ]}
                  onPress={() => {
                    setOrderType(item);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      orderType === item && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {orderType === item && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* IMAGE MARKING MODAL */}
      {editingImage && (
        <Modal
          visible={!!editingImage}
          transparent
          animationType="fade"
          onRequestClose={closeMarkingEditor}
        >
          <View style={styles.markingModalOverlay}>
            <View style={styles.markingModal}>
              {/* Header */}
              <View style={styles.markingHeader}>
                <Text style={styles.markingTitle}>Add Note / Mark Image</Text>
                <TouchableOpacity onPress={closeMarkingEditor}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {/* Image Preview */}
              <Image
                source={{ uri: editingImage.uri }}
                style={styles.markingImage}
                resizeMode="contain"
              />

              {/* Mark as Important */}
              <TouchableOpacity
                style={styles.markButton}
                onPress={() => toggleImageMark(editingImage.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={editingImage.marked ? "star" : "star-outline"}
                  size={20}
                  color={editingImage.marked ? "#FCD34D" : Colors.text}
                />
                <Text
                  style={[
                    styles.markButtonText,
                    editingImage.marked && styles.markButtonTextActive,
                  ]}
                >
                  {editingImage.marked ? "Marked as Important" : "Mark as Important"}
                </Text>
              </TouchableOpacity>

              {/* Note Input */}
              <View style={styles.noteSection}>
                <Text style={styles.noteLabel}>Add Note (Optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="E.g., 'Use this angle', 'Focus on kitchen', etc."
                  value={markings[editingImage.id] || ""}
                  onChangeText={(text) =>
                    setMarkings(prev => ({
                      ...prev,
                      [editingImage.id]: text,
                    }))
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.markingActions}>
                <TouchableOpacity
                  style={styles.markingCancelBtn}
                  onPress={closeMarkingEditor}
                  activeOpacity={0.7}
                >
                  <Text style={styles.markingCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.markingSaveBtn}
                  onPress={closeMarkingEditor}
                  activeOpacity={0.7}
                >
                  <Text style={styles.markingSaveText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

/* ===================== LABEL ===================== */

function Label({ text, required }) {
  return (
    <Text style={styles.label}>
      {text} {required && <Text style={styles.required}>*</Text>}
    </Text>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  container: { padding: 16, backgroundColor: "#fff", paddingBottom: 40 },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: Colors.text,
  },

  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: Colors.text },
  required: { color: Colors.error },

  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },
  textArea: { height: 100, textAlignVertical: "top" },

  // Image Section
  imageSection: {
    marginBottom: 20,
  },
  imageSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imageCount: {
    fontSize: 13,
    color: Colors.placeholder,
    fontWeight: "600",
  },

  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#F0F9FF",
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 8,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: Colors.placeholder,
    marginTop: 4,
  },

  // Image Grid
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageCard: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  removeIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageNumber: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageNumberText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  markedBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 4,
    borderRadius: 6,
  },
  noteBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: Colors.primary,
    padding: 4,
    borderRadius: 6,
  },

  submitBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  modalScroll: {
    maxHeight: 400,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: "#F0F9FF",
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: Colors.primary,
  },

  // Marking Modal
  markingModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    padding: 20,
  },
  markingModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  markingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  markingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  markingImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  markButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginBottom: 16,
  },
  markButtonText: {
    fontSize: 15,
    color: Colors.text,
  },
  markButtonTextActive: {
    fontWeight: "600",
    color: "#F59E0B",
  },
  noteSection: {
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.text,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    fontSize: 15,
  },
  markingActions: {
    flexDirection: "row",
    gap: 12,
  },
  markingCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  markingCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  markingSaveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  markingSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});