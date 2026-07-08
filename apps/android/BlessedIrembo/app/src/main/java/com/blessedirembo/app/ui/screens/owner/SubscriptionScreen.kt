package com.blessedirembo.app.ui.screens.owner

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.HourglassBottom
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.auth.AuthViewModel
import com.blessedirembo.app.data.model.SubscriptionPlan
import com.blessedirembo.app.data.model.SubscriptionRequest
import com.blessedirembo.app.data.model.SubscriptionStatus
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.PharmacyViewModel
import com.blessedirembo.app.ui.viewmodel.SubscriptionViewModel
import com.blessedirembo.app.util.t
import java.text.SimpleDateFormat
import java.util.Locale

private val IosBackground = Color(0xFFF2F2F7)

@Composable
fun SubscriptionScreen(
    onBackClick: () -> Unit = {},
    modifier: Modifier = Modifier,
    authViewModel: AuthViewModel = viewModel(),
    pharmacyViewModel: PharmacyViewModel = viewModel(),
    subscriptionViewModel: SubscriptionViewModel = viewModel()
) {
    val scrollState = rememberScrollState()
    val context = LocalContext.current

    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()
    val status by subscriptionViewModel.status.collectAsState()
    val pendingRequest by subscriptionViewModel.pendingRequest.collectAsState()
    val isLoading by subscriptionViewModel.isLoading.collectAsState()
    val isUploading by subscriptionViewModel.isUploading.collectAsState()
    val uploadProgress by subscriptionViewModel.uploadProgress.collectAsState()
    val errorMessage by subscriptionViewModel.errorMessage.collectAsState()
    val successMessage by subscriptionViewModel.successMessage.collectAsState()

    var expandedPlanId by remember { mutableStateOf<String?>(null) }
    var showCancelDialog by remember { mutableStateOf(false) }

    // Image picker for receipt upload
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null && pharmacy != null) {
            val bytes = context.contentResolver.openInputStream(uri)?.readBytes()
            if (bytes != null) {
                subscriptionViewModel.uploadReceipt(bytes, pharmacy!!.id, pharmacy!!.name)
            }
        }
    }

    LaunchedEffect(Unit) {
        val uid = authViewModel.currentUser?.uid ?: return@LaunchedEffect
        pharmacyViewModel.loadPharmacyByOwnerId(uid)
    }

    LaunchedEffect(pharmacy) {
        val p = pharmacy ?: return@LaunchedEffect
        subscriptionViewModel.calculateStatus(p)
        subscriptionViewModel.startPendingRequestListener(p.id)
    }

    DisposableEffect(Unit) {
        onDispose { subscriptionViewModel.stopListener() }
    }

    // Show error/success dialogs
    if (errorMessage != null) {
        AlertDialog(
            onDismissRequest = { subscriptionViewModel.clearMessages() },
            confirmButton = {
                TextButton(onClick = { subscriptionViewModel.clearMessages() }) { Text("OK") }
            },
            title = { Text(t("common.error")) },
            text = { Text(errorMessage ?: "") }
        )
    }
    if (successMessage != null) {
        AlertDialog(
            onDismissRequest = { subscriptionViewModel.clearMessages() },
            confirmButton = {
                TextButton(onClick = { subscriptionViewModel.clearMessages() }) { Text("OK") }
            },
            title = { Text(t("common.success")) },
            text = { Text(successMessage ?: "") }
        )
    }
    if (showCancelDialog) {
        AlertDialog(
            onDismissRequest = { showCancelDialog = false },
            title = { Text(t("subscription.cancelDialogTitle")) },
            text = { Text(t("subscription.cancelDialogBody")) },
            confirmButton = {
                TextButton(
                    onClick = {
                        showCancelDialog = false
                        subscriptionViewModel.cancelRequest()
                    }
                ) { Text(t("subscription.cancelRequestBtn"), color = Color.Red) }
            },
            dismissButton = {
                TextButton(onClick = { showCancelDialog = false }) { Text(t("subscription.keepRequestBtn")) }
            }
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(IosBackground)
            .verticalScroll(scrollState)
            .statusBarsPadding()
            .padding(horizontal = 16.dp)
            .padding(top = 16.dp)
    ) {
        // ── Status Banner ────────────────────────────────────────────────────
        StatusBanner(status = status)

        Spacer(modifier = Modifier.height(20.dp))

        // ── Pending State or Plan Selection ─────────────────────────────────
        if (pendingRequest != null) {
            PendingView(
                request = pendingRequest!!,
                isLoading = isLoading,
                isUploading = isUploading,
                uploadProgress = uploadProgress,
                onUploadReceipt = { imagePickerLauncher.launch("image/*") },
                onCancelRequest = { showCancelDialog = true }
            )
        } else {
            PlanSelectionSection(
                expandedPlanId = expandedPlanId,
                onExpandPlan = { planId ->
                    expandedPlanId = if (expandedPlanId == planId) null else planId
                },
                isLoading = isLoading,
                onSubmitIntent = { plan ->
                    val p = pharmacy ?: return@PlanSelectionSection
                    subscriptionViewModel.submitIntent(plan, p.id, p.name)
                },
                context = context
            )
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}

// ── Status Banner ───────────────────────────────────────────────────────────────
@Composable
private fun StatusBanner(status: SubscriptionStatus) {
    val (color, icon) = when (status) {
        is SubscriptionStatus.FreeTrial -> Color(0xFF3B82F6) to Icons.Filled.Timer
        is SubscriptionStatus.Premium -> Teal500 to Icons.Filled.Star
        is SubscriptionStatus.Expired -> Color(0xFFEF4444) to Icons.Filled.Error
        is SubscriptionStatus.Unknown -> Color(0xFF9CA3AF) to Icons.Filled.Info
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(color.copy(alpha = 0.08f), RoundedCornerShape(10.dp))
            .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(color.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
        }
        Column {
            Text(
                text = status.displayTitleLoc(),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = Gray900
            )
            Text(
                text = status.displaySubtitleLoc(),
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500
            )
        }
    }
}

// ── Plan Selection Section ──────────────────────────────────────────────────────
@Composable
private fun PlanSelectionSection(
    expandedPlanId: String?,
    onExpandPlan: (String) -> Unit,
    isLoading: Boolean,
    onSubmitIntent: (SubscriptionPlan) -> Unit,
    context: Context
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(
            text = t("subscription.choosePlan"),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = Gray900
        )

        SubscriptionPlan.all.forEach { plan ->
            PlanCard(
                plan = plan,
                isExpanded = expandedPlanId == plan.id,
                onToggle = { onExpandPlan(plan.id) },
                isLoading = isLoading,
                onSubmitIntent = onSubmitIntent,
                context = context
            )
        }
    }
}

@Composable
private fun PlanCard(
    plan: SubscriptionPlan,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    isLoading: Boolean,
    onSubmitIntent: (SubscriptionPlan) -> Unit,
    context: Context
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(White, RoundedCornerShape(10.dp))
            .clip(RoundedCornerShape(10.dp))
    ) {
        // Popular badge
        if (plan.isPopular) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Teal500)
                    .padding(vertical = 7.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = t("subscription.mostPopular"),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = White,
                    letterSpacing = 1.sp
                )
            }
        }

        // Card header (tappable row)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(White)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = t("plan.${plan.id}.name"),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Gray900
                )
                Text(
                    text = t("plan.${plan.id}.label"),
                    style = MaterialTheme.typography.bodyMedium,
                    color = Gray500
                )
            }
            // Chevron
            val chevronIcon = if (isExpanded) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown
            TextButton(onClick = onToggle) {
                Icon(
                    imageVector = chevronIcon,
                    contentDescription = if (isExpanded) "Collapse" else "Expand",
                    tint = Teal500
                )
            }
        }

        // Expanded content
        AnimatedVisibility(
            visible = isExpanded,
            enter = expandVertically(animationSpec = spring()),
            exit = shrinkVertically(animationSpec = spring())
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(White)
            ) {
                HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
                ExpandedPlanContent(
                    plan = plan,
                    isLoading = isLoading,
                    onSubmitIntent = onSubmitIntent,
                    context = context
                )
            }
        }
    }
}

