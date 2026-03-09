package edu.crypto;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;
import java.util.Base64;

public class GenerateSignature {

    public static void main(String[] args) throws Exception {
        String message = "Hello Blockchain!";

        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
        keyPairGenerator.initialize(256);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();

        byte[] publicKeyBytes = keyPair.getPublic().getEncoded();
        String publicKeyBase64 = Base64.getEncoder().encodeToString(publicKeyBytes);

        Signature signature = Signature.getInstance("SHA256withECDSA");
        signature.initSign(keyPair.getPrivate());
        signature.update(message.getBytes(StandardCharsets.UTF_8));
        byte[] signatureBytes = signature.sign();

        String signatureBase64 = Base64.getEncoder().encodeToString(signatureBytes);

        System.out.println("Message          : " + message);
        System.out.println("Public key (B64) : " + publicKeyBase64);
        System.out.println("Signature (B64)  : " + signatureBase64);
    }
}