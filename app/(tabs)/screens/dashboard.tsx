import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { db, auth } from '../../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface DashboardProps {
  navigation: NavigationProp<any, any>;
}

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDocRef = doc(db, 'users', auth.currentUser?.uid!);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
        setUserEmail(userData.email); // Assuming 'email' is the field where the user's email is stored
        if (userData.companyId) {
          const companyDocRef = doc(db, 'companies', userData.companyId);
          const companyDoc = await getDoc(companyDocRef);
          if (companyDoc.exists()) {
            setCompanyName(companyDoc.data().name);
          }
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handleEmailPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading2}>{companyName ? companyName : ''}</Text>
      {userRole && <Text style={styles.roleText}>Role: {userRole}</Text>}
      {userEmail && (
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.emailText}>Email: {userEmail}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button]}
        onPress={() => { navigation.navigate('AttendanceScreen'); }}
      >
        <Text style={styles.buttonText}>Attendance</Text>
      </TouchableOpacity>

      {userRole === 'Employer' && (
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => { navigation.navigate('AcceptCandidates'); }}
        >
          <Text style={styles.buttonText}>Accept Candidates</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button]}
        onPress={() => { navigation.navigate('ChatScreen'); }}
      >
        <Text style={styles.buttonText}>Chat Room</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button]}
        onPress={() => { navigation.navigate('LeaveApplicationScreen'); }}
      >
        <Text style={styles.buttonText}>Leave Application</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.settings]}
        onPress={() => { navigation.navigate('Settings'); }}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logout]}
        onPress={() => { navigation.navigate('Login'); }}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Email: {userEmail}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
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
    backgroundColor: '#f0f0f0',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading2: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 36,
    color: '#333',
    marginBottom: 10,
  },
  roleText: {
    fontSize: 20,
    color: '#555',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 18,
    color: '#007bff',
    marginBottom: 40,
    textDecorationLine: 'underline',
  },
  button: {
    width: 160,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff',
    marginBottom: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  settings: {
    backgroundColor: '#28a745',
  },
  logout: {
    backgroundColor: '#dc3545',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 20,
  },
  closeButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: 10,
  },
});

export default Dashboard;
