import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet, TouchableOpacity, Alert, TextInput, LogBox } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { auth, db } from '../../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import PhoneInput from 'react-native-phone-number-input';

// Suppress the warning related to defaultProps in the CountryModal component
LogBox.ignoreLogs([
  'Warning: CountryModal: Support for defaultProps will be removed from function components in a future major release.'
]);

interface SignupProps {
  navigation: NavigationProp<any, any>;
}

const Signup: React.FC<SignupProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [formattedValue, setFormattedValue] = useState<string>('');
  const phoneInput = React.useRef<PhoneInput>(null);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !formattedValue) {
      Alert.alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert('Password must be at least 8 characters long and contain at least one special character');
      return;
    }

    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        contactNumber: formattedValue,
        isNewUser: true, // Flag to indicate that this is a new user
      });

      // Navigate to login screen
      navigation.navigate('Login');
    } catch (error: any) {
      console.log(error);
      Alert.alert('Signup failed: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headings}>Signup</Text>

      <TextInput
        placeholder='Email'
        placeholderTextColor="#666"
        style={styles.inputData}
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <TextInput
        placeholder='Password'
        placeholderTextColor="#666"
        style={styles.inputData}
        secureTextEntry={true}
        value={password}
        onChangeText={text => setPassword(text)}
      />
      <TextInput
        placeholder='Confirm Password'
        placeholderTextColor="#666"
        style={styles.inputData}
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={text => setConfirmPassword(text)}
      />
      <PhoneInput
        ref={phoneInput}
        defaultValue={contactNumber}
        defaultCode="US"
        layout="first"
        onChangeText={(text) => {
          setContactNumber(text);
        }}
        onChangeFormattedText={(text) => {
          setFormattedValue(text);
        }}
        withDarkTheme
        withShadow
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, styles.signup]}
        onPress={handleSignup}
      >
        <Text style={styles.buttonText}>Signup</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.login]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    fontSize: 32,
    color: '#333',
    marginBottom: 40,
  },
  inputData: {
    backgroundColor: '#fff',
    color: '#333',
    textAlign: 'left',
    width: '100%',
    height: 50,
    marginBottom: 20,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  signup: {
    backgroundColor: '#28a745',
  },
  login: {
    backgroundColor: '#007bff',
    marginTop: 10,
  },
});

export default Signup;
