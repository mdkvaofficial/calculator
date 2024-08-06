import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { db, auth } from '../../../FirebaseConfig';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';

interface DashboardProps {
    navigation: NavigationProp<any, any>;
}

const NewUserDashboard: React.FC<DashboardProps> = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserEmail = () => {
            if (auth.currentUser) {
                setUserEmail(auth.currentUser.email);
            } else {
                setError('User not authenticated.');
            }
        };

        fetchUserEmail();
    }, []);

    const handleCreateCompany = async () => {
        try {
            // Check if a company with the same name already exists
            const q = query(collection(db, 'companies'), where('name', '==', companyName));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setError('A company with this name already exists. Please choose a different name.');
                return;
            }

            // Save the company name to Firestore
            const companyDocRef = await addDoc(collection(db, 'companies'), {
                name: companyName,
                createdAt: new Date(),
                createdBy: auth.currentUser?.uid,
            });
            console.log('Company Document written with ID: ', companyDocRef.id);

            // Directly update user document using auth.currentUser.uid
            if (auth.currentUser?.uid) {
                const userDocRef = doc(db, 'users', auth.currentUser.uid);

                await updateDoc(userDocRef, {
                    role: 'Employer',
                    companyId: companyDocRef.id,
                });

                console.log('User role and company updated successfully.');
                setModalVisible(false);
                navigation.navigate('Dashboard'); // Navigate to Dashboard after creation
            } else {
                throw new Error('User is not authenticated.');
            }
        } catch (error) {
            console.error('Error adding document: ', error);
            setError('Error creating company. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading1}>{userEmail ? userEmail : ''}</Text>

            <TouchableOpacity
                style={[styles.button, styles.JoinCompany]}
                onPress={() => navigation.navigate('SearchCompanies')}
            >
                <Text style={styles.buttonText}>Join Company</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.CreateCompany]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.buttonText}>Create Company</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.Chatbot]}
                onPress={() => { navigation.navigate('ChatbotScreen'); }}
            >
                <Text style={styles.buttonText}>Chatbot</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.Logout]}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Create Company</Text>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                        <TextInput
                            style={styles.input}
                            placeholder="Company Name"
                            placeholderTextColor="#666"
                            value={companyName}
                            onChangeText={(text) => {
                                setCompanyName(text);
                                setError(null);
                            }}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.modalButton]}
                                onPress={handleCreateCompany}
                            >
                                <Text style={styles.buttonText}>OK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.modalButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0f0f0',
        margin: 0,
        padding: 0,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading1: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
    },
    heading2: {
        fontSize: 36,
        marginBottom: 40,
    },
    button: {
        width: 150,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
    },
    JoinCompany: {
        backgroundColor: '#007bff',
    },
    CreateCompany: {
        backgroundColor: '#28a745',
    },
    Chatbot: {
        backgroundColor: '#ffc107',
    },
    Logout: {
        backgroundColor: '#dc3545',
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
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        color: '#333',
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    errorText: {
        color: '#dc3545',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default NewUserDashboard;
