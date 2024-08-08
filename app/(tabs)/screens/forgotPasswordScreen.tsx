import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import PhoneInput from "react-native-phone-number-input";
import "react-native-country-picker-modal";
import { auth, firebaseConfig, db } from "../../../FirebaseConfig"; // Ensure your FirebaseConfig is correctly set up
import { PhoneAuthProvider } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface ForgotPasswordScreenProps {
  navigation: NavigationProp<any, any>;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [formattedValue, setFormattedValue] = useState<string>("");
  const phoneInput = useRef<PhoneInput>(null);
  const recaptchaVerifier = useRef(null);

  const handleGetCode = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!contactNumber) {
      Alert.alert("Error", "Please enter your contact number");
      return;
    }

    const isValid = phoneInput.current?.isValidNumber(contactNumber);
    if (!isValid) {
      Alert.alert("Error", "Please enter a valid contact number");
      return;
    }

    try {
      // Check if email exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "Email address not found");
        return;
      }

      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formattedValue,
        recaptchaVerifier.current
      );
      navigation.navigate("VerifyContactScreen", { verificationId, email }); // Pass email to VerifyContactScreen
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Failed to send verification code");
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />

      <Text style={styles.headings}>Forgot Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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
        style={[styles.button, styles.getCodeButton]}
        onPress={handleGetCode}
      >
        <Text style={styles.buttonText}>Get Code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headings: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 36,
    color: "#ffffff",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1976d2",
    marginBottom: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  getCodeButton: {
    backgroundColor: "#1976d2",
  },
});

export default ForgotPasswordScreen;