@Composable
private fun ExpandedPlanContent(
    plan: SubscriptionPlan,
    isLoading: Boolean,
    onSubmitIntent: (SubscriptionPlan) -> Unit,
    context: Context
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Step 1
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(22.dp)
                        .clip(CircleShape)
                        .background(Teal500),
                    contentAlignment = Alignment.Center
                ) {
                    Text("1", style = MaterialTheme.typography.labelSmall, color = White, fontWeight = FontWeight.Bold)
                }
                Text(
                    text = t("subscription.step1"),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Teal500
                )
            }

            Text(
                text = t("subscription.step1Desc").format(plan.amount.formatRwf()),
                style = MaterialTheme.typography.bodySmall,
                color = Gray500
            )

            // USSD Code block
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = plan.ussdCode,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = Teal500,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Teal500.copy(alpha = 0.08f), RoundedCornerShape(10.dp))
                        .border(1.dp, Teal500.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                        .padding(14.dp)
                )
                val codeCopiedMsg = t("subscription.codeCopied")
                TextButton(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("USSD Code", plan.ussdCode))
                        Toast.makeText(context, codeCopiedMsg, Toast.LENGTH_SHORT).show()
                    }
                ) {
                    Icon(Icons.Filled.ContentCopy, contentDescription = null, tint = Teal500, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(t("subscription.copyCode"), color = Teal500, style = MaterialTheme.typography.labelMedium)
                }

                // Orange confirmation hint
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFFF9800).copy(alpha = 0.07f), RoundedCornerShape(8.dp))
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(Icons.Filled.Info, contentDescription = null, tint = Color(0xFFFF9800), modifier = Modifier.size(16.dp))
                    Text(
                        text = t("subscription.paymentPrompt").format(plan.amount.formatRwf()),
                        style = MaterialTheme.typography.labelSmall,
                        color = Gray500
                    )
                }
            }

            // Important note
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Gray100, RoundedCornerShape(8.dp))
                    .padding(10.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = t("subscription.important"),
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = Gray500
                )
                Text(
                    text = t("subscription.step1Note"),
                    style = MaterialTheme.typography.labelSmall,
                    color = Gray500
                )
            }
        }

        // "I Have Paid" button
        Button(
            onClick = { onSubmitIntent(plan) },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Teal500),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                Spacer(Modifier.width(8.dp))
                Text(t("common.submitting"), fontWeight = FontWeight.SemiBold)
            } else {
                Text(t("subscription.havePaid"), fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

// ── Pending Request View ────────────────────────────────────────────────────────
@Composable
private fun PendingView(
    request: SubscriptionRequest,
    isLoading: Boolean,
    isUploading: Boolean,
    uploadProgress: Float,
    onUploadReceipt: () -> Unit,
    onCancelRequest: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        // Pending header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFFF9800).copy(alpha = 0.08f), RoundedCornerShape(12.dp))
                .border(1.dp, Color(0xFFFF9800).copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                .padding(14.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.Top
        ) {
            Icon(
                Icons.Filled.HourglassBottom,
                contentDescription = null,
                tint = Color(0xFFFF9800),
                modifier = Modifier.size(24.dp)
            )
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = t("subscription.pendingTitle"),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = Gray900
                )
                Text(
                    text = t("subscription.pendingDesc").format(t("plan.${request.planId}.name")),
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray500
                )
            }
        }

        // Plan summary
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(White, RoundedCornerShape(12.dp))
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            PendingInfoRow(t("subscription.planLabel"), t("plan.${request.planId}.name"))
            PendingInfoRow(t("subscription.amountLabel"), "${request.amount.formatRwf()} RWF")
            val dateStr = SimpleDateFormat("d MMM yyyy, HH:mm", Locale.getDefault()).format(request.createdAt)
            PendingInfoRow(t("subscription.submittedLabel"), dateStr)
            if (request.receiptUrl.isNotEmpty()) {
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(t("subscription.receiptLabel"), style = MaterialTheme.typography.bodyMedium, color = Gray500, modifier = Modifier.width(80.dp))
                    Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Color(0xFF22C55E), modifier = Modifier.size(16.dp))
                    Text(t("subscription.uploadedLabel"), style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium, color = Color(0xFF22C55E))
                }
            }
        }

        // Step 2: Receipt upload
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(White, RoundedCornerShape(12.dp))
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier.size(22.dp).clip(CircleShape).background(Teal500),
                    contentAlignment = Alignment.Center
                ) {
                    Text("2", style = MaterialTheme.typography.labelSmall, color = White, fontWeight = FontWeight.Bold)
                }
                Text(
                    text = t("subscription.step2"),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Teal500
                )
            }
            Text(
                text = t("subscription.step2Desc"),
                style = MaterialTheme.typography.bodySmall,
                color = Gray500
            )

            if (isUploading) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    LinearProgressIndicator(
                        progress = { uploadProgress },
                        modifier = Modifier.fillMaxWidth(),
                        color = Teal500
                    )
                    Text(t("common.uploading") + " ${(uploadProgress * 100).toInt()}%", style = MaterialTheme.typography.labelSmall, color = Gray500)
                }
            } else {
                OutlinedButton(
                    onClick = onUploadReceipt,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, Teal500.copy(alpha = 0.4f)),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Teal500)
                ) {
                    Icon(Icons.Filled.AddPhotoAlternate, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(t("subscription.selectScreenshot"), fontWeight = FontWeight.Medium)
                }
            }
        }

        // Cancel request
        OutlinedButton(
            onClick = onCancelRequest,
            modifier = Modifier.fillMaxWidth().height(48.dp),
            shape = RoundedCornerShape(10.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color.Red.copy(alpha = 0.4f)),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.Red),
            enabled = !isLoading
        ) {
            Icon(Icons.Filled.Cancel, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text(t("subscription.cancelPendingBtn"))
        }
    }
}

