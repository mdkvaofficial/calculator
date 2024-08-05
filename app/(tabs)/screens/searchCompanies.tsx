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
        backgroundColor: '#f0f0f0',
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    headings: {
        fontWeight: 'bold',
        fontSize: 36,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    companyContainer: {
        padding: 20,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: 1,
    },
    companyName: {
        color: '#333',
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
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        height: 80,
        textAlignVertical: 'top',
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
    submitButton: {
        backgroundColor: '#28a745',
    },
    closeButton: {
        backgroundColor: '#dc3545',
    },
});

export default SearchCompanies;
