package com.blessedirembo.app.ui.components

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.key
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import com.blessedirembo.app.R
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MapStyleOptions
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapUiSettings
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState

/**
 * Data class representing a pharmacy for display in maps and lists.
 */
data class PharmacyInfo(
    val id: String,
    val name: String,
    val distance: String,
    val rating: Float,
    val reviewCount: Int,
    val address: String,
    val isOpen: Boolean,
    val isVerified: Boolean = false,
    val latitude: Double = -1.9441, // Default to Kigali center if not provided
    val longitude: Double = 30.0619
)

/**
 * Reusable Google Map component for Android.
 *
 * Fixes applied:
 *  1. MapStyleOptions loading is wrapped in try-catch so a bad JSON doesn't crash the map.
 *  2. MapProperties & MapUiSettings are stable remembered objects (no key needed here since
 *     they are pure constants, but the style is now safely loaded).
 *  3. cameraPositionState.animate() calls are wrapped in try-catch to guard against
 *     IllegalStateException when the GoogleMap composable is not yet attached to a window
 *     (the most common cause of "map not responding" on first launch).
 *  4. Every Marker is given a stable `key` so recomposition correctly diffs added/removed
 *     markers instead of recreating them all (fixes stale/disappearing pins).
 *
 * Markers match the iOS design exactly:
 *   • White rounded-rect bubble with downward pointer
 *   • logo1.png clipped to a circle inside the bubble
 *   • Teal (#0D9488) border for verified pharmacies
 *   • Gray   (#9CA3AF) border for unverified
 *   • 48 dp bubble when selected, 36 dp otherwise
 */