@Composable
private fun PendingInfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = Gray500, modifier = Modifier.width(80.dp))
        Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium, color = Gray900)
    }
}

private fun Int.formatRwf(): String {
    return String.format("%,d", this).replace(',', ',')
}

@Composable
private fun SubscriptionStatus.displayTitleLoc(): String {
    return when (this) {
        is SubscriptionStatus.FreeTrial -> if (daysRemaining > 0) t("subscription.status.freeTrial") else t("subscription.status.freeTrialEnding")
        is SubscriptionStatus.Premium -> t("subscription.status.premium")
        is SubscriptionStatus.Expired -> t("subscription.status.expired")
        is SubscriptionStatus.Unknown -> t("subscription.status.loading")
    }
}

@Composable
private fun SubscriptionStatus.displaySubtitleLoc(): String {
    return when (this) {
        is SubscriptionStatus.FreeTrial -> if (daysRemaining > 1) t("subscription.status.daysRemaining").format(daysRemaining) else t("subscription.status.dayRemaining")
        is SubscriptionStatus.Premium -> {
            val fmt = java.text.SimpleDateFormat("d MMM yyyy", java.util.Locale.getDefault())
            t("subscription.status.activeUntil").format(fmt.format(expiresOn))
        }
        is SubscriptionStatus.Expired -> t("subscription.status.pleaseRenew")
        is SubscriptionStatus.Unknown -> ""
    }
}
