package com.blessedirembo.app.analytics

import android.content.Context
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.logEvent

/**
 * AnalyticsManager
 * Centralizes all Firebase Analytics event logging.
 * Wrap every meaningful user action here for tracking.
 */
object AnalyticsManager {

    private lateinit var analytics: FirebaseAnalytics

    /**
     * Must be called once in MainActivity before any logging.
     */
    fun init(context: Context) {
        analytics = FirebaseAnalytics.getInstance(context)
    }

    /** Log a screen view event */
    fun logScreenView(screenName: String) {
        analytics.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW) {
            param(FirebaseAnalytics.Param.SCREEN_NAME, screenName)
        }
    }

    /** Log when a user signs in */
    fun logSignIn(method: String = "email") {
        analytics.logEvent(FirebaseAnalytics.Event.LOGIN) {
            param(FirebaseAnalytics.Param.METHOD, method)
        }
    }

    /** Log when a user signs up */
    fun logSignUp(role: String) {
        analytics.logEvent(FirebaseAnalytics.Event.SIGN_UP) {
            param(FirebaseAnalytics.Param.METHOD, "email")
            param("role", role)
        }
    }

    /** Log a pharmacy search */
    fun logPharmacySearch(query: String) {
        analytics.logEvent(FirebaseAnalytics.Event.SEARCH) {
            param(FirebaseAnalytics.Param.SEARCH_TERM, query)
        }
    }

    /** Log when a user sends an inquiry to a pharmacy */
    fun logInquirySent(pharmacyId: String) {
        analytics.logEvent("inquiry_sent") {
            param("pharmacy_id", pharmacyId)
        }
    }

    /** Log pharmacy detail page view */
    fun logPharmacyView(pharmacyId: String, pharmacyName: String) {
        analytics.logEvent(FirebaseAnalytics.Event.VIEW_ITEM) {
            param(FirebaseAnalytics.Param.ITEM_ID, pharmacyId)
            param(FirebaseAnalytics.Param.ITEM_NAME, pharmacyName)
        }
    }
}
