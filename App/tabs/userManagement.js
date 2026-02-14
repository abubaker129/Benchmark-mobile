import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Colors from "../constants/colors";
import AppHeader from "../components/AppHeader";
import Spacing from "../constants/spacing";

const SAMPLE_USERS = [
  {
    id: "1",
    name: "abubaker",
    email: "abubakerali129@gmail.com",
    status: "Active",
    role: "admin",
    properties: 0,
    orders: 0,
    joined: "Feb 9, 2026",
  },
];

const ROLE_OPTIONS = ["Agent", "Admin"];

export default function UserManagement() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Agent",
  });

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

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SAMPLE_USERS;
    return SAMPLE_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [search]);

  const totalUsers = SAMPLE_USERS.length;
  const admins = SAMPLE_USERS.filter((u) => u.role === "admin").length;
  const activeUsers = SAMPLE_USERS.filter((u) => u.status === "Active").length;

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setRoleOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="User Management" onMenuPress={openDrawer} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard
            icon="people-outline"
            color="#2B9CCC"
            label="Total Users"
            value={String(totalUsers)}
          />
          <StatCard
            icon="shield-checkmark-outline"
            color="#F59E0B"
            label="Admins"
            value={String(admins)}
          />
          <StatCard
            icon="person-circle-outline"
            color="#10B981"
            label="Active Users"
            value={String(activeUsers)}
          />
        </View>

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                placeholder="Search users..."
                placeholderTextColor={Colors.textSecondary}
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Pressable style={styles.addBtn} onPress={openModal}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add User</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableWrap}>
              <View style={styles.tableColumns}>
                <Text style={[styles.colTitle, styles.colUser]}>User</Text>
                <Text style={[styles.colTitle, styles.colStatus]}>Status</Text>
                <Text style={[styles.colTitle, styles.colRole]}>Role</Text>
                <Text style={[styles.colTitle, styles.colNum]}>Properties</Text>
                <Text style={[styles.colTitle, styles.colNum]}>Orders</Text>
                <Text style={[styles.colTitle, styles.colJoined]}>Joined</Text>
                <Text style={[styles.colTitle, styles.colMore]} />
              </View>

              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.rowDivider} />}
                renderItem={({ item }) => (
                  <View style={styles.userRow}>
                    <View style={[styles.colUser, styles.userCell]}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userInitial}>
                          {item.name?.[0]?.toUpperCase() || "U"}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                      </View>
                    </View>

                    <View style={[styles.colStatus, styles.centerCol]}>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusText}>{item.status}</Text>
                      </View>
                    </View>

                    <View style={[styles.colRole, styles.centerCol]}>
                      <View
                        style={[
                          styles.rolePill,
                          item.role === "admin" && styles.rolePillAdmin,
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            item.role === "admin" && styles.roleTextAdmin,
                          ]}
                        >
                          {item.role}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.colNum, styles.centerCol]}>
                      <Text style={styles.numText}>{item.properties}</Text>
                    </View>

                    <View style={[styles.colNum, styles.centerCol]}>
                      <Text style={styles.numText}>{item.orders}</Text>
                    </View>

                    <View style={[styles.colJoined, styles.centerCol]}>
                      <Text style={styles.joinedText}>{item.joined}</Text>
                    </View>

                    <View style={[styles.colMore, styles.centerCol]}>
                      <Ionicons name="ellipsis-horizontal" size={16} color={Colors.textSecondary} />
                    </View>
                  </View>
                )}
              />
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <Modal transparent visible={modalOpen} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation?.()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add New User</Text>
                <Text style={styles.modalSubtitle}>
                  Create a new user for your portal. They will receive these credentials to log in.
                </Text>
              </View>
              <Pressable onPress={closeModal} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                placeholder="user@example.com"
                placeholderTextColor={Colors.textSecondary}
                style={styles.input}
                value={form.email}
                onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.inputFlex}
                  value={form.password}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))}
                  secureTextEntry
                />
                <Ionicons name="eye-outline" size={18} color={Colors.textSecondary} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Role</Text>
              <Pressable
                style={styles.select}
                onPress={() => setRoleOpen((prev) => !prev)}
              >
                <Text style={styles.selectText}>{form.role}</Text>
                <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
              </Pressable>
              {roleOpen && (
                <View style={styles.selectMenu}>
                  {ROLE_OPTIONS.map((role) => (
                    <Pressable
                      key={role}
                      style={styles.selectItem}
                      onPress={() => {
                        setForm((prev) => ({ ...prev, role }));
                        setRoleOpen(false);
                      }}
                    >
                      <Ionicons
                        name={form.role === role ? "checkmark-circle" : "ellipse-outline"}
                        size={18}
                        color={form.role === role ? Colors.primary : Colors.textSecondary}
                      />
                      <Text style={styles.selectItemText}>{role}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <Pressable style={styles.createBtn} onPress={closeModal}>
              <Text style={styles.createBtnText}>Create User</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ icon, color, label, value }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: Spacing.screenPadding,
    paddingBottom: 28,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: "flex-start",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
    }),
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: "900", color: Colors.text },
  statLabel: { marginTop: 2, fontSize: 12, color: Colors.textSecondary, fontWeight: "600" },

  tableCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
    }),
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, color: Colors.text, fontWeight: "500" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  tableWrap: {
    minWidth: 760,
  },
  tableColumns: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  colTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: "700" },
  colUser: { width: 220 },
  colStatus: { width: 110 },
  colRole: { width: 110 },
  colNum: { width: 90, textAlign: "center" },
  colJoined: { width: 120, textAlign: "center" },
  colMore: { width: 40, textAlign: "center" },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  userCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  userInitial: { color: "#fff", fontWeight: "800" },
  userName: { fontSize: 14, fontWeight: "700", color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  centerCol: { alignItems: "center" },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
  },
  statusText: { fontSize: 11, fontWeight: "700", color: "#16A34A" },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E0F2FE",
  },
  rolePillAdmin: {
    backgroundColor: "#FEF3C7",
  },
  roleText: { fontSize: 11, fontWeight: "700", color: "#0284C7", textTransform: "lowercase" },
  roleTextAdmin: { color: "#D97706" },
  numText: { fontSize: 12, fontWeight: "700", color: Colors.text },
  joinedText: { fontSize: 12, color: Colors.textSecondary },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.screenPadding,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: Spacing.screenPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
      android: { elevation: 6 },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  modalSubtitle: { marginTop: 4, fontSize: 12, color: Colors.textSecondary },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },

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
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
  },
  inputFlex: { flex: 1, color: Colors.text },

  select: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { fontSize: 14, color: Colors.text, fontWeight: "600" },
  selectMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  selectItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectItemText: { fontSize: 14, color: Colors.text, fontWeight: "600" },

  createBtn: {
    marginTop: 18,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
