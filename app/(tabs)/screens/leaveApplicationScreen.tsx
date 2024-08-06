import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { db, auth } from "../../../FirebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { format, differenceInHours } from "date-fns";

interface LeaveApplicationScreenProps {
  navigation: NavigationProp<any, any>;
}

const LeaveApplicationScreen: React.FC<LeaveApplicationScreenProps> = ({
  navigation,
}) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<
    Array<{ id: string; email: string; date: any; status: string; reason: string }>
  >([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [reasonModalVisible, setReasonModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userDocRef = doc(db, "users", auth.currentUser?.uid!);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
        setCompanyId(userDoc.data().companyId);
      }
    };

    fetchUserRole();
  }, []);

  const handleAskLeave = async () => {
    try {
      const user = auth.currentUser;
      if (user && companyId) {
        const leaveCollectionRef = collection(db, "leaveRequests");
        const q = query(
          leaveCollectionRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const lastLeaveRequest = querySnapshot.docs[0].data();
          const lastRequestDate = lastLeaveRequest.date.toDate();
          const hoursDifference = differenceInHours(new Date(), lastRequestDate);
          if (hoursDifference < 24) {
            Alert.alert("Error", "You can only request leave once every 24 hours.");
            return;
          }
        }
        setReasonModalVisible(true);
      } else {
        Alert.alert("Error", "User not authenticated or company ID missing.");
      }
    } catch (error) {
      console.error("Error checking leave request: ", error);
      Alert.alert("Error", "Error checking leave request. Please try again.");
    }
  };

  const submitLeaveRequest = async () => {
    try {
      const user = auth.currentUser;
      if (user && companyId) {
        const leaveCollectionRef = collection(db, "leaveRequests");
        await addDoc(leaveCollectionRef, {
          userId: user.uid,
          email: user.email,
          companyId: companyId,
          date: new Date(),
          status: "pending",
          reason: leaveReason,
        });
        setReasonModalVisible(false);
        setLeaveReason("");
        Alert.alert("Success", "Leave request submitted successfully.");
      }
    } catch (error) {
      console.error("Error submitting leave request: ", error);
      Alert.alert("Error", "Error submitting leave request. Please try again.");
    }
  };

  const handleManageLeaves = () => {
    setModalVisible(true);
    if (companyId) {
      const q = query(
        collection(db, "leaveRequests"),
        where("companyId", "==", companyId),
        orderBy("date", "desc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const requests: Array<{
          id: string;
          email: string;
          date: any;
          status: string;
          reason: string;
        }> = [];
        querySnapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() } as any);
        });
        setLeaveRequests(requests);
      });

      return () => unsubscribe();
    }
  };

  const handleGrantLeave = async (leaveId: string) => {
    try {
      const leaveDocRef = doc(db, "leaveRequests", leaveId);
      await updateDoc(leaveDocRef, {
        status: "granted",
      });
      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === leaveId ? { ...request, status: "granted" } : request
        )
      );
      Alert.alert("Success", "Leave granted successfully.");
    } catch (error) {
      console.error("Error granting leave: ", error);
      Alert.alert("Error", "Error granting leave. Please try again.");
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      const leaveDocRef = doc(db, "leaveRequests", leaveId);
      await updateDoc(leaveDocRef, {
        status: "rejected",
      });
      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === leaveId ? { ...request, status: "rejected" } : request
        )
      );
      Alert.alert("Success", "Leave rejected successfully.");
    } catch (error) {
      console.error("Error rejecting leave: ", error);
      Alert.alert("Error", "Error rejecting leave. Please try again.");
    }
  };

  const renderLeaveRequest = ({
    item,
  }: {
    item: { id: string; email: string; date: any; status: string; reason: string };
  }) => {
    const formattedDate = item.date?.seconds
      ? format(new Date(item.date.seconds * 1000), "PPpp")
      : "Unknown date";
    return (
      <View style={styles.recordContainer}>
        <Text style={styles.recordText}>Email: {item.email}</Text>
        <Text style={styles.recordText}>Date: {formattedDate}</Text>
        <Text style={styles.recordText}>Reason: {item.reason}</Text>
        <Text style={styles.recordText}>Status: {item.status}</Text>
        {item.status === "pending" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={() => handleGrantLeave(item.id)}
            >
              <Text style={styles.buttonText}>Grant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => handleRejectLeave(item.id)}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headings}>Leave Applications</Text>

      {userRole === "Employee" && (
        <TouchableOpacity style={styles.button} onPress={handleAskLeave}>
          <Text style={styles.buttonText}>Ask Leave</Text>
        </TouchableOpacity>
      )}

      {userRole === "Employer" && (
        <TouchableOpacity style={styles.button} onPress={handleManageLeaves}>
          <Text style={styles.buttonText}>Manage Leaves</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.dashboard]}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.buttonText}>Dashboard</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={reasonModalVisible}
        onRequestClose={() => setReasonModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Leave Reason</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Reason for leave"
              placeholderTextColor="#999"
              value={leaveReason}
              onChangeText={setLeaveReason}
              multiline
            />
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={submitLeaveRequest}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setReasonModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Leave Requests</Text>
            <FlatList
              data={leaveRequests}
              keyExtractor={(item) => item.id}
              renderItem={renderLeaveRequest}
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
    width: 200,
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
  dashboard: {
    backgroundColor: "#388e3c",
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
  submitButton: {
    backgroundColor: "#388e3c",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "#388e3c",
    width: "48%",
  },
  rejectButton: {
    backgroundColor: "#d32f2f",
    width: "48%",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    height: 80,
    textAlignVertical: "top",
    backgroundColor: "#2e2e2e",
    color: "#ffffff",
  },
});

export default LeaveApplicationScreen;
