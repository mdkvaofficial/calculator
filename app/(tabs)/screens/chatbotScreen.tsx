import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { db } from '../../../FirebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import RNPickerSelect from 'react-native-picker-select';
import { format } from 'date-fns';

interface ChatbotProps {
  navigation: NavigationProp<any, any>;
}

const ChatbotScreen: React.FC<ChatbotProps> = ({ navigation }) => {
  const [companies, setCompanies] = useState<Array<{ id: string; name: string; createdAt: any }>>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [companyCreatedDate, setCompanyCreatedDate] = useState<string | null>(null);
  const [employerName, setEmployerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      const querySnapshot = await getDocs(collection(db, 'companies'));
      const companiesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        createdAt: doc.data().createdAt,
      }));
      setCompanies(companiesList);
    };

    fetchCompanies();
  }, []);

  const handleCompanySelect = async (value: string | null) => {
    if (value) {
      setSelectedCompany(value);
      try {
        const usersQuery = query(collection(db, 'users'), where('companyId', '==', value));
        const usersSnapshot = await getDocs(usersQuery);
        setUserCount(usersSnapshot.size);

        const employerQuery = query(collection(db, 'users'), where('companyId', '==', value), where('role', '==', 'Employer'));
        const employerSnapshot = await getDocs(employerQuery);
        if (!employerSnapshot.empty) {
          const employerDoc = employerSnapshot.docs[0].data();
          setEmployerName(employerDoc.name || employerDoc.email || 'No employer name found');
        } else {
          setEmployerName('No employer found');
        }

        const selectedCompanyData = companies.find(company => company.id === value);
        if (selectedCompanyData) {
          const formattedDate = selectedCompanyData.createdAt?.seconds
            ? format(new Date(selectedCompanyData.createdAt.seconds * 1000), 'PPpp')
            : 'Unknown date';
          setCompanyCreatedDate(formattedDate);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
        setUserCount(null);
        setCompanyCreatedDate(null);
        setEmployerName(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headings}>Chatbot</Text>

      <RNPickerSelect
        onValueChange={handleCompanySelect}
        items={companies.map(company => ({ label: company.name, value: company.id }))}
        placeholder={{ label: 'Select a company', value: null }}
        style={pickerSelectStyles}
        value={selectedCompany}
      />

      {selectedCompany && (
        <View style={styles.infoContainer}>
          {employerName && <Text style={styles.userText}>{`Employer: ${employerName}`}</Text>}
          {userCount !== null && <Text style={styles.userText}>{`Number of users: ${userCount}`}</Text>}
          {companyCreatedDate && <Text style={styles.userText}>{`Created on: ${companyCreatedDate}`}</Text>}
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.dashboardButton]}
        onPress={() => navigation.navigate('NewUserDashboard')}
      >
        <Text style={styles.buttonText}>Dashboard</Text>
      </TouchableOpacity>
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
  headings: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 40,
    position: 'absolute',
    top: 60,
  },
  infoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  userText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  dashboardButton: {
    backgroundColor: '#388e3c',
    position: 'absolute',
    bottom: 40,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 4,
    color: '#ffffff',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: '#2e2e2e',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#555',
    borderRadius: 8,
    color: '#ffffff',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: '#2e2e2e',
  },
});

export default ChatbotScreen;
