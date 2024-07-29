import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

interface NewPasswordScreenProps {
    navigation: NavigationProp<any, any>;
}

const NewPasswordScreen: React.FC<NewPasswordScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.headings}>Create a New Password</Text>

            <TextInput
                placeholder='Password'
                placeholderTextColor="#666"
                style={styles.inputData}
                secureTextEntry={true}
            />
            <TextInput
                placeholder='Confirm Password'
                placeholderTextColor="#666"
                style={styles.inputData}
                secureTextEntry={true}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    navigation.navigate('Login');
                }}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0f0f0', // Light background
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headings: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 36,
        color: '#333', // Dark text color
        marginBottom: 30,
    },
    inputData: {
        backgroundColor: '#fff', // Light input field background
        color: '#333', // Dark text color
        textAlign: 'center',
        width: '100%',
        height: 50,
        marginBottom: 20,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        borderColor: '#ddd',
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
