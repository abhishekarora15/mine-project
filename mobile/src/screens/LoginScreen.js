import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Mail, Lock, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useAuthStore from '../store/authStore';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuthStore();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const result = await login(email, password);
        if (result.success) {
            navigation.replace('Home');
        } else {
            Alert.alert('Login Failed', result.message || 'Check your credentials');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Login to continue your food journey</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                        <Mail size={20} color={COLORS.textLight} />
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                        <Lock size={20} color={COLORS.textLight} />
                        <TextInput
                            style={styles.input}
                            placeholder="Min 6 characters"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={20} color={COLORS.textLight} /> : <Eye size={20} color={COLORS.textLight} />}
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.forgotBtn}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.loginBtn, loading && styles.disabledBtn]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.loginBtnText}>Login</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    formContainer: {
        flex: 1,
        padding: SPACING.lg,
    },
    backBtn: {
        marginBottom: SPACING.xl,
    },
    header: {
        marginBottom: SPACING.xl * 1.5,
    },
    title: {
        ...TYPOGRAPHY.h1,
        fontSize: 32,
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        ...TYPOGRAPHY.label,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        height: 56,
        backgroundColor: '#F8FAFC',
    },
    input: {
        flex: 1,
        marginLeft: SPACING.sm,
        ...TYPOGRAPHY.body,
        height: '100%',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.xl,
    },
    forgotText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    loginBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    loginBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    footerText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
    },
    footerLink: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
