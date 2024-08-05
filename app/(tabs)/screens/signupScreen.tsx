import React, { useState, useRef } from 'react';
import { SafeAreaView, Text, StyleSheet, TouchableOpacity, TextInput, View, Modal } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { auth, db } from '../../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import PhoneInput from 'react-native-phone-number-input';

interface SignupProps {
  navigation: NavigationProp<any, any>;
}

const Signup: React.FC<SignupProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [formattedValue, setFormattedValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const phoneInput = useRef<PhoneInput>(null);

  const handleSignup = async () => {
    // Reset error message
    setErrorMessage(null);

    // Field validation
    if (!email || !password || !confirmPassword || !formattedValue) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage('Password must be at least 8 characters long and contain at least one special character');
      return;
    }

    if (!phoneInput.current?.isValidNumber(contactNumber)) {
      setErrorMessage('Please enter a valid phone number');
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
        isNewUser: true,
      });

      // Navigate to login screen only after successful Firestore update
      navigation.navigate('Login');
    } catch (error: any) {
      let errorMessage = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'The email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak.';
      }
      console.log(error);
      setErrorMessage(errorMessage);
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

      {errorMessage && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={() => setErrorMessage(null)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setErrorMessage(null)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
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
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#ff6347',
  },
});

export default Signup;
