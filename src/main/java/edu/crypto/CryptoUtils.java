package edu.crypto;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class CryptoUtils {

    public static byte[] hexToBytes(String hex) {
        byte[] bytes = new byte[hex.length() / 2];

        for (int i = 0; i < hex.length(); i += 2) {
            int firstDigit = Character.digit(hex.charAt(i), 16);
            int secondDigit = Character.digit(hex.charAt(i + 1), 16);
            bytes[i / 2] = (byte) ((firstDigit << 4) + secondDigit);
        }

        return bytes;
    }

    public static String bytesToHex(byte[] bytes) {
        StringBuilder hexBuilder = new StringBuilder();

        for (byte b : bytes) {
            hexBuilder.append(String.format("%02x", b));
        }

        return hexBuilder.toString();
    }

    public static byte[] sha256(byte[] data) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return digest.digest(data);
    }
}