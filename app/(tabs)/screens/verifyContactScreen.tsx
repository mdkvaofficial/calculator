import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { auth } from "../../../FirebaseConfig"; // Ensure your FirebaseConfig is correctly set up
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';

interface VerifyContactScreenProps {
  navigation: NavigationProp<any, any>;
  route: RouteProp<any, { verificationId: string; email: string }>;
}

const VerifyContactScreen: React.FC<VerifyContactScreenProps> = ({ navigation, route }) => {
  const [verificationCode, setVerificationCode] = useState<string>("");

  const handleVerifyCode = async () => {
    const { verificationId, email } = route.params;
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(auth, credential);
      Alert.alert("Success", "Phone number verified successfully!");
      navigation.navigate("NewPasswordScreen", { email, verificationId, verificationCode }); // Pass necessary data
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Invalid verification code");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headings}>Enter Verification Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
        <Text style={styles.buttonText}>Verify</Text>
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
    width: "80%",
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
    borderRadius: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default VerifyContactScreen;
