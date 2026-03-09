package edu.crypto;

public class FindCorrectKey {

    public static void main(String[] args) throws Exception {
        String[] candidateKeys = {
                "68544020247570407220244063724074",
                "54684020247570407220244063724074",
                "54684020247570407220244063727440"
        };

        String targetHash = "f28fe539655fd6f7275a09b7c3508a3f81573fc42827ce34ddf1ec8d5c2421c3";

        String correctKey = null;

        for (String hexKey : candidateKeys) {
            byte[] keyBytes = CryptoUtils.hexToBytes(hexKey);
            byte[] hashBytes = CryptoUtils.sha256(keyBytes);
            String hashHex = CryptoUtils.bytesToHex(hashBytes);

            System.out.println("Checking key: " + hexKey);
            System.out.println("SHA-256    : " + hashHex);

            if (hashHex.equals(targetHash)) {
                correctKey = hexKey;
                System.out.println("MATCH FOUND");
            } else {
                System.out.println("Not this key");
            }

            System.out.println();
        }

        System.out.println("Target hash : " + targetHash);
        System.out.println("Correct key : " + correctKey);
    }
}
