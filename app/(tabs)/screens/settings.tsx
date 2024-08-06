import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { db, auth } from "../../../FirebaseConfig";
import {
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  collection,
  writeBatch,
  orderBy,
} from "firebase/firestore";
import { format } from "date-fns";

interface SettingsProps {
  navigation: NavigationProp<any, any>;
}

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [leaveStatus, setLeaveStatus] = useState<
    Array<{ id: string; date: any; status: string }>
  >([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userDocRef = doc(db, "users", auth.currentUser?.uid!);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().role) {
        setUserRole(userDoc.data().role);
      }
    };

    fetchUserRole();
  }, []);

  const handleDeleteCompany = async () => {
    try {
      const userDocRef = doc(db, "users", auth.currentUser?.uid!);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const companyId = userData.companyId;
        if (companyId) {
          // Retrieve all users associated with the company
          const usersQuery = query(
            collection(db, "users"),
            where("companyId", "==", companyId)
          );
          const usersSnapshot = await getDocs(usersQuery);

          // Create a batch
          const batch = writeBatch(db);
          usersSnapshot.forEach((userDoc) => {
            const userRef = userDoc.ref;
            batch.update(userRef, { role: "New User", companyId: null });
          });

          // Commit the batch
          await batch.commit();

          // Delete the company
          await deleteDoc(doc(db, "companies", companyId));

          Alert.alert(
            "Success",
            "Company and associated users updated successfully",
            [{ text: "OK", onPress: () => navigation.navigate("NewUserDashboard") }]
          );
        } else {
          Alert.alert("Error", "No company associated with this user");
        }
      } else {
        Alert.alert("Error", "User data not found");
      }
    } catch (error) {
      console.error("Error deleting company: ", error);
      Alert.alert("Error", "Error deleting company. Please try again.");
    }
  };

  const handleLeaveCompany = async () => {
    try {
      const userDocRef = doc(db, "users", auth.currentUser?.uid!);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        // Update the user role to "New User" and remove the companyId
        await updateDoc(userDocRef, {
          role: "New User",
          companyId: null,
        });

        Alert.alert("Success", "You have left the company", [
          { text: "OK", onPress: () => navigation.navigate("NewUserDashboard") },
        ]);
      } else {
        Alert.alert("Error", "User data not found");
      }
    } catch (error) {
      console.error("Error leaving company: ", error);
      Alert.alert("Error", "Error leaving company. Please try again.");
    }
  };

  const handleViewNotifications = () => {
    setModalVisible(true);
    const fetchLeaveStatus = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const leaveCollectionRef = collection(db, "leaveRequests");
          const q = query(
            leaveCollectionRef,
            where("userId", "==", user.uid),
            orderBy("date", "desc")
          );
          const querySnapshot = await getDocs(q);
          const statusList: Array<{ id: string; date: any; status: string }> =
            [];
          querySnapshot.forEach((doc) => {
            statusList.push({ id: doc.id, ...doc.data() } as any);
          });
          setLeaveStatus(statusList);
        } else {
          Alert.alert("Error", "User not authenticated.");
        }
      } catch (error) {
        console.error("Error fetching leave status: ", error);
        Alert.alert("Error", "Error fetching leave status. Please try again.");
      }
    };

    fetchLeaveStatus();
  };

  const renderLeaveStatus = ({
    item,
  }: {
    item: { id: string; date: any; status: string };
  }) => {
    const formattedDate = item.date?.seconds
      ? format(new Date(item.date.seconds * 1000), "PPpp")
      : "Unknown date";
    return (
      <View style={styles.recordContainer}>
        <Text style={styles.recordText}>Date: {formattedDate}</Text>
        <Text style={styles.recordText}>Status: {item.status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headings}>Settings</Text>

      {userRole === "Employee" && (
        <TouchableOpacity style={styles.button} onPress={handleViewNotifications}>
          <Text style={styles.buttonText}>Notifications</Text>
        </TouchableOpacity>
      )}

      {userRole === "Employer" && (
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteCompany}
        >
          <Text style={styles.buttonText}>Delete Company</Text>
        </TouchableOpacity>
      )}

      {userRole === "Employee" && (
        <TouchableOpacity
          style={[styles.button, styles.leaveButton]}
          onPress={handleLeaveCompany}
        >
          <Text style={styles.buttonText}>Leave Company</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.dashboardButton]}
        onPress={() => {
          navigation.navigate("Dashboard");
        }}
      >
        <Text style={styles.buttonText}>Dashboard</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Leave Status</Text>
            <FlatList
              data={leaveStatus}
              keyExtractor={(item) => item.id}
              renderItem={renderLeaveStatus}
            />
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headings: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 36,
    color: "#ffffff",
    marginBottom: 40,
  },
  button: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1976d2",
    marginBottom: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
  },
  leaveButton: {
    backgroundColor: "#d32f2f",
  },
  dashboardButton: {
    backgroundColor: "#388e3c",
    width: 200,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ffffff",
  },
  recordContainer: {
    backgroundColor: "#2e2e2e",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderColor: "#444",
    borderWidth: 1,
  },
  recordText: {
    color: "#ffffff",
  },
  closeButton: {
    backgroundColor: "#d32f2f",
  },
});

export default Settings;
