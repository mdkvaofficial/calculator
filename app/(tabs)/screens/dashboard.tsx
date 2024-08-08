import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
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
          <Text style={styles.emailText}>{userEmail}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={[styles.button, styles.gridItem]}
          onPress={() => { navigation.navigate('AttendanceScreen'); }}
        >
          <Image source={require('../../../assets/images/attendance.png')} style={styles.buttonImage} />
          <Text style={styles.buttonText}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.gridItem]}
          onPress={() => { navigation.navigate('ChatScreen'); }}
        >
          <Image source={require('../../../assets/images/chatRoom.png')} style={styles.buttonImage} />
          <Text style={styles.buttonText}>Chat Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.gridItem]}
          onPress={() => { navigation.navigate('LeaveApplicationScreen'); }}
        >
          <Image source={require('../../../assets/images/leaveApplications.png')} style={styles.buttonImage} />
          <Text style={styles.buttonText}>Leave Application</Text>
        </TouchableOpacity>

        {userRole === 'Employer' && (
          <TouchableOpacity
            style={[styles.button, styles.gridItem]}
            onPress={() => { navigation.navigate('AcceptCandidates'); }}
          >
            <Image source={require('../../../assets/images/acceptCandidates.png')} style={styles.buttonImage} />
            <Text style={styles.buttonText}>Accept Candidates</Text>
          </TouchableOpacity>
        )}
      </View>

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
    backgroundColor: '#121212',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading2: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 10,
  },
  roleText: {
    fontSize: 20,
    color: '#bbbbbb',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 18,
    color: '#1e88e5',
    marginBottom: 40,
    textDecorationLine: 'underline',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: 160,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    marginBottom: 20,
    borderRadius: 12,
    borderColor: '#333333',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonImage: {
    width: 40,
    height: 40,
  },
  gridItem: {
    margin: 10,
  },
  settings: {
    backgroundColor: '#388e3c',
    width: 200,
    position: 'relative',
  },
  logout: {
    backgroundColor: '#d32f2f',
    width: 200,
    position: 'relative',
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
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
  },
  closeButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 10,
  },
});

export default Dashboard;
