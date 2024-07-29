import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { db, auth } from '../../../FirebaseConfig';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { format, differenceInHours } from 'date-fns';

interface AttendanceDashboardProps {
    navigation: NavigationProp<any, any>;
}

const AttendanceScreen: React.FC<AttendanceDashboardProps> = ({ navigation }) => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<Array<{ id: string; timestamp: any; email: string }>>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRoleAndCompany = async () => {
            const userDocRef = doc(db, 'users', auth.currentUser?.uid!);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserRole(userDoc.data().role);
                setCompanyId(userDoc.data().companyId);
            } else {
                setError('User data not found.');
            }
        };

        fetchUserRoleAndCompany();
    }, []);

    const handleMarkAttendance = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const attendanceCollectionRef = collection(db, 'attendance');
                const q = query(attendanceCollectionRef, where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(1));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const lastAttendance = querySnapshot.docs[0].data();
                    const lastTimestamp = lastAttendance.timestamp.toDate();
                    const hoursDifference = differenceInHours(new Date(), lastTimestamp);
                    if (hoursDifference < 24) {
                        Alert.alert('Error', 'You can only mark attendance once every 24 hours.');
                        return;
                    }
                }
                await addDoc(attendanceCollectionRef, {
                    userId: user.uid,
                    companyId: companyId,
                    timestamp: new Date(),
                    email: user.email
                });
                Alert.alert('Success', 'Attendance marked successfully.');
            } else {
                Alert.alert('Error', 'User not authenticated.');
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message.includes('index')) {
                    Alert.alert(
                        'Index Needed',
                        'The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/YOUR_PROJECT_ID/firestore/indexes'
                    );
                } else {
                    console.error('Error marking attendance: ', error);
                    Alert.alert('Error', `Error marking attendance. Please try again. Error: ${error.message}`);
                }
            } else {
                console.error('Unknown error: ', error);
                Alert.alert('Error', 'Unknown error occurred. Please try again.');
            }
        }
    };

    useEffect(() => {
        if (userRole === 'Employer' && companyId) {
            const fetchAttendanceRecords = () => {
                const q = query(collection(db, 'attendance'), where('companyId', '==', companyId), orderBy('timestamp', 'desc'));
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const records: Array<{ id: string; timestamp: any; email: string }> = [];
                    querySnapshot.forEach((doc) => {
                        records.push({ id: doc.id, ...doc.data() } as any);
                    });
                    setAttendanceRecords(records);
                });

                return () => unsubscribe();
            };

            fetchAttendanceRecords();
        }
    }, [userRole, companyId]);

    const renderAttendanceRecord = ({ item }: { item: { id: string; timestamp: any; email: string } }) => {
        const formattedDate = item.timestamp?.seconds
            ? format(new Date(item.timestamp.seconds * 1000), 'PPpp')
            : 'Unknown date';
        return (
            <View style={styles.recordContainer}>
                <Text style={styles.recordText}>Email: {item.email}</Text>
                <Text style={styles.recordText}>Time: {formattedDate}</Text>
            </View>
        );
    };

    const handleTrackAttendance = () => {
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headings}>Attendance</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {userRole === 'Employee' && (
                <TouchableOpacity style={styles.button} onPress={handleMarkAttendance}>
                    <Text style={styles.buttonText}>Mark Attendance</Text>
                </TouchableOpacity>
            )}
            {userRole === 'Employer' && (
                <TouchableOpacity style={styles.button} onPress={handleTrackAttendance}>
                    <Text style={styles.buttonText}>Track Attendance</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={[styles.button, styles.dashboard]}
                onPress={() => navigation.navigate('Dashboard')}
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
                        <Text style={styles.modalTitle}>Attendance Records</Text>
                        <FlatList
                            data={attendanceRecords}
                            keyExtractor={(item) => item.id}
                            renderItem={renderAttendanceRecord}
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
        backgroundColor: '#f0f0f0',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headings: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 36,
        color: '#333',
        marginBottom: 40,
    },
    button: {
        width: 200,
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
    dashboard: {
        backgroundColor: '#28a745',
    },
    modalOverlay: {
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
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    recordContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    recordText: {
        color: '#333',
    },
    closeButton: {
        backgroundColor: '#dc3545',
    },
    errorText: {
        color: '#dc3545',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default AttendanceScreen;
