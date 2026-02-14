import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import Colors from "../../constants/colors";
import Spacing from "../../constants/spacing";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import {
  formatServiceName,
  getDeliverableDisplayUrl,
  listOrderDeliverables,
  listOrdersForAmend,
  submitAmendsForServices,
} from "../../api/amends.api";

const COLORS = {
  PRIMARY: Colors.primary,
  BG: Colors.background,
  CARD_BG: Colors.cardBg,
  TEXT_PRIMARY: Colors.text,
  TEXT_SECONDARY: Colors.textSecondary,
  BORDER: Colors.border,
  SUCCESS: Colors.success,
};

export default function PlaceAmendment() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, portalId } = useAuth();

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(route?.params?.orderId || "");
  const [deliverables, setDeliverables] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedImagesByService, setSelectedImagesByService] = useState({});
  const [notes, setNotes] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDeliverables, setLoadingDeliverables] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await listOrdersForAmend();
      setOrders(data);
    } catch (error) {
      setOrders([]);
      Alert.alert("Failed to load orders", error?.message || "Please try again.");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const loadDeliverables = useCallback(async () => {
    if (!selectedOrderId) {
      setDeliverables([]);
      return;
    }

    setLoadingDeliverables(true);
    try {
      const data = await listOrderDeliverables(selectedOrderId);
      setDeliverables(data);
    } catch (error) {
      setDeliverables([]);
      Alert.alert("Failed to load deliverables", error?.message || "Please try again.");
    } finally {
      setLoadingDeliverables(false);
    }
  }, [selectedOrderId]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  useEffect(() => {
    loadDeliverables();
    setSelectedServiceIds([]);
    setSelectedImagesByService({});
  }, [selectedOrderId, loadDeliverables]);

  useEffect(() => {
    if (route?.params?.orderId) {
      setSelectedOrderId(route.params.orderId);
    }
  }, [route?.params?.orderId]);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId), [orders, selectedOrderId]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const orderNumber = String(order?.order_number || "").toLowerCase();
      const propertyName = String(order?.property?.name || "").toLowerCase();
      const propertyStreet = String(order?.property?.street || "").toLowerCase();
      return orderNumber.includes(q) || propertyName.includes(q) || propertyStreet.includes(q);
    });
  }, [orders, orderSearch]);

  const services = useMemo(() => {
    const grouped = {};
    deliverables.forEach((item) => {
      if (!item?.service_id) return;
      if (!grouped[item.service_id]) grouped[item.service_id] = [];
      grouped[item.service_id].push(item);
    });
    return Object.entries(grouped).map(([serviceId, files]) => ({ serviceId, files }));
  }, [deliverables]);

  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        const next = prev.filter((id) => id !== serviceId);
        setSelectedImagesByService((prevImages) => {
          const copy = { ...prevImages };
          delete copy[serviceId];
          return copy;
        });
        return next;
      }
      return [...prev, serviceId];
    });
  };

  const toggleImage = (serviceId, imageUrl) => {
    if (!selectedServiceIds.includes(serviceId)) return;

    setSelectedImagesByService((prev) => {
      const current = prev[serviceId] || [];
      const exists = current.includes(imageUrl);
      return {
        ...prev,
        [serviceId]: exists ? current.filter((u) => u !== imageUrl) : [...current, imageUrl],
      };
    });
  };

  const totalSelectedImages = useMemo(
    () => Object.values(selectedImagesByService).reduce((acc, urls) => acc + (urls?.length || 0), 0),
    [selectedImagesByService]
  );

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Authentication required", "Please sign in again.");
      return;
    }
    if (!selectedOrderId) {
      Alert.alert("Order required", "Select an order to continue.");
      return;
    }
    if (!portalId) {
      Alert.alert("Portal missing", "No portal is assigned to your account.");
      return;
    }
    if (selectedServiceIds.length === 0) {
      Alert.alert("Select services", "Pick at least one service.");
      return;
    }

    setSubmitting(true);
    try {
      const { createdAmends, failedAnnotations } = await submitAmendsForServices({
        orderId: selectedOrderId,
        selectedServiceIds,
        notes: notes.trim() || null,
        userId: user.id,
        portalId,
        selectedImageUrlsByService: selectedImagesByService,
      });

      if (failedAnnotations.length > 0) {
        Alert.alert(
          "Amendments submitted with warnings",
          `${createdAmends.length} amendment(s) created, but ${failedAnnotations.length} annotation(s) failed.`
        );
      } else {
        Alert.alert("Success", `${createdAmends.length} amendment request(s) submitted.`);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Submission failed", error?.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="Place Amendment" onMenuPress={openDrawer} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <FlatList
          data={services}
          keyExtractor={(item) => item.serviceId}
          ListHeaderComponent={
            <View style={styles.listContent}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Order</Text>
                <Text style={styles.sectionSub}>Select the order you want to amend.</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setShowOrderModal(true)} activeOpacity={0.8}>
                  <View style={{ flex: 1 }}>
                    {selectedOrder ? (
                      <>
                        <Text style={styles.selectorPrimary}>{selectedOrder.order_number || "N/A"}</Text>
                        <Text style={styles.selectorSecondary} numberOfLines={1}>
                          {selectedOrder?.property?.name || selectedOrder?.property?.street || "Unknown property"}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.selectorPlaceholder}>Select an order</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={18} color={COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Services</Text>
                <Text style={styles.sectionSub}>Choose one or more services to create amendment requests.</Text>
                {loadingDeliverables ? (
                  <ActivityIndicator color={COLORS.PRIMARY} style={{ marginVertical: 14 }} />
                ) : services.length === 0 ? (
                  <Text style={styles.emptyText}>No deliverables found for this order.</Text>
                ) : (
                  services.map((service) => {
                    const selected = selectedServiceIds.includes(service.serviceId);
                    return (
                      <TouchableOpacity
                        key={service.serviceId}
                        style={[styles.serviceRow, selected && styles.serviceRowSelected]}
                        onPress={() => toggleService(service.serviceId)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={selected ? "checkbox" : "square-outline"}
                          size={20}
                          color={selected ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.serviceName}>{formatServiceName(service.serviceId)}</Text>
                          <Text style={styles.serviceMeta}>{service.files.length} deliverable(s)</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
                <Text style={styles.sectionSub}>Optional notes for the amendment team.</Text>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Describe requested changes..."
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                />
              </View>

              {loadingDeliverables ? null : (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Reference Images (Optional)</Text>
                  <Text style={styles.sectionSub}>Select source images to attach as annotations.</Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{formatServiceName(item.serviceId)}</Text>
              <Text style={styles.sectionSub}>Tap images to mark them for this service.</Text>
              {!selectedServiceIds.includes(item.serviceId) ? (
                <Text style={styles.muted}>Select this service above to attach images.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
                  {item.files
                    .filter((file) => String(file?.file_type || "").startsWith("image/"))
                    .map((file) => {
                      const imageUrl = getDeliverableDisplayUrl(file);
                      const selected = (selectedImagesByService[item.serviceId] || []).includes(imageUrl);
                      if (!imageUrl) return null;
                      return (
                        <TouchableOpacity
                          key={file.id}
                          onPress={() => toggleImage(item.serviceId, imageUrl)}
                          style={[styles.imageWrap, selected && styles.imageWrapSelected]}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
                          <View style={styles.imageBadge}>
                            <Ionicons
                              name={selected ? "checkmark-circle" : "ellipse-outline"}
                              size={18}
                              color={selected ? COLORS.SUCCESS : "#FFFFFF"}
                            />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              )}
            </View>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <View style={styles.summary}>
                <Text style={styles.summaryText}>
                  {selectedServiceIds.length} service(s) selected - {totalSelectedImages} image(s) selected
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.submitBtn, (submitting || selectedServiceIds.length === 0) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={submitting || selectedServiceIds.length === 0}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>Submit Amendment</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            !loadingDeliverables && selectedOrderId ? (
              <View style={[styles.card, { marginHorizontal: Spacing.screenPadding }]}>
                <Text style={styles.emptyText}>No services found for this order.</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </KeyboardAvoidingView>

      <Modal visible={showOrderModal} animationType="slide" transparent onRequestClose={() => setShowOrderModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowOrderModal(false)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Order</Text>
              <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={COLORS.TEXT_SECONDARY} />
              <TextInput
                value={orderSearch}
                onChangeText={setOrderSearch}
                placeholder="Search by order or property..."
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                style={styles.searchInput}
              />
            </View>
            {loadingOrders ? (
              <ActivityIndicator color={COLORS.PRIMARY} style={{ marginTop: 20 }} />
            ) : (
              <ScrollView style={{ maxHeight: 440 }}>
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrderId === order.id;
                  return (
                    <TouchableOpacity
                      key={order.id}
                      style={[styles.orderRow, isSelected && styles.orderRowSelected]}
                      onPress={() => {
                        setSelectedOrderId(order.id);
                        setShowOrderModal(false);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderNumber}>{order.order_number || "N/A"}</Text>
                        <Text style={styles.orderProperty} numberOfLines={1}>
                          {order?.property?.name || order?.property?.street || "Unknown property"}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                        size={18}
                        color={isSelected ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  listContent: {
    paddingBottom: 12,
    paddingTop: Spacing.screenPadding,
  },
  card: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: 12,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  sectionSub: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  selector: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectorPrimary: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  selectorSecondary: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  selectorPlaceholder: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  serviceRow: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  serviceRowSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: "#EFF8FC",
  },
  serviceName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  serviceMeta: {
    fontSize: 11,
    marginTop: 2,
    color: COLORS.TEXT_SECONDARY,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    minHeight: 92,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  muted: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  imageRow: {
    gap: 10,
  },
  imageWrap: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.BORDER,
  },
  imageWrapSelected: {
    borderColor: COLORS.SUCCESS,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 999,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 10,
    marginTop: 8,
  },
  summary: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.55,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    backgroundColor: COLORS.CARD_BG,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
  },
  orderRow: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderRowSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: "#EFF8FC",
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  orderProperty: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
});
