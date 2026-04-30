package com.blessedirembo.app.ui.screens.owner

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import android.widget.Toast

/**
 * Subscription Screen — mirrors iOS PharmacySubscriptionView exactly.
 *
 * Three tiers:
 *   1. Current Plan: Basic (Free Forever)
 *   2. Professional: RWF 25,000/month — MOST POPULAR banner
 *   3. Enterprise: Contact Sales
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SubscriptionScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
    authViewModel: com.blessedirembo.app.auth.AuthViewModel = viewModel()
) {
    val scrollState = rememberScrollState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val storageRepository = remember { com.blessedirembo.app.data.repository.StorageRepository() }
    var isUploading by remember { mutableStateOf(false) }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: android.net.Uri? ->
        if (uri != null) {
            val pharmacyId = authViewModel.currentUser?.uid ?: return@rememberLauncherForActivityResult
            scope.launch {
                isUploading = true
                val result = storageRepository.uploadReceipt(uri, pharmacyId)
                isUploading = false
                if (result.isSuccess) {
                    Toast.makeText(context, "Receipt uploaded successfully. Awaiting review.", Toast.LENGTH_LONG).show()
                    
                    // Trigger admin alert
                    val db = com.google.firebase.firestore.FirebaseFirestore.getInstance()
                    val notif = hashMapOf(
                        "recipientId" to "ADMIN",
                        "title" to "Receipt Uploaded",
                        "message" to "Pharmacy $pharmacyId uploaded a payment receipt for review.",
                        "isRead" to false,
                        "createdAt" to com.google.firebase.firestore.FieldValue.serverTimestamp()
                    )
                    db.collection("notifications").add(notif)
                } else {
                    Toast.makeText(context, "Upload failed: ${result.exceptionOrNull()?.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        "Subscription",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = White
                )
            )
        },
        containerColor = Gray100
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            // ── Header — mirrors iOS title + subtitle
            Text(
                text = "Upgrade Your Plan",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = Gray900
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Choose the best plan for your pharmacy business needs",
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Current Plan section — mirrors iOS "Current Plan" card
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Current Plan",
                    style = MaterialTheme.typography.titleSmall,
                    color = Gray500
                )
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Basic",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Teal500
                            )
                            Text(
                                text = "Free Forever",
                                style = MaterialTheme.typography.bodySmall,
                                color = Gray500
                            )
                        }
                        Icon(
                            imageVector = Icons.Filled.CheckCircle,
                            contentDescription = "Active",
                            tint = SuccessGreen,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── PRO Plan card — mirrors iOS "MOST POPULAR" banner + features
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = White),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column {
                    // "MOST POPULAR" banner — matches iOS Text over primaryTeal background
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                color = Teal500,
                                shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
                            )
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "MOST POPULAR",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = White,
                            letterSpacing = 1.sp
                        )
                    }

                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Professional",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = Gray900
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Price row — mirrors iOS HStack(alignment: .lastTextBaseline)
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(
                                text = "RWF 25,000",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = Gray900,
                                fontSize = 28.sp
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "/month",
                                style = MaterialTheme.typography.bodyLarge,
                                color = Gray500
                            )
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Feature list — mirrors iOS FeatureRow list
                        val features = listOf(
                            "Unlimited Inquiries",
                            "Advanced Analytics",
                            "Priority Support",
                            "Verified Badge",
                            "Featured on Search"
                        )
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            features.forEach { feature ->
                                FeatureRow(text = feature)
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // "Upgrade Now" button
                        Button(
                            onClick = { launcher.launch("image/*") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Teal500),
                            enabled = !isUploading
                        ) {
                            Text(
                                text = if (isUploading) "Uploading..." else "Upload Payment Receipt",
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Enterprise Plan — mirrors iOS enterprise section
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Enterprise",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Gray900
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Contact Us for pricing",
                        style = MaterialTheme.typography.titleSmall,
                        color = Gray500
                    )
                    Spacer(modifier = Modifier.height(20.dp))

                    // "Contact Sales" outlined button
                    OutlinedButton(
                        onClick = { /* TODO: contact sales */ },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(2.dp, Teal500),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Teal500)
                    ) {
                        Text(
                            text = "Contact Sales",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

/**
 * Single feature row — mirrors iOS FeatureRow with checkmark.circle.fill + text.
 */
@Composable
private fun FeatureRow(text: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Icon(
            imageVector = Icons.Filled.CheckCircle,
            contentDescription = null,
            tint = SuccessGreen,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = Gray500
        )
    }
}
