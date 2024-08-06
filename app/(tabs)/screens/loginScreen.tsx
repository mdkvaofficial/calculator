import React, { useState } from 'react';
import { Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { auth, db } from '../../../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { RootStackParamList } from '../types'; // Adjust the import path if necessary

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user exists in Firestore and determine navigation based on role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.role === 'Employer' || userData?.role === 'Employee') {
          // Navigate to Dashboard if role is Employer or Employee
          navigation.navigate('Dashboard');
        } else {
          // Navigate to NewUserDashboard otherwise
          navigation.navigate('NewUserDashboard');
        }
      } else {
        alert('User data not found in the database.');
      }
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headings}>HR-NotiWave</Text>

      <TextInput
        placeholder='Email'
        placeholderTextColor="#ccc"
        style={styles.inputData}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder='Password'
        placeholderTextColor="#ccc"
        style={styles.inputData}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={signIn}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={styles.buttonText}>Signup</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.forgotPasswordButton]}
        onPress={() => navigation.navigate('ForgotPasswordScreen')}
      >
        <Text style={styles.buttonText}>Forgot Password</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 40,
  },
  inputData: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    textAlign: 'left',
    width: '100%',
    height: 50,
    marginBottom: 20,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: '#333',
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
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#1976d2',
  },
  signupButton: {
    backgroundColor: '#388e3c',
  },
  forgotPasswordButton: {
    backgroundColor: '#d32f2f',
    marginTop: 10,
  },
});

export default Login;
