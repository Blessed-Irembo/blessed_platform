package com.blessedirembo.app.data.repository

import com.blessedirembo.app.data.model.UserProfile
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * UserRepository
 * Handles reading and writing user profiles in Firestore at /users/{uid}
 *
 * Role detection logic mirrors iOS FirebaseManager.fetchUserRole exactly:
 *   1. Check pharmacies collection by ownerId field (pharmacy owner wins)
 *   2. Check pharmacies by document ID (uid) as fallback
 *   3. Check users collection for user role
 *   4. Return null if not found in either (falls back to user in NavGraph)
 */
class UserRepository {

    private val db = FirebaseFirestore.getInstance()
    private val usersCollection = db.collection("users")
    private val pharmaciesCollection = db.collection("pharmacies")

    /**
     * Save a new user profile after sign-up.
     */
    suspend fun saveUserProfile(profile: UserProfile): Result<Unit> {
        return try {
            usersCollection.document(profile.uid).set(profile).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch an existing user profile to determine role and display info.
     */
    suspend fun getUserProfile(uid: String): Result<UserProfile> {
        return try {
            val doc = usersCollection.document(uid).get().await()
            val profile = doc.toObject(UserProfile::class.java)
                ?: return Result.failure(Exception("User profile not found"))
            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch user role - PHARMACY always wins over USER.
     *
     * Check order (mirrors iOS FirebaseManager.fetchUserRole):
     *   1. pharmacies collection by document ID (uid) — most common for app-registered owners
     *   2. pharmacies collection queried by ownerId field — for legacy/web-created accounts
     *   3. users collection by document ID (uid) — for regular users
     *
     * This ensures that if an account exists in BOTH collections (a pharmacy owner
     * who also has a user doc), they are correctly routed to the pharmacy dashboard.
     */
    suspend fun fetchUserRole(uid: String, email: String? = null, phone: String? = null): Result<String?> {
        return try {
            // 1. Check pharmacies by document ID (uid) first — fastest path
            val pharmacyDocById = pharmaciesCollection.document(uid).get().await()
            if (pharmacyDocById.exists() && pharmacyDocById.data?.isNotEmpty() == true) {
                return Result.success(com.blessedirembo.app.data.model.UserRole.PHARMACY_OWNER)
            }

            // 2. Check pharmacies by ownerId field (web/admin created accounts)
            val pharmacyByOwner = pharmaciesCollection
                .whereEqualTo("ownerId", uid)
                .limit(1)
                .get()
                .await()
            if (!pharmacyByOwner.isEmpty) {
                return Result.success(com.blessedirembo.app.data.model.UserRole.PHARMACY_OWNER)
            }

            // 3. Fallback: Check pharmacies by email if provided
            if (!email.isNullOrBlank()) {
                val pharmacyByEmail = pharmaciesCollection
                    .whereEqualTo("email", email)
                    .limit(1)
                    .get()
                    .await()
                if (!pharmacyByEmail.isEmpty) {
                    return Result.success(com.blessedirembo.app.data.model.UserRole.PHARMACY_OWNER)
                }
            }

            // 4. Fallback: Check pharmacies by phone if provided
            if (!phone.isNullOrBlank()) {
                val pharmacyByPhone = pharmaciesCollection
                    .whereEqualTo("phoneNumber", phone)
                    .limit(1)
                    .get()
                    .await()
                if (!pharmacyByPhone.isEmpty) {
                    return Result.success(com.blessedirembo.app.data.model.UserRole.PHARMACY_OWNER)
                }
            }

            // 5. Check users collection (regular user)
            val userDoc = usersCollection.document(uid).get().await()
            if (userDoc.exists() && userDoc.data?.isNotEmpty() == true) {
                val role = userDoc.getString("role")
                // If the user doc has role="pharmacy" treat as pharmacy owner too
                if (role == "pharmacy" || role == "pharmacy_owner") {
                    return Result.success(com.blessedirembo.app.data.model.UserRole.PHARMACY_OWNER)
                }
                return Result.success(com.blessedirembo.app.data.model.UserRole.USER)
            }

            // Not found in either — return null (caller will default to USER)
            Result.success(null)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Perform a partial update of a user's profile fields.
     */
    suspend fun updateUserDocument(uid: String, name: String, phone: String): Result<Unit> {
        return try {
            val updates = mapOf(
                "fullName" to name,
                "phone" to phone
            )
            usersCollection.document(uid).update(updates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Phone-number sign-in: look up the email associated with a given phone number.
     *
     * Mirrors iOS FirebaseManager.fetchEmailByPhone():
     *  1. Normalize the phone number to +250... format
     *  2. Look up in phone_to_email collection
     *  3. Fallback: generate synthetic email (phone@blessed-irembo.app)
     */
    suspend fun fetchEmailByPhone(phone: String): Result<String?> {
        return try {
            val normalised = normalizePhoneNumber(phone)

            // Try normalized form first
            val doc = db.collection("phone_to_email").document(normalised).get().await()
            if (doc.exists() && doc.data?.isNotEmpty() == true) {
                val email = doc.getString("email")
                if (!email.isNullOrBlank()) {
                    return Result.success(email)
                }
            }

            // Try original (non-normalized) form in case it was stored differently
            val rawDoc = db.collection("phone_to_email").document(phone.trim()).get().await()
            if (rawDoc.exists() && rawDoc.data?.isNotEmpty() == true) {
                val email = rawDoc.getString("email")
                if (!email.isNullOrBlank()) {
                    return Result.success(email)
                }
            }

            // Fallback: generate synthetic email (mirrors iOS fallback)
            val syntheticEmail = "${normalised.replace("+", "")}@blessed-irembo.app"
            Result.success(syntheticEmail)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Save the mapping from a phone number to an email to support phone-only login.
     * Stores both normalized and raw versions for maximum compatibility.
     */
    suspend fun savePhoneToEmailMapping(phone: String, email: String): Result<Unit> {
        return try {
            val normalised = normalizePhoneNumber(phone)
            val data = mapOf("email" to email)
            db.collection("phone_to_email").document(normalised).set(data).await()
            // Also save raw phone in case lookup uses non-normalized form
            if (normalised != phone.trim()) {
                db.collection("phone_to_email").document(phone.trim()).set(data).await()
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Normalize a Rwandan phone number to +250XXXXXXXXX format.
     * Mirrors iOS User.normalizePhoneNumber().
     *
     * Examples:
     *   "0788123456"    → "+250788123456"
     *   "250788123456"  → "+250788123456"
     *   "+250788123456" → "+250788123456"
     *   "788123456"     → "+250788123456"
     */
    fun normalizePhoneNumber(phone: String): String {
        val digits = phone.trim().replace(Regex("[\\s\\-()]"), "")
        return when {
            digits.startsWith("+250") -> digits
            digits.startsWith("250")  -> "+$digits"
            digits.startsWith("0")    -> "+250${digits.drop(1)}"
            digits.startsWith("+")    -> digits
            else                      -> "+250$digits"
        }
    }
}
