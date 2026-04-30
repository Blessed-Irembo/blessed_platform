package com.blessedirembo.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Directions
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.analytics.AnalyticsManager
import com.blessedirembo.app.data.model.OperatingHours
import com.blessedirembo.app.ui.components.PharmacyInfo
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray300
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.PharmacyViewModel
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PharmacyDetailScreen(
    pharmacyId: String,
    onBackClick: () -> Unit,
    onShareClick: () -> Unit = {},
    modifier: Modifier = Modifier,
    pharmacyViewModel: PharmacyViewModel = viewModel()
) {
    val scrollState = rememberScrollState()
    val pharmacy by pharmacyViewModel.selectedPharmacy.collectAsState()
    val context = LocalContext.current
    var hoursExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(pharmacyId) {
        pharmacyViewModel.loadPharmacyById(pharmacyId)
        pharmacyViewModel.incrementProfileViews(pharmacyId)
        pharmacy?.let { AnalyticsManager.logPharmacyView(pharmacyId, it.name) }
    }

    val p = pharmacy
    if (p == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Teal500)
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    IconButton(
                        onClick = onBackClick,
                        modifier = Modifier
                            .padding(8.dp)
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(White)
                    ) {
                        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Gray900)
                    }
                },
                actions = {
                    IconButton(
                        onClick = onShareClick,
                        modifier = Modifier
                            .padding(8.dp)
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(White)
                    ) {
                        Icon(imageVector = Icons.Filled.Share, contentDescription = "Share", tint = Teal500)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        },
        containerColor = Gray100
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
        ) {
            // 1. Map Header
            val mapPharmacy = PharmacyInfo(
                id = p.id, name = p.name, distance = "—", rating = p.rating.toFloat(),
                reviewCount = p.reviewCount, address = p.address, isOpen = p.isOpen,
                isVerified = p.isVerified, latitude = p.latitude, longitude = p.longitude
            )
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
            ) {
                com.blessedirembo.app.ui.components.GoogleMapView(
                    pharmacies = listOf(mapPharmacy),
                    selectedPharmacyId = p.id,
                    onPharmacyClick = { },
                    modifier = Modifier.fillMaxSize()
                )
            }

            // 2. Main Info Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(White)
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.Top) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = p.name,
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                                color = Gray900
                            )
                            if (p.isVerified) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(imageVector = Icons.Filled.CheckCircle, contentDescription = "Verified", tint = Teal500, modifier = Modifier.size(20.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "—", style = MaterialTheme.typography.bodyMedium, color = Gray500)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Badges Row
                if (p.isVerified || p.is24_7 || p.isPremium) {
                    Row(modifier = Modifier.padding(bottom = 16.dp)) {
                        if (p.isVerified) {
                            BadgeView("Verified", Teal500)
                            Spacer(modifier = Modifier.width(8.dp))
                        }
                        if (p.is24_7) {
                            BadgeView("24/7 Available", Color(0xFF3B82F6))
                            Spacer(modifier = Modifier.width(8.dp))
                        }
                        if (p.isPremium) {
                            BadgeView("Premium Member", Color(0xFF4F46E5))
                        }
                    }
                }

                if (p.description.isNotBlank()) {
                    Text(text = p.description, style = MaterialTheme.typography.bodyMedium, color = Gray500, lineHeight = MaterialTheme.typography.bodyMedium.lineHeight * 1.2)
                    Spacer(modifier = Modifier.height(16.dp))
                }

                HorizontalDivider(color = Gray100)
                Spacer(modifier = Modifier.height(16.dp))

                // Quick action buttons
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Call
                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${p.phoneNumber.filter { it.isDigit() }}"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(50.dp)
                            .border(1.dp, Color(0xFF99F6E4), RoundedCornerShape(12.dp)),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF0FDFA), contentColor = Color(0xFF0F766E)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(imageVector = Icons.Filled.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Call Pharmacy", fontWeight = FontWeight.SemiBold)
                    }

                        // WhatsApp
                    Button(
                        onClick = {
                            pharmacyViewModel.incrementWhatsAppClicks(pharmacyId)
                            val msg = "Hello, I found your pharmacy via the Blessed Irembo platform."
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/${p.whatsAppNumber.filter { it.isDigit() }}?text=${Uri.encode(msg)}"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366), contentColor = White),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(imageVector = Icons.Filled.Email, contentDescription = null, modifier = Modifier.size(16.dp)) // SF Message fallback roughly
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("WhatsApp", fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 3. Contact & Hours Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(White)
                    .padding(vertical = 20.dp)
            ) {
                Text(
                    text = "Contact & Hours",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Gray900,
                    modifier = Modifier.padding(start = 20.dp, end = 20.dp, bottom = 16.dp)
                )

                ContactRow(icon = Icons.Filled.LocationOn, iconColor = Color(0xFF0D9488), label = "Address", value = p.address.ifBlank { "N/A" })
                HorizontalDivider(modifier = Modifier.padding(start = 56.dp), color = Gray100)
                ContactRow(icon = Icons.Filled.Phone, iconColor = Color(0xFF2563EB), label = "Phone", value = p.phoneNumber.ifBlank { "N/A" })
                HorizontalDivider(modifier = Modifier.padding(start = 56.dp), color = Gray100)
                ContactRow(icon = Icons.Filled.Email, iconColor = Color(0xFF7C3AED), label = "Email", value = p.email.ifBlank { "N/A" })
                HorizontalDivider(modifier = Modifier.padding(start = 56.dp), color = Gray100)

                // Hours Expandable Row
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { hoursExpanded = !hoursExpanded }
                            .padding(horizontal = 20.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(Color(0xFFF0FDF4), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(imageVector = Icons.Filled.Schedule, contentDescription = null, tint = Color(0xFF16A34A), modifier = Modifier.size(16.dp))
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Hours", style = MaterialTheme.typography.labelSmall, color = Gray500)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .background(if (p.isCurrentlyOpen) SuccessGreen else Color.Red, CircleShape)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (p.isCurrentlyOpen) "Open now" else "Closed now",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (p.isCurrentlyOpen) SuccessGreen else Color.Red
                                )
                                Text(" · ", color = Gray500)
                                Text(text = p.displayOperatingHours, style = MaterialTheme.typography.bodyMedium, color = Gray500, maxLines = 1)
                            }
                        }
                        Icon(
                            imageVector = if (hoursExpanded) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                            contentDescription = null,
                            tint = Gray300
                        )
                    }

                    AnimatedVisibility(
                        visible = hoursExpanded,
                        enter = fadeIn() + expandVertically(),
                        exit = fadeOut() + shrinkVertically()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp)
                                .padding(bottom = 12.dp)
                                .border(1.dp, Gray100, RoundedCornerShape(10.dp))
                                .background(Color(0xFFF9FAFB), RoundedCornerShape(10.dp))
                        ) {
                            val daysOfWeek = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
                            val calendar = Calendar.getInstance()
                            val todayIndex = (calendar.get(Calendar.DAY_OF_WEEK) + 5) % 7 // Monday = 0
                            val todayName = daysOfWeek[todayIndex]
                            val oh = p.parsedOperatingHours

                            daysOfWeek.forEachIndexed { index, day ->
                                val isToday = day == todayName
                                val isOpen = oh.is24Hours || oh.days.contains(day)

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(if (isToday) Color(0xFFF0FDFA) else Color.Transparent)
                                        .padding(horizontal = 12.dp, vertical = 10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = day,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = if (isToday) FontWeight.SemiBold else FontWeight.Normal,
                                        color = if (isToday) Color(0xFF0F766E) else Gray900
                                    )
                                    if (oh.is24Hours) {
                                        Text(
                                            text = "Open 24 hours",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = if (isToday) Color(0xFF0D9488) else Gray500
                                        )
                                    } else if (isOpen) {
                                        Text(
                                            text = "${oh.openTime} – ${oh.closeTime}",
                                            style = MaterialTheme.typography.bodyMedium,
                                            fontWeight = if (isToday) FontWeight.SemiBold else FontWeight.Normal,
                                            color = if (isToday) Color(0xFF0D9488) else Gray500
                                        )
                                    } else {
                                        Text(
                                            text = "Closed",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = if (isToday) Color.Red else Gray500.copy(alpha = 0.6f)
                                        )
                                    }
                                }
                                if (index < daysOfWeek.size - 1) {
                                    HorizontalDivider(color = Gray100)
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 4. Location Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(White)
                    .padding(20.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Location", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Gray900)
                    Text(String.format(Locale.US, "%.4f, %.4f", p.latitude, p.longitude), style = MaterialTheme.typography.labelSmall, color = Gray500)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        val uri = Uri.parse("google.navigation:q=${p.latitude},${p.longitude}&mode=d")
                        val intent = Intent(Intent.ACTION_VIEW, uri)
                        intent.setPackage("com.google.android.apps.maps")
                        if (intent.resolveActivity(context.packageManager) != null) {
                            context.startActivity(intent)
                        } else {
                            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://maps.google.com/?daddr=${p.latitude},${p.longitude}&travelmode=driving"))
                            context.startActivity(browserIntent)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Teal500, contentColor = White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(imageVector = Icons.Filled.Directions, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Get Directions", fontWeight = FontWeight.SemiBold)
                }
            }
            
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
fun BadgeView(label: String, color: Color) {
    Box(
        modifier = Modifier
            .background(color, RoundedCornerShape(20.dp))
            .padding(horizontal = 10.dp, vertical = 5.dp)
    ) {
        Text(
            text = label,
            color = White,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun ContactRow(icon: ImageVector, iconColor: Color, label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .background(iconColor.copy(alpha = 0.08f), RoundedCornerShape(10.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(16.dp))
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(label, style = MaterialTheme.typography.labelSmall, color = Gray500)
            Spacer(modifier = Modifier.height(2.dp))
            Text(value, style = MaterialTheme.typography.bodyMedium, color = Gray900)
        }
    }
}
