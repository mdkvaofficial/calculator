import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { db, auth } from '../../../FirebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';

interface FilterCompaniesProps {
    navigation: NavigationProp<any, any>;
}

const SearchCompanies: React.FC<FilterCompaniesProps> = ({ navigation }) => {
    const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);

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

    const requestToJoinCompany = async (companyId: string) => {
        try {
            const user = auth.currentUser;
            if (user) {
                // Add a request document to the 'joinRequests' collection in Firestore
                const joinRequestsRef = collection(db, 'joinRequests');
                await addDoc(joinRequestsRef, {
                    userId: user.uid,
                    userEmail: user.email,
                    companyId: companyId,
                    status: 'pending', // Initial status is pending
                    createdAt: new Date(),
                });

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
                    <TouchableOpacity onPress={() => requestToJoinCompany(item.id)}>
                        <View style={styles.companyContainer}>
                            <Text style={styles.companyName}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
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
});

export default SearchCompanies;