@Composable
fun GoogleMapView(
    pharmacies: List<PharmacyInfo>,
    selectedPharmacyId: String?,
    onPharmacyClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    // Initial camera position centred on Kigali – same default as iOS
    val kigali = LatLng(-1.9536, 30.0606)
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(kigali, 13.5f)
    }

    // ── Fix #1: Load map style safely – if the JSON is malformed or the resource is
    //    missing the map still renders (just without custom styling).
    val mapStyleOptions = remember {
        try {
            MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style)
        } catch (e: Exception) {
            null // Fall back to default Google Maps style
        }
    }

    // ── Fix #2: Stable MapProperties. We hold it in a var so it can be updated if needed
    //    in future (e.g., when isMyLocationEnabled must change at runtime).
    val hasLocationPermission = remember(context) {
        ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_COARSE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED
    }

    val mapProperties = remember(mapStyleOptions, hasLocationPermission) {
        MapProperties(
            mapStyleOptions = mapStyleOptions,
            isMyLocationEnabled = hasLocationPermission
        )
    }

    val mapUiSettings = remember {
        MapUiSettings(
            zoomControlsEnabled = false,
            myLocationButtonEnabled = false,
            mapToolbarEnabled = false
        )
    }

    // ── Fix #3: Camera animation wrapped in try-catch.
    //    GoogleMap raises IllegalStateException / CancellationException if the map
    //    composable isn't fully laid out yet (common on first open).
    LaunchedEffect(pharmacies) {
        if (pharmacies.isNotEmpty()) {
            try {
                if (pharmacies.size == 1) {
                    cameraPositionState.animate(
                        com.google.android.gms.maps.CameraUpdateFactory.newLatLngZoom(
                            LatLng(pharmacies.first().latitude, pharmacies.first().longitude),
                            15f
                        )
                    )
                } else {
                    val builder = com.google.android.gms.maps.model.LatLngBounds.Builder()
                    pharmacies.forEach { builder.include(LatLng(it.latitude, it.longitude)) }
                    try {
                        cameraPositionState.animate(
                            com.google.android.gms.maps.CameraUpdateFactory.newLatLngBounds(
                                builder.build(), 150
                            )
                        )
                    } catch (boundsEx: Exception) {
                        // Fallback: animate to average centre
                        val avgLat = pharmacies.map { it.latitude }.average()
                        val avgLng = pharmacies.map { it.longitude }.average()
                        cameraPositionState.animate(
                            com.google.android.gms.maps.CameraUpdateFactory.newLatLngZoom(
                                LatLng(avgLat, avgLng), 12f
                            )
                        )
                    }
                }
            } catch (e: Exception) {
                // Map not yet ready – silently ignore; the user can pan manually.
            }
        }
    }

    GoogleMap(
        modifier = modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState,
        properties = mapProperties,
        uiSettings = mapUiSettings
    ) {
        // ── Fix #4: Use `key()` per marker so Compose correctly identifies each one.
        //    Without this, ALL markers are destroyed and recreated on every recomposition
        //    (e.g., when selectedPharmacyId changes), which can cause the map to freeze.
        pharmacies.forEach { pharmacy ->
            val isSelected = pharmacy.id == selectedPharmacyId
            val markerIcon = remember(pharmacy.id, isSelected, pharmacy.isVerified) {
                createPharmacyMarkerIcon(
                    context = context,
                    isVerified = pharmacy.isVerified,
                    isSelected = isSelected
                )
            }

            key(pharmacy.id) {
                Marker(
                    state = remember(pharmacy.id) {
                        MarkerState(position = LatLng(pharmacy.latitude, pharmacy.longitude))
                    },
                    title = pharmacy.name,
                    snippet = pharmacy.address,
                    icon = markerIcon,
                    onClick = {
                        onPharmacyClick(pharmacy.id)
                        true // consume click — prevents default info window
                    }
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Marker icon factory — mirrors iOS GoogleMapsView.makeMarkerIcon(isVerified:isSelected:)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds an iOS-equivalent pharmacy map marker:
 *
 *  ┌────────────────┐
 *  │  ┌──────────┐  │  ← white rounded-rect bubble
 *  │  │  logo1   │  │  ← logo1.png clipped to circle
 *  │  └──────────┘  │
 *  └───────┬────────┘  ← teal (verified) or gray (unverified) border
 *          ▼           ← downward triangular pointer
 *
 * Sizes:  selected = 48 dp bubble,  normal = 36 dp bubble
 */
private fun createPharmacyMarkerIcon(
    context: Context,
    isVerified: Boolean,
    isSelected: Boolean
): BitmapDescriptor {
    val density = context.resources.displayMetrics.density

    // Bubble dimensions (dp → px) — matching iOS 36 / 48
    val bubbleSizePx = (if (isSelected) 48f else 36f) * density
    val cornerRadiusPx = bubbleSizePx * 0.3f
    val pointerHeightPx = bubbleSizePx * 0.25f
    val shadowPadding = 4f * density

    val totalWidth = bubbleSizePx + shadowPadding * 2
    val totalHeight = bubbleSizePx + pointerHeightPx + shadowPadding * 2

    val bitmap = Bitmap.createBitmap(
        totalWidth.toInt(),
        totalHeight.toInt(),
        Bitmap.Config.ARGB_8888
    )
    val canvas = Canvas(bitmap)

    // Colours — mirroring iOS: verified = teal, unverified = systemGray
    val strokeColor = if (isVerified) Color.parseColor("#0D9488") else Color.parseColor("#9CA3AF")
    val fillColor = Color.WHITE
    val strokeWidthPx = 1.5f * density

    val paint = Paint(Paint.ANTI_ALIAS_FLAG)

    // Translate to leave room for shadow padding
    canvas.translate(shadowPadding, shadowPadding)

    // ── Drop shadow (subtle, like iOS)
    val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.argb(51, 0, 0, 0) // 0.2 alpha
        maskFilter = android.graphics.BlurMaskFilter(
            4f * density, android.graphics.BlurMaskFilter.Blur.NORMAL
        )
    }
    canvas.drawRoundRect(
        RectF(2f, 2f, bubbleSizePx - 2f, bubbleSizePx - 2f),
        cornerRadiusPx, cornerRadiusPx, shadowPaint
    )

    // ── Bubble path (rounded-rect + pointer triangle) — matches iOS UIBezierPath
    val bubblePath = Path().apply {
        addRoundRect(
            RectF(0f, 0f, bubbleSizePx, bubbleSizePx),
            cornerRadiusPx, cornerRadiusPx,
            Path.Direction.CW
        )
    }
    // Pointer — iOS: moveTo(size*0.4, size), lineTo(size*0.5, size+size*0.25), lineTo(size*0.6, size)
    val pointerPath = Path().apply {
        moveTo(bubbleSizePx * 0.4f, bubbleSizePx)
        lineTo(bubbleSizePx * 0.5f, bubbleSizePx + pointerHeightPx)
        lineTo(bubbleSizePx * 0.6f, bubbleSizePx)
        close()
    }
    val fullPath = Path().apply {
        addPath(bubblePath)
        addPath(pointerPath)
    }

    // Fill white
    paint.style = Paint.Style.FILL
    paint.color = fillColor
    canvas.drawPath(fullPath, paint)

    // Stroke (teal / gray)
    paint.style = Paint.Style.STROKE
    paint.color = strokeColor
    paint.strokeWidth = strokeWidthPx
    canvas.drawPath(fullPath, paint)

    // ── Draw logo1.png clipped to circle inside bubble (matches iOS logo clip)
    val logoDrawable = ContextCompat.getDrawable(context, R.drawable.logo1)
    val imageInset = bubbleSizePx * 0.15f
    val imageSize = bubbleSizePx - imageInset * 2
    val cx = bubbleSizePx / 2f
    val cy = bubbleSizePx / 2f

    if (logoDrawable != null) {
        // Clip to circle
        val clipPath = Path().apply {
            addCircle(cx, cy, imageSize / 2f, Path.Direction.CW)
        }
        canvas.save()
        canvas.clipPath(clipPath)
        logoDrawable.setBounds(
            imageInset.toInt(),
            imageInset.toInt(),
            (imageInset + imageSize).toInt(),
            (imageInset + imageSize).toInt()
        )
        logoDrawable.draw(canvas)
        canvas.restore()
    } else {
        // Fallback: white cross (matching iOS fallback)
        paint.style = Paint.Style.STROKE
        paint.color = Color.WHITE
        paint.strokeWidth = bubbleSizePx * 0.12f
        paint.strokeCap = Paint.Cap.ROUND
        val crossInset = bubbleSizePx * 0.25f
        // Vertical
        canvas.drawLine(cx, crossInset, cx, bubbleSizePx - crossInset, paint)
        // Horizontal
        canvas.drawLine(crossInset, cy, bubbleSizePx - crossInset, cy, paint)
    }

    return BitmapDescriptorFactory.fromBitmap(bitmap)
}
