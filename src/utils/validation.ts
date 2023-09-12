export const validateRegistrationInput = (data) => {
    if (!data.username || data.username.length < 3) {
        return { valid: false, message: 'Username should be at least 3 characters long' };
    }

    if (!data.password || data.password.length < 8) {
        return { valid: false, message: 'Password should be at least 8 characters long' };
    }

    return { valid: true };
};