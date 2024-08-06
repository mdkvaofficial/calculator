import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { db, auth } from '../../../FirebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';

interface FilterCompaniesProps {
    navigation: NavigationProp<any, any>;
}

const SearchCompanies: React.FC<FilterCompaniesProps> = ({ navigation }) => {
    const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [description, setDescription] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            const querySnapshot = await getDocs(collection(db, 'companies'));
            const companiesList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
            }));
            setCompanies(companiesList);
        };
        fetchCompanies();
    }, []);

    const handleCompanyPress = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setModalVisible(true);
    };

    const requestToJoinCompany = async () => {
        try {
            const user = auth.currentUser;
            if (user && selectedCompanyId) {
                const joinRequestsRef = collection(db, 'joinRequests');
                await addDoc(joinRequestsRef, {
                    userId: user.uid,
                    userEmail: user.email,
                    companyId: selectedCompanyId,
                    description: description, // Store the description
                    status: 'pending',
                    createdAt: new Date(),
                });

                setModalVisible(false);
                setDescription('');
                Alert.alert('Request Sent', 'Your request to join the company has been sent.');
            } else {
                Alert.alert('Error', 'User not authenticated.');
            }
        } catch (error) {
            console.error('Error sending join request: ', error);
            alert('Error sending join request. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headings}>Companies Available</Text>
            <FlatList
                data={companies}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleCompanyPress(item.id)}>
                        <View style={styles.companyContainer}>
                            <Text style={styles.companyName}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Join Request Description</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Write a brief description about yourself"
                            placeholderTextColor="#999"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={requestToJoinCompany}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.closeButton]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
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
        alignItems: 'center',
        padding: 20,
    },
    headings: {
        fontWeight: 'bold',
        fontSize: 36,
        color: '#ffffff',
        marginBottom: 20,
        textAlign: 'center',
    },
    companyContainer: {
        padding: 20,
        marginVertical: 10,
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        borderColor: '#444',
        borderWidth: 1,
    },
    companyName: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '500',
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
        marginBottom: 10,
        color: '#ffffff',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        height: 80,
        textAlignVertical: 'top',
        backgroundColor: '#2e2e2e',
        color: '#ffffff',
    },
    button: {
        width: 200,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1976d2',
        marginBottom: 20,
        borderRadius: 10,
    },
    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#388e3c',
    },
    closeButton: {
        backgroundColor: '#d32f2f',
    },
});

export default SearchCompanies;
