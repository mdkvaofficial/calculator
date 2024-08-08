import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { db, auth } from '../../../FirebaseConfig'; // Ensure you import auth as well
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';

interface newUserDashboardProps {
    navigation: NavigationProp<any, any>;
}

const NewUserDashboard: React.FC<newUserDashboardProps> = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [emailModalVisible, setEmailModalVisible] = useState(false);

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

            // Update user role to "Employer"
            const userDocRef = doc(db, 'users', auth.currentUser?.uid!);
            await updateDoc(userDocRef, {
                role: 'Employer',
                companyId: companyDocRef.id,
            });

            setModalVisible(false);
            navigation.navigate('Dashboard'); // Navigate to Dashboard after creation
        } catch (error) {
            console.error('Error adding document: ', error);
            alert('Error creating company. Please try again.');
        }
    };

    const handleEmailPress = () => {
        setEmailModalVisible(true);
    };

    const handleCloseEmailModal = () => {
        setEmailModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {userEmail && (
                <TouchableOpacity onPress={handleEmailPress}>
                    <Text style={styles.heading1}>{userEmail}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={[styles.button, styles.JoinCompany]}
                onPress={() => navigation.navigate('SearchCompanies')}
            >
                <Image source={require('../../../assets/images/joinCompany.png')} style={styles.buttonImage} />
                <Text style={styles.buttonText}>Join Company</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.CreateCompany]}
                onPress={() => setModalVisible(true)}
            >
                <Image source={require('../../../assets/images/createCompany.png')} style={styles.buttonImage} />
                <Text style={styles.buttonText}>Create Company</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.Chatbot]}
                onPress={() => { navigation.navigate('ChatbotScreen'); }}
            >
                <Image source={require('../../../assets/images/chatbot.png')} style={styles.buttonImage} />
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
                            placeholderTextColor="#999"
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

            <Modal
                transparent={true}
                visible={emailModalVisible}
                onRequestClose={handleCloseEmailModal}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Email: {userEmail}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCloseEmailModal}
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
        color: '#ffffff',
        marginBottom: 20,
        textDecorationLine: 'underline',
        position: 'relative',
        bottom: 100,
    },

    button: {
        width: 200,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 10,
        flexDirection: 'row',
    },
    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
    buttonImage: {
        width: 50,
        height: 60,
    },
    JoinCompany: {
        backgroundColor: '#1976d2',
        position: 'relative',
        left: 100,
        top: 50,
    },
    CreateCompany: {
        backgroundColor: '#388e3c',
        position: 'relative',
        right: 100,
        bottom: 50,
    },
    Chatbot: {
        backgroundColor: 'orange',
        position: 'relative',
        bottom: 40,

    },
    Logout: {
        backgroundColor: '#d32f2f',
        position: 'relative',
        top: 120,
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
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#444',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        color: '#ffffff',
        backgroundColor: '#2e2e2e',
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
        backgroundColor: '#1976d2',
        borderRadius: 5,
    },
    errorText: {
        color: '#f44336',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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

export default NewUserDashboard;
