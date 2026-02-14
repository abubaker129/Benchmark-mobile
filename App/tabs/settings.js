import React, { useMemo, useState, useCallback } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Switch,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Colors from "../constants/colors";
import AppHeader from "../components/AppHeader";
import Spacing from "../constants/spacing";

const TEMPLATE_TABS = ["All", "Floor Plans", "Image Services", "Matterport / 3D Services","Video/Marketing"];
const SERVICE_GROUPS = [
  {
    title: "Floor Plans",
    items: [
      { id: "fp-2d-bw", name: "2D Floor Plan (Black & White)", price: 75 },
      { id: "fp-2d-color", name: "2D Floor Plan (Colored / Branded)", price: 125 },
      { id: "fp-3d", name: "3D / Interactive Floor Plan", price: 250 },
    ],
  },
  {
    title: "Image Services",
    items: [
      { id: "img-qa", name: "Photography QA / Enhancement", price: 50 },
      { id: "img-ai", name: "AI Image Enhancement", price: 35 },
    ],
  },
  {
    title: "Matterport / 3D Services",
    items: [
      { id: "mp-post", name: "Matterport Post-Production / Processing", price: 200 },
      { id: "mp-floor", name: "Matterport Floor Plan Processing", price: 175 },
      { id: "mp-image", name: "Matterport Image Enhancement", price: 100 },
      { id: "mp-qa", name: "Matterport Tours QA", price: 75 },
      { id: "mp-staging", name: "Virtual Staging in Matterport Tours", price: 300 },
    ],
  },
  {
    title: "Video / Marketing",
    items: [
      { id: "vid-walk", name: "Walkthrough Video", price: 350 },
      { id: "vid-qa", name: "Video QA / Editing", price: 150 },
      { id: "vid-bundle", name: "Marketing Asset Bundle", price: 500 },
    ],
  },
];

