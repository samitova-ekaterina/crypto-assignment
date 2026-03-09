package edu.crypto;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class DecryptMessage {

    public static void main(String[] args) throws Exception {
        String correctKeyHex = "54684020247570407220244063724074";
        String cipherTextHex = "876b4e970c3516f333bcf5f16d546a87aaeea5588ead29d213557efc1903997e";
        String ivHex = "656e6372797074696f6e496e74566563";

        byte[] keyBytes = CryptoUtils.hexToBytes(correctKeyHex);
        byte[] cipherBytes = CryptoUtils.hexToBytes(cipherTextHex);
        byte[] ivBytes = CryptoUtils.hexToBytes(ivHex);

        byte[] plainBytes = decryptAesCbc(cipherBytes, keyBytes, ivBytes);
        String plainText = new String(plainBytes, StandardCharsets.UTF_8);

        System.out.println("Correct key : " + correctKeyHex);
        System.out.println("Ciphertext  : " + cipherTextHex);
        System.out.println("IV          : " + ivHex);
        System.out.println("Plaintext   : " + plainText);
    }

    public static byte[] decryptAesCbc(byte[] cipherBytes, byte[] keyBytes, byte[] ivBytes) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);

        return cipher.doFinal(cipherBytes);
    }
}