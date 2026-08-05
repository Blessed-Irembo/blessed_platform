package com.blessedirembo.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.view.WindowCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.blessedirembo.app.analytics.AnalyticsManager
import com.blessedirembo.app.util.LanguageManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import com.google.android.play.core.ktx.isFlexibleUpdateAllowed
import com.google.android.play.core.ktx.isImmediateUpdateAllowed
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Main Activity for Blessed Irembo.
 *
 * Integrates the Google Play In-App Updates API:
 *  - FLEXIBLE update  : downloaded silently in background; user gets a toast
 *                       to restart once the download completes (for regular releases).
 *  - IMMEDIATE update : full-screen blocking flow for critical updates.
 *
 * NOTE: The update prompt only appears when installed through the Play Store.
 * Sideloaded / emulator builds silently skip the check.
 */
class MainActivity : ComponentActivity() {

    private val appUpdateManager by lazy { AppUpdateManagerFactory.create(this) }
    private val tag = "InAppUpdate"

    /** Single launcher for both flexible and immediate update flows. */
    // The lint rule "InvalidFragmentVersionForActivityResult" is a false-positive when
    // using StartIntentSenderForResult inside ComponentActivity (not a Fragment).
    @SuppressLint("InvalidFragmentVersionForActivityResult")
    private val updateFlowLauncher =
        registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { result: ActivityResult ->
            when (result.resultCode) {
                RESULT_OK       -> Log.d(tag, "Update flow completed successfully.")
                RESULT_CANCELED -> Log.w(tag, "Update flow was dismissed by the user.")
                else            -> Log.w(tag, "Update flow finished with code ${result.resultCode}.")
            }
        }

    /** Listener for FLEXIBLE update download progress. */
    private val flexibleInstallStateListener = InstallStateUpdatedListener { state ->
        when (state.installStatus()) {
            InstallStatus.DOWNLOADED -> {
                Log.d(tag, "Flexible update downloaded — prompting restart.")
                notifyUserToRestart()
            }
            InstallStatus.DOWNLOADING -> {
                val mb = state.totalBytesToDownload() / 1_048_576
                Log.d(tag, "Downloading update… ${mb} MB total")
            }
            InstallStatus.FAILED   -> Log.w(tag, "Flexible update download failed.")
            InstallStatus.CANCELED -> Log.d(tag, "User canceled flexible update.")
            else -> { /* no action needed for other states */ }
        }
    }

    // ────────────────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        AnalyticsManager.init(this)
        LanguageManager.init(this)

        enableEdgeToEdge()
        WindowCompat.setDecorFitsSystemWindows(window, false)

        appUpdateManager.registerListener(flexibleInstallStateListener)

        setContent {
            BlessedIremboApp()
        }

        // Check for updates 2 seconds after launch so the UI has time to load
        lifecycleScope.launch {
            delay(2_000)
            checkForAppUpdate()
        }
    }

    override fun onResume() {
        super.onResume()
        resumeImmediateUpdateIfNeeded()
        resumeFlexibleUpdateIfNeeded()
    }

    override fun onDestroy() {
        super.onDestroy()
        appUpdateManager.unregisterListener(flexibleInstallStateListener)
    }

    // ── Core update logic ────────────────────────────────────────────────────

    private fun checkForAppUpdate() {
        appUpdateManager.appUpdateInfo
            .addOnSuccessListener { info ->
                val available       = info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                val flexibleAllowed = info.isFlexibleUpdateAllowed
                val immediateAllowed = info.isImmediateUpdateAllowed

                Log.d(tag, "Update available=$available | flexible=$flexibleAllowed | immediate=$immediateAllowed")

                if (!available) return@addOnSuccessListener

                when {
                    // Prefer FLEXIBLE — non-intrusive background download
                    flexibleAllowed -> {
                        Log.d(tag, "Starting flexible update flow.")
                        appUpdateManager.startUpdateFlowForResult(
                            info,
                            updateFlowLauncher,
                            AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build()
                        )
                    }
                    // Fall back to IMMEDIATE if Play decides it is required
                    immediateAllowed -> {
                        Log.d(tag, "Starting immediate update flow.")
                        appUpdateManager.startUpdateFlowForResult(
                            info,
                            updateFlowLauncher,
                            AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build()
                        )
                    }
                    else -> Log.d(tag, "No eligible update flow for this device.")
                }
            }
            .addOnFailureListener { e ->
                // Silently swallowed — expected on emulators and sideloaded builds.
                Log.d(tag, "Update check skipped: ${e.message}")
            }
    }

    /**
     * If the user left mid-IMMEDIATE-update, re-trigger it on resume
     * so they cannot bypass it indefinitely.
     */
    private fun resumeImmediateUpdateIfNeeded() {
        appUpdateManager.appUpdateInfo.addOnSuccessListener { info ->
            if (info.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                Log.d(tag, "Resuming interrupted immediate update.")
                appUpdateManager.startUpdateFlowForResult(
                    info,
                    updateFlowLauncher,
                    AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build()
                )
            }
        }
    }

    /**
     * If a flexible update finished downloading while the app was backgrounded,
     * show the restart prompt again on resume.
     */
    private fun resumeFlexibleUpdateIfNeeded() {
        appUpdateManager.appUpdateInfo.addOnSuccessListener { info ->
            if (info.installStatus() == InstallStatus.DOWNLOADED) {
                Log.d(tag, "Flexible update already downloaded — showing restart prompt.")
                notifyUserToRestart()
            }
        }
    }

    /**
     * Tells the user that a downloaded flexible update is ready to apply,
     * then triggers the restart after a short delay.
     */
    private fun notifyUserToRestart() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.RESUMED) {
                Toast.makeText(
                    this@MainActivity,
                    "✅ Update downloaded! Restarting to apply…",
                    Toast.LENGTH_LONG
                ).show()
                delay(3_500)
                appUpdateManager.completeUpdate()
            }
        }
    }
}
