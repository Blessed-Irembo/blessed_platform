package com.blessedirembo.app.ui.screens.owner

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.outlined.Business
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.auth.AuthViewModel
import com.blessedirembo.app.data.repository.PharmacyRepository
import com.blessedirembo.app.ui.components.CustomTextField
import com.blessedirembo.app.ui.components.PrimaryButton
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.PharmacyViewModel
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

/**
 * Pharmacy Edit Profile Screen
 * Mirrors iOS PharmacyProfileSettingsView:
 *  • Shows current info in read-only mode
 *  • Tap "Edit Profile" to unlock fields
 *  • Save changes write to Firestore (name, email, phone) and optionally updates password
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PharmacyEditProfileScreen(
    onBackClick: () -> Unit,
    authViewModel: AuthViewModel = viewModel(),
    pharmacyViewModel: PharmacyViewModel = viewModel()
) {
    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }
    val repo = remember { PharmacyRepository() }

    // ── Mode ──
    var isEditing by remember { mutableStateOf(false) }

    // ── Edit form state ──
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }

    var isSaving by remember { mutableStateOf(false) }

    // Load values from pharmacy into edit form
    LaunchedEffect(Unit) {
        val uid = authViewModel.currentUser?.uid
        if (uid != null && pharmacy == null) {
            pharmacyViewModel.loadPharmacyByOwnerId(uid)
        }
    }

    fun loadCurrentValues() {
        pharmacy?.let { p ->
            name = p.name
            email = p.email
            phone = p.phoneNumber.ifBlank { p.phone }
        }
    }

    LaunchedEffect(pharmacy) { loadCurrentValues() }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Edit Profile", fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) { data -> Snackbar(snackbarData = data) } },
        containerColor = Gray100
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            // ── Current Information Card ──
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = White)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(0.dp)) {
                    Text("Current Information",
                        style = MaterialTheme.typography.labelMedium,
                        color = Gray500,
                        modifier = Modifier.padding(bottom = 12.dp))

                    InfoRow(
                        icon = Icons.Outlined.Business,
                        iconColor = Teal500,
                        label = "Pharmacy Name",
                        value = pharmacy?.name?.ifBlank { "Not set" } ?: "Not set"
                    )
                    HorizontalDivider(color = Gray100, modifier = Modifier.padding(vertical = 8.dp))
                    InfoRow(
                        icon = Icons.Outlined.Email,
                        iconColor = EditBlue,
                        label = "Email",
                        value = pharmacy?.email?.ifBlank { "Not set" } ?: "Not set"
                    )
                    HorizontalDivider(color = Gray100, modifier = Modifier.padding(vertical = 8.dp))
                    InfoRow(
                        icon = Icons.Outlined.Phone,
                        iconColor = StaffGreen,
                        label = "Phone Number",
                        value = pharmacy?.phoneNumber?.ifBlank { pharmacy?.phone }?.ifBlank { "Not set" } ?: "Not set"
                    )

                    if (!isEditing) {
                        Spacer(Modifier.height(12.dp))
                        TextButton(
                            onClick = { isEditing = true; loadCurrentValues() },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Edit Profile", color = Teal500, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            // ── Edit Fields (visible when editing) ──
            if (isEditing) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = White)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text("Edit Details",
                            style = MaterialTheme.typography.labelMedium,
                            color = Gray500)

                        CustomTextField(
                            value = name,
                            onValueChange = { name = it },
                            placeholder = "Pharmacy Name",
                            leadingIcon = Icons.Outlined.Business
                        )
                        CustomTextField(
                            value = email,
                            onValueChange = { email = it },
                            placeholder = "Email Address",
                            leadingIcon = Icons.Outlined.Email,
                            keyboardType = KeyboardType.Email
                        )
                        CustomTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            placeholder = "Phone Number",
                            leadingIcon = Icons.Outlined.Phone,
                            keyboardType = KeyboardType.Phone
                        )

                        TextButton(
                            onClick = { isEditing = false; loadCurrentValues(); newPassword = "" },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Cancel", color = Gray500)
                        }
                    }
                }

                // ── Security (optional password change) ──
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = White)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("Security (Optional)",
                            style = MaterialTheme.typography.labelMedium,
                            color = Gray500)
                        CustomTextField(
                            value = newPassword,
                            onValueChange = { newPassword = it },
                            placeholder = "New password (leave blank to keep current)",
                            leadingIcon = Icons.Outlined.Lock,
                            isPassword = true
                        )
                        Text("Leave blank to keep your current password.",
                            style = MaterialTheme.typography.labelSmall,
                            color = Gray500)
                    }
                }

                // ── Save Button ──
                PrimaryButton(
                    text = "Save Changes",
                    onClick = {
                        val pharmId = pharmacy?.id
                        if (pharmId.isNullOrBlank() || name.isBlank()) return@PrimaryButton
                        scope.launch {
                            isSaving = true
                            val result = repo.updatePharmacyProfile(pharmId, name.trim(), email.trim(), phone.trim())
                            if (result.isSuccess) {
                                // Optional password update
                                if (newPassword.isNotBlank()) {
                                    FirebaseAuth.getInstance().currentUser?.updatePassword(newPassword)
                                }
                                snackbarHostState.showSnackbar("Profile updated successfully ✓")
                                pharmacyViewModel.loadPharmacyByOwnerId(authViewModel.currentUser?.uid ?: "")
                                isEditing = false
                                newPassword = ""
                            } else {
                                snackbarHostState.showSnackbar("Failed: ${result.exceptionOrNull()?.message}")
                            }
                            isSaving = false
                        }
                    },
                    enabled = !isSaving && name.isNotBlank(),
                    isLoading = isSaving
                )
            }
        }
    }
}

@Composable
private fun InfoRow(icon: ImageVector, iconColor: Color, label: String, value: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Icon(icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(20.dp))
        Column {
            Text(label, style = MaterialTheme.typography.labelSmall, color = Gray500)
            Text(value, style = MaterialTheme.typography.bodyMedium, color = Gray900)
        }
    }
}