export default function Settings() {
  const navigation = useNavigation();
  const [mode, setMode] = useState("templates");
  const [activeTab, setActiveTab] = useState("All");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [templateType, setTemplateType] = useState("upload");
  const [selectedServices, setSelectedServices] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [templateLink, setTemplateLink] = useState("");
  const [presetName, setPresetName] = useState("");
  const [presetDefault, setPresetDefault] = useState(false);

  const isTemplates = mode === "templates";
  const sectionTitle = isTemplates ? "Design Templates" : "Service Presets";
  const sectionSub = isTemplates
    ? "Reference materials that show workers how you want your deliverables to look"
    : "Save your commonly used service combinations for faster order creation";
  const primaryLabel = isTemplates ? "Add Template" : "Create Preset";
  const emptyTitle = isTemplates ? "No templates yet" : "No presets yet";
  const emptySub = isTemplates
    ? "Add design templates to guide workers on how to style your deliverables"
    : "Create presets to speed up your order creation process";
  const emptyBtn = isTemplates ? "Add Your First Template" : "Create Your First Preset";

  const getDrawerParent = useCallback(() => {
    let parent = navigation.getParent?.();
    while (parent && !parent.openDrawer && parent.getParent) {
      parent = parent.getParent?.();
    }
    return parent;
  }, [navigation]);

  const openDrawer = () => {
    const parent = getDrawerParent();
    if (parent?.openDrawer) parent.openDrawer();
    else navigation.openDrawer?.();
  };

  useFocusEffect(
    useCallback(() => {
      const parent = getDrawerParent();
      parent?.closeDrawer?.();
    }, [getDrawerParent])
  );

  const openPrimaryModal = () => {
    if (isTemplates) setTemplateModalOpen(true);
    else setPresetModalOpen(true);
  };

  const onToggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAllTemplateServices = () => {
    const ids = SERVICE_GROUPS.slice(0, 2)
      .flatMap((g) => g.items)
      .map((i) => i.id);
    setSelectedServices(ids);
  };

  const selectedCount = selectedServices.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="Settings" onMenuPress={openDrawer} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.toggleWrap}>
          <Pressable
            onPress={() => setMode("templates")}
            style={[styles.toggleBtn, mode === "templates" && styles.toggleBtnActive]}
          >
            <Ionicons
              name="image-outline"
              size={18}
              color={mode === "templates" ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                mode === "templates" && styles.toggleTextActive,
              ]}
            >
              Templates
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("presets")}
            style={[styles.toggleBtn, mode === "presets" && styles.toggleBtnActive]}
          >
            <Ionicons
              name="layers-outline"
              size={18}
              color={mode === "presets" ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                mode === "presets" && styles.toggleTextActive,
              ]}
            >
              Presets
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <Text style={styles.sectionSub}>{sectionSub}</Text>
          </View>
          <Pressable style={styles.primaryBtn} onPress={openPrimaryModal}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
          </Pressable>
        </View>

        {isTemplates && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {TEMPLATE_TABS.map((tab) => {
              const active = tab === activeTab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name={isTemplates ? "image-outline" : "layers-outline"}
              size={30}
              color={Colors.textSecondary}
            />
          </View>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySub}>{emptySub}</Text>
          <Pressable style={styles.ghostBtn} onPress={openPrimaryModal}>
            <Ionicons name="add" size={16} color={Colors.text} />
            <Text style={styles.ghostBtnText}>{emptyBtn}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* TEMPLATE MODAL */}
      <Modal transparent visible={templateModalOpen} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setTemplateModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation?.()}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Design Template</Text>
                <Text style={styles.modalSubtitle}>
                  Upload an image or add a link as a design reference for a service
                </Text>
              </View>
              <Pressable style={styles.modalClose} onPress={() => setTemplateModalOpen(false)}>
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalSectionRow}>
              <Text style={styles.modalLabel}>Apply to Services</Text>
              <Pressable
                onPress={selectAllTemplateServices}
                style={({ pressed }) => [styles.modalLink, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.modalLinkText}>Select All</Text>
              </Pressable>
            </View>

            <View style={styles.servicesBox}>
              {SERVICE_GROUPS.slice(0, 2).map((group) => (
                <View key={group.title} style={styles.serviceGroup}>
                  <Text style={styles.groupTitle}>{group.title.toUpperCase()}</Text>
                  {group.items.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => onToggleService(item.id)}
                      style={styles.serviceRow}
                    >
                      <View style={styles.radio}>
                        {selectedServices.includes(item.id) && <View style={styles.radioDot} />}
                      </View>
                      <Text style={styles.serviceText}>{item.name}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
            <Text style={styles.selectedCount}>Selected: {selectedCount} services</Text>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Template Name</Text>
              <TextInput
                placeholder="e.g., Preferred Floor Plan Style"
                placeholderTextColor={Colors.textSecondary}
                style={styles.input}
                value={templateName}
                onChangeText={setTemplateName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Template Type</Text>
              <View style={styles.radioRow}>
                <Pressable style={styles.radioOption} onPress={() => setTemplateType("upload")}>
                  <View style={styles.radio}>
                    {templateType === "upload" && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioText}>Upload Image</Text>
                </Pressable>
                <Pressable style={styles.radioOption} onPress={() => setTemplateType("link")}>
                  <View style={styles.radio}>
                    {templateType === "link" && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioText}>External Link</Text>
                </Pressable>
              </View>
            </View>

            {templateType === "upload" ? (
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Upload Image</Text>
                <Pressable style={styles.uploadBox}>
                  <Ionicons name="cloud-upload-outline" size={22} color={Colors.textSecondary} />
                  <Text style={styles.uploadText}>Click to upload</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>External Link</Text>
                <TextInput
                  placeholder="https://example.com/template"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.input}
                  value={templateLink}
                  onChangeText={setTemplateLink}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Description (Optional)</Text>
              <TextInput
                placeholder="Any notes about this template..."
                placeholderTextColor={Colors.textSecondary}
                style={[styles.input, styles.textArea]}
                value={templateDesc}
                onChangeText={setTemplateDesc}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.ghostAction} onPress={() => setTemplateModalOpen(false)}>
                <Text style={styles.ghostActionText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryAction} onPress={() => setTemplateModalOpen(false)}>
                <Text style={styles.primaryActionText}>Create Template</Text>
              </Pressable>
            </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* PRESET MODAL */}
      <Modal transparent visible={presetModalOpen} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPresetModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation?.()}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Create Service Preset</Text>
                <Text style={styles.modalSubtitle}>
                  Select the services you commonly use together
                </Text>
              </View>
              <Pressable style={styles.modalClose} onPress={() => setPresetModalOpen(false)}>
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Preset Name</Text>
              <TextInput
                placeholder="e.g., Standard Listing Package"
                placeholderTextColor={Colors.textSecondary}
                style={styles.input}
                value={presetName}
                onChangeText={setPresetName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Select Services</Text>
              <ScrollView
                style={styles.servicesBox}
                contentContainerStyle={styles.servicesBoxContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {SERVICE_GROUPS.map((group) => (
                  <View key={group.title} style={styles.serviceGroup}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    {group.items.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => onToggleService(item.id)}
                        style={styles.serviceRow}
                      >
                        <View style={styles.radio}>
                          {selectedServices.includes(item.id) && <View style={styles.radioDot} />}
                        </View>
                        <Text style={styles.serviceText}>{item.name}</Text>
                        <Text style={styles.priceText}>${item.price}</Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.defaultRow}>
              <View>
                <Text style={styles.defaultTitle}>Set as Default</Text>
                <Text style={styles.defaultSub}>Auto-apply this preset on new orders</Text>
              </View>
              <Switch
                value={presetDefault}
                onValueChange={setPresetDefault}
                trackColor={{ true: `${Colors.primary}55`, false: "#E5E7EB" }}
                thumbColor={presetDefault ? Colors.primary : "#ffffff"}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.ghostAction} onPress={() => setPresetModalOpen(false)}>
                <Text style={styles.ghostActionText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryAction} onPress={() => setPresetModalOpen(false)}>
                <Text style={styles.primaryActionText}>Create Preset</Text>
              </Pressable>
            </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.screenPadding, paddingBottom: 28 },

  toggleWrap: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  toggleBtnActive: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  toggleText: { fontSize: 13, color: Colors.textSecondary, fontWeight: "700" },
  toggleTextActive: { color: Colors.text },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  sectionSub: { marginTop: 4, fontSize: 12, color: Colors.textSecondary },

  primaryBtn: {
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  tabsRow: {
    marginTop: 14,
    paddingBottom: 6,
    gap: 8,
  },
  pill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: "#fff",
    borderColor: Colors.primary,
  },
  pillText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "700" },
  pillTextActive: { color: Colors.text },

  emptyCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 22,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 2 },
    }),
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  emptySub: { marginTop: 6, fontSize: 12, color: Colors.textSecondary, textAlign: "center" },
  ghostBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#F8FAFC",
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ghostBtnText: { color: Colors.text, fontSize: 13, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.screenPadding,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: Spacing.screenPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: "86%",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
      android: { elevation: 6 },
    }),
  },
  modalContent: {
    paddingBottom: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  modalSubtitle: { marginTop: 4, fontSize: 12, color: Colors.textSecondary },
  modalClose: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  modalSectionRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalLabel: { fontSize: 12, color: Colors.text, fontWeight: "700" },
  modalLink: { paddingHorizontal: 6, paddingVertical: 4 },
  modalLinkText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "700" },

  servicesBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#F8FAFC",
    maxHeight: 220,
  },
  servicesBoxContent: {
    paddingBottom: 6,
  },
  serviceGroup: { marginBottom: 10 },
  groupTitle: { fontSize: 11, color: Colors.textSecondary, fontWeight: "800", marginBottom: 6 },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  serviceText: { flex: 1, fontSize: 13, color: Colors.text, fontWeight: "600" },
  priceText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "700" },
  selectedCount: { marginTop: 6, fontSize: 11, color: Colors.textSecondary, textAlign: "right" },

  formGroup: { marginTop: 14 },
  fieldLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: "700", marginBottom: 6 },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    color: Colors.text,
  },
  textArea: { height: 90, textAlignVertical: "top", paddingTop: 10 },

  radioRow: { flexDirection: "row", alignItems: "center", gap: 18 },
  radioOption: { flexDirection: "row", alignItems: "center", gap: 8 },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  radioText: { fontSize: 13, color: Colors.text, fontWeight: "600" },

  uploadBox: {
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  uploadText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "600" },

  defaultRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  defaultTitle: { fontSize: 13, fontWeight: "700", color: Colors.text },
  defaultSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  modalActions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  ghostAction: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  ghostActionText: { fontSize: 13, fontWeight: "700", color: Colors.text },
  primaryAction: {
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8BC9DE",
  },
  primaryActionText: { fontSize: 13, fontWeight: "800", color: "#fff" },
});
