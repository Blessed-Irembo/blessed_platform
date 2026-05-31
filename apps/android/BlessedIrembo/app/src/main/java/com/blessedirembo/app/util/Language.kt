package com.blessedirembo.app.util

/**
 * Language
 *
 * Enum defining the supported languages in the Blessed Irembo application.
 * Mirrors iOS Language.swift exactly.
 */
enum class Language(val code: String) {
    ENGLISH("en"),
    KINYARWANDA("rw");

    /** Short display label shown in the FloatingLanguageSwitcher pill (e.g. "EN") */
    val displayName: String
        get() = when (this) {
            ENGLISH -> "EN"
            KINYARWANDA -> "RW"
        }

    /** Full language name (e.g. "English") */
    val fullName: String
        get() = when (this) {
            ENGLISH -> "English"
            KINYARWANDA -> "Kinyarwanda"
        }

    companion object {
        /** Parse a language code string ("en", "rw") back to a Language, defaulting to ENGLISH. */
        fun fromCode(code: String): Language =
            entries.firstOrNull { it.code == code } ?: ENGLISH
    }
}
