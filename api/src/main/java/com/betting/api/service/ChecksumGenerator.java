package com.betting.api.service;

import java.security.SecureRandom;
import java.util.HexFormat;

public final class ChecksumGenerator
{
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final HexFormat HEX = HexFormat.of();

    private ChecksumGenerator() {}

    public static String next()
    {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HEX.formatHex(bytes);
    }
}