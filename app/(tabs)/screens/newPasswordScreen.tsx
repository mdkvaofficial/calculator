import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { db, auth } from "../../../FirebaseConfig"; // Ensure your FirebaseConfig is correctly set up
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { updatePassword, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

interface NewPasswordScreenProps {
  navigation: NavigationProp<any, any>;
  route: RouteProp<any, { email: string, verificationId: string, verificationCode: string }>;
}

const NewPasswordScreen: React.FC<NewPasswordScreenProps> = ({ navigation, route }) => {
  const { email, verificationId, verificationCode } = route.params;
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSavePassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      // Query Firestore to find the document with the specified email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "User not found");
        return;
      }

      // Assuming there's only one document with the specified email
      const userDoc = querySnapshot.docs[0];
      const userDocRef = doc(db, "users", userDoc.id);

      // Update the password field in the document (if you want to keep it in Firestore for any reason)
      await updateDoc(userDocRef, { password });

      // Re-authenticate the user and update their password in Firebase Authentication
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, password);

      Alert.alert("Success", "Password updated successfully!");
      navigation.navigate("Login");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Failed to update password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headings}>Create a New Password</Text>

      <TextInput
        placeholder='Password'
        placeholderTextColor="#999"
        style={styles.inputData}
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder='Confirm Password'
        placeholderTextColor="#999"
        style={styles.inputData}
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSavePassword}
      >
        <Text style={styles.buttonText}>Save Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212', // Dark background
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headings: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 36,
    color: '#fff', // Light text color
    marginBottom: 30,
  },
  inputData: {
    backgroundColor: '#1e1e1e', // Dark input field background
    color: '#fff', // Light text color
    textAlign: 'center',
    width: '100%',
    height: 50,
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: '#333',
    borderWidth: 1,
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff', // Primary button color
    marginBottom: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff', // Light text color
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default NewPasswordScreen;
