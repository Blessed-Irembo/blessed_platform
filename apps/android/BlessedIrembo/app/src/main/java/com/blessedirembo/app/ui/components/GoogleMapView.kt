package com.blessedirembo.app.ui.components

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
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
 * Reusable Google Map component for Android
 * Featuring custom teal markers and "clinic-clean" styling
 */
@Composable
fun GoogleMapView(
    pharmacies: List<PharmacyInfo>,
    selectedPharmacyId: String?,
    onPharmacyClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    
    // Initial camera position centered on Kigali
    val kigali = LatLng(-1.9441, 30.0619)
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(kigali, 13f)
    }

    androidx.compose.runtime.LaunchedEffect(pharmacies) {
        if (pharmacies.isNotEmpty()) {
            if (pharmacies.size == 1) {
                cameraPositionState.animate(
                    com.google.android.gms.maps.CameraUpdateFactory.newLatLngZoom(
                        LatLng(pharmacies.first().latitude, pharmacies.first().longitude),
                        14f
                    )
                )
            } else {
                val builder = com.google.android.gms.maps.model.LatLngBounds.Builder()
                pharmacies.forEach { pharmacy ->
                    builder.include(LatLng(pharmacy.latitude, pharmacy.longitude))
                }
                try {
                    cameraPositionState.animate(
                        com.google.android.gms.maps.CameraUpdateFactory.newLatLngBounds(
                            builder.build(),
                            150 // pixel padding
                        )
                    )
                } catch (e: Exception) {
                    // Fallback if map layout is not yet sized properly for bounds
                    val avgLat = pharmacies.map { it.latitude }.average()
                    val avgLng = pharmacies.map { it.longitude }.average()
                    cameraPositionState.animate(
                        com.google.android.gms.maps.CameraUpdateFactory.newLatLngZoom(
                            LatLng(avgLat, avgLng),
                            12f
                        )
                    )
                }
            }
        }
    }

    // Load custom map style
    val mapProperties = remember {
        MapProperties(
            mapStyleOptions = MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style),
            isMyLocationEnabled = false // TODO: Enable when permission logic is integrated
        )
    }

    val mapUiSettings = remember {
        MapUiSettings(
            zoomControlsEnabled = false,
            myLocationButtonEnabled = false,
            mapToolbarEnabled = false
        )
    }

    GoogleMap(
        modifier = modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState,
        properties = mapProperties,
        uiSettings = mapUiSettings
    ) {
        pharmacies.forEach { pharmacy ->
            val isSelected = pharmacy.id == selectedPharmacyId
            val markerIcon = remember(pharmacy.isOpen, isSelected) {
                createCustomMarkerBitmap(
                    context = context,
                    isOpen = pharmacy.isOpen,
                    isSelected = isSelected
                )
            }

            Marker(
                state = MarkerState(position = LatLng(pharmacy.latitude, pharmacy.longitude)),
                title = pharmacy.name,
                snippet = pharmacy.address,
                icon = markerIcon,
                onClick = {
                    onPharmacyClick(pharmacy.id)
                    false // Return false to show info window or handle click
                }
            )
        }
    }
}

/**
 * Creates a custom marker bitmap matching the exact Web design (SVG replication)
 */
private fun createCustomMarkerBitmap(
    context: Context,
    isOpen: Boolean,
    isSelected: Boolean
): BitmapDescriptor {
    // Determine colors
    val bgHex = if (isSelected) "#0D9488" else if (isOpen) "#14B8A6" else "#6B7280"
    val ringHex = if (isSelected) "#0F766E" else if (isOpen) "#0D9488" else "#4B5563"
    
    val bgColor = Color.parseColor(bgHex)
    val ringColor = Color.parseColor(ringHex)
    
    // Base dimensions (will scale by density)
    val density = context.resources.displayMetrics.density
    // Scale up slightly for sharper rendering on map
    val scale = density * 1.5f 
    
    val baseW = if (isSelected) 52f else 42f
    val baseH = if (isSelected) 66f else 54f
    
    val w = baseW * scale
    val h = baseH * scale
    
    val bitmap = Bitmap.createBitmap(w.toInt(), h.toInt(), Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    
    val cx = w / 2f
    val r = cx - (3f * scale)
    val tipY = h - (2f * scale)
    
    // Shadow (simulated with a simple oval at the bottom for Android map context)
    paint.color = Color.argb(if (isSelected) 100 else 40, 0, 0, 0)
    paint.style = Paint.Style.FILL
    canvas.drawOval(
        cx - (8f * scale), 
        tipY - (4f * scale), 
        cx + (8f * scale), 
        tipY + (4f * scale), 
        paint
    )
    
    // Draw Pin tail
    val tailPath = android.graphics.Path()
    tailPath.moveTo(cx - (6f * scale), (r * 2f) + (3f * scale))
    tailPath.quadTo(cx, tipY + (4f * scale), cx + (6f * scale), (r * 2f) + (3f * scale))
    tailPath.close()
    paint.color = bgColor
    canvas.drawPath(tailPath, paint)
    
    // Outer ring
    paint.color = ringColor
    val ringRadius = r + if (isSelected) (1f * scale) else 0f
    canvas.drawCircle(cx, r + (3f * scale), ringRadius, paint)
    
    // Main circle body
    paint.color = bgColor
    canvas.drawCircle(cx, r + (3f * scale), r - (1f * scale), paint)
    
    // Inner white disc
    paint.color = Color.WHITE
    // Web uses opacity 0.97, close to solid white
    paint.alpha = 247 
    canvas.drawCircle(cx, r + (3f * scale), r * 0.72f, paint)
    
    // Diamond
    val dx = cx
    val dy = r + (3f * scale)
    val ds = r * 0.42f
    val diamondPath = android.graphics.Path()
    diamondPath.moveTo(dx, dy - (ds * 1.1f))
    diamondPath.lineTo(dx + ds, dy)
    diamondPath.lineTo(dx, dy + (ds * 1.1f))
    diamondPath.lineTo(dx - ds, dy)
    diamondPath.close()
    paint.color = bgColor
    paint.alpha = 255
    canvas.drawPath(diamondPath, paint)
    
    // Cross below diamond
    paint.color = ringColor
    paint.alpha = 178 // ~0.7 opacity
    
    val crossY = dy + (ds * 1.1f)
    // Vertical rect
    canvas.drawRoundRect(
        cx - (1.2f * scale),
        crossY + (2f * scale),
        cx + (1.2f * scale),
        crossY + (8f * scale),
        1f * scale, 1f * scale,
        paint
    )
    // Horizontal rect
    canvas.drawRoundRect(
        cx - (3f * scale),
        crossY + (3.8f * scale),
        cx + (3f * scale),
        crossY + (6.2f * scale),
        1f * scale, 1f * scale,
        paint
    )

    return BitmapDescriptorFactory.fromBitmap(bitmap)
}
