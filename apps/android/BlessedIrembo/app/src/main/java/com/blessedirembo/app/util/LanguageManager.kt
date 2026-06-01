package com.blessedirembo.app.util

import android.content.Context
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

private const val PREFS_NAME = "blessed_prefs"
private const val KEY_LANGUAGE = "selectedLanguage"

/**
 * LanguageManager
 *
 * Singleton that manages the active app language, persists the selection,
 * and provides `t(key)` for string lookup — mirroring iOS AppState language logic.
 *
 * Usage:
 *   LanguageManager.init(context)          // call once from Application or MainActivity
 *   val text = LanguageManager.t("nav.home")
 *   LanguageManager.toggleLanguage()
 *   val lang by LanguageManager.selectedLanguage.collectAsState()
 */
object LanguageManager {

    private val _selectedLanguage = MutableStateFlow(Language.ENGLISH)
    val selectedLanguage: StateFlow<Language> = _selectedLanguage.asStateFlow()

    private var appContext: Context? = null

    /** Call once from Application.onCreate() or MainActivity.onCreate() */
    fun init(context: Context) {
        appContext = context.applicationContext
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val saved = prefs.getString(KEY_LANGUAGE, Language.ENGLISH.code) ?: Language.ENGLISH.code
        _selectedLanguage.value = Language.fromCode(saved)
    }

    /**
     * Translate a key in the currently active language.
     * Falls back to the key itself if not found (same behaviour as iOS `t(_ key)`).
     */
    fun t(key: String): String {
        val lang = _selectedLanguage.value.code
        return Translations.catalog[lang]?.get(key) ?: key
    }

    /** Toggle between English and Kinyarwanda, persisting the choice. */
    fun toggleLanguage() {
        val next = if (_selectedLanguage.value == Language.ENGLISH) {
            Language.KINYARWANDA
        } else {
            Language.ENGLISH
        }
        _selectedLanguage.value = next
        appContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            ?.edit()
            ?.putString(KEY_LANGUAGE, next.code)
            ?.apply()
    }
}

/** CompositionLocal so Composables can access the current language without passing it down. */
val LocalLanguage = compositionLocalOf { Language.ENGLISH }

/**
 * Top-level Composable function to resolve a translation key.
 * Automatically recomposes when the selected language in LanguageManager changes.
 */
@androidx.compose.runtime.Composable
fun t(key: String): String {
    val language by LanguageManager.selectedLanguage.collectAsState(initial = Language.ENGLISH)
    return Translations.catalog[language.code]?.get(key) ?: key
}
