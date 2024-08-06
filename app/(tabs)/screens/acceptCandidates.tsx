import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { db, auth } from '../../../FirebaseConfig';
import { collection, getDocs, updateDoc, doc, query, where, getDoc } from 'firebase/firestore';

interface AcceptCandidatesProps {
    navigation: NavigationProp<any, any>;
}

const AcceptCandidates: React.FC<RAcceptCandidatesProps> = ({ navigation }) => {
    const [joinRequests, setJoinRequests] = useState<Array<{ id: string; userId: string; userEmail: string; companyId: string; companyName: string; status: string; description: string }>>([]);
    const [companyId, setCompanyId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserCompanyId = async () => {
            const userDocRef = doc(db, 'users', auth.currentUser?.uid!);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setCompanyId(userDoc.data().companyId);
            }
        };

        fetchUserCompanyId();
    }, []);

    useEffect(() => {
        if (companyId) {
            const fetchJoinRequests = async () => {
                const joinRequestsQuery = query(collection(db, 'joinRequests'), where('companyId', '==', companyId));
                const querySnapshot = await getDocs(joinRequestsQuery);
                const requestsList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    userId: doc.data().userId,
                    userEmail: doc.data().userEmail,
                    companyId: doc.data().companyId,
                    companyName: doc.data().companyName,
                    status: doc.data().status,
                    description: doc.data().description, // Include description
                }));
                setJoinRequests(requestsList);
            };

            fetchJoinRequests();
        }
    }, [companyId]);

    const handleAcceptRequest = async (requestId: string, userId: string, companyId: string) => {
        try {
            // Check if the user is already associated with a company
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().companyId) {
                Alert.alert('Error', 'User is already associated with a company.');
                return;
            }

            // Update the request status to 'accepted'
            const requestDocRef = doc(db, 'joinRequests', requestId);
            await updateDoc(requestDocRef, { status: 'accepted' });

            // Update the user's role and companyId
            await updateDoc(userDocRef, {
                role: 'Employee',
                companyId: companyId,
            });

            Alert.alert('Success', 'Join request accepted.');
        } catch (error) {
            console.error('Error accepting join request: ', error);
            Alert.alert('Error', 'Error accepting join request. Please try again.');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            // Update the request status to 'rejected'
            const requestDocRef = doc(db, 'joinRequests', requestId);
            await updateDoc(requestDocRef, { status: 'rejected' });

            Alert.alert('Success', 'Join request rejected.');
        } catch (error) {
            console.error('Error rejecting join request: ', error);
            Alert.alert('Error', 'Error rejecting join request. Please try again.');
        }
    };

    const renderJoinRequest = ({ item }: { item: { id: string; userId: string; userEmail: string; companyId: string; companyName: string; status: string; description: string } }) => {
        return (
            <View style={styles.requestContainer}>
                <Text style={styles.requestText}>Email: {item.userEmail}</Text>
                <Text style={styles.requestText}>Company: {item.companyName}</Text>
                <Text style={styles.requestText}>Status: {item.status}</Text>
                <Text style={styles.requestText}>Description: {item.description}</Text>
                {item.status === 'pending' && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={() => handleAcceptRequest(item.id, item.userId, item.companyId)}
                        >
                            <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={() => handleRejectRequest(item.id)}
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
            <Text style={styles.headings}>Join Requests</Text>
            <FlatList
                data={joinRequests}
                keyExtractor={(item) => item.id}
                renderItem={renderJoinRequest}
            />
            <TouchableOpacity
                style={[styles.button, styles.dashboard]}
                onPress={() => navigation.navigate('Dashboard')}
            >
                <Text style={styles.buttonText}>Dashboard</Text>
            </TouchableOpacity>
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
    requestContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
    },
    requestText: {
        color: '#333',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    acceptButton: {
        backgroundColor: '#28a745',
        flex: 1,
        marginRight: 10,
    },
    rejectButton: {
        backgroundColor: '#dc3545',
        flex: 1,
        marginLeft: 10,
    },
});

export default AcceptCandidates;
