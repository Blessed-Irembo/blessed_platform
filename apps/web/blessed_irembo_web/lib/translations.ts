export type Language = 'en' | 'rw';

export const translations = {
  en: {
    nav: {
      home: "Home",
      findPharmacies: "Find Pharmacies",
      login: "Login",
      getStarted: "Get Started",
      logout: "Log out",
      profile: "My Profile",
      settings: "Settings",
      downloadApp: "Download App",
    },
    hero: {
      title: "Find Trusted Pharmacies Anywhere in Rwanda",
      subtitle: "Operating under Blessed HealthConnect Ltd, Blessed Irembo connects you with verified pharmacies nationwide. Search by location, check availability, and get the medication you need, when you need it.",
      cta_find: "Find Pharmacies",
      cta_register: "Register Pharmacy",
    },
    features: {
      title: "Why Choose Blessed Irembo?",
      subtitle: "The most comprehensive pharmacy locator platform in Rwanda",
      stats: {
        pharmacies: "Registered Pharmacies",
        users: "Active Users",
        cities: "Cities/Districts Covered",
        support: "Support Available"
      },
      f1: {
        title: "Nationwide Coverage",
        desc: "Access pharmacies across all provinces and districts in Rwanda"
      },
      f2: {
        title: "Verified Pharmacies",
        desc: "All pharmacies are licensed and verified by health authorities"
      },
      f3: {
        title: "24/7 Availability",
        desc: "Find pharmacies with emergency services and round-the-clock access"
      },
      f4: {
        title: "Quality Assured",
        desc: "Connect with trusted pharmacies committed to quality healthcare"
      }
    },
    owners: {
      title: "For Pharmacy Owners",
      subtitle: "Join Rwanda's leading pharmacy network and connect with customers looking for your services.",
      b1: { title: "3-Month Free Trial", desc: "Get started with no upfront costs" },
      b2: { title: "Increased Visibility", desc: "Reach customers across Rwanda" },
      b3: { title: "Direct Customer Inquiries", desc: "Manage all customer questions in one place" },
      cta: "Register Your Pharmacy"
    },
    cta: {
      title: "Ready to find the medication you need?",
      subtitle: "Search verified pharmacies near you and check availability in real-time.",
      button: "Find a Pharmacy Now"
    },
    footer: {
      desc: "Connecting Rwandans with trusted pharmacies nationwide. Find medication quickly and easily.",
      solution: "A healthcare digital solution by",
      quickLinks: "Quick Links",
      contact: "Contact",
      rights: "All rights reserved.",
      operatedBy: "Operated by",
      links: {
        privacy: "Privacy Policy",
        terms: "Terms and Conditions",
        help: "Help & Support",
        about: "About Us",
        forPharmacies: "For Pharmacies"
      }
    },
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to your account to continue",
      emailLabel: "Email Address or Phone Number",
      emailPlaceholder: "name@example.com or +250 788...",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot password?",
      signInButton: "Sign In",
      signingIn: "Signing in...",
      noAccount: "Don't have an account?",
      getStarted: "Get started",
      errors: {
        identifierRequired: "Email Address or Phone Number is required",
        passwordMinLength: "Password must be at least 6 characters",
        invalidCredentials: "Invalid email or password. Please try again.",
        tooManyRequests: "Too many failed attempts. Please try again later.",
        accountDisabled: "This account has been disabled. Please contact support.",
        generic: "Something went wrong. Please try again."
      }
    },
    signup: {
      title: "Sign Up",
      subtitle: "Create your account to get started",
      successTitle: "Account Created!",
      successDesc: "Your account has been created successfully. Please sign in to continue.",
      loginLink: "Go to Login",
      fullNameLabel: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+250 788 123 456",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Create secure password (min. 6 characters)",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Re-enter your password",
      acceptTerms: "I accept the",
      termsLink: "Terms & Conditions",
      submitButton: "Sign Up",
      submitting: "Signing Up...",
      alreadyAccount: "Already have an account?",
      signIn: "Sign In",
      errors: {
        fullNameRequired: "Full name is required",
        emailRequired: "Email is required",
        emailInvalid: "Email is invalid",
        phoneRequired: "Phone number is required",
        passwordRequired: "Password is required",
        passwordMinLength: "Password must be at least 6 characters",
        passwordsMismatch: "Passwords do not match",
        termsRequired: "You must accept the terms and conditions",
        emailInUse: "An account with this email already exists. Try logging in.",
        weakPassword: "Password is too weak. Use at least 6 characters.",
        invalidEmail: "Please enter a valid email address.",
        generic: "Something went wrong. Please try again."
      }
    },
    pharmacies: {
      title: "Pharmacies",
      subtitle: "Find and connect with licensed pharmacies across Rwanda.",
      searchPlaceholder: "Search by name or address...",
      allDistricts: "All Districts",
      districts: {
        kigali: "Kigali City",
        northern: "Northern Province",
        southern: "Southern Province",
        eastern: "Eastern Province",
        western: "Western Province"
      },
      openNow: "Open Now",
      nearMe: "Near Me",
      locating: "Locating...",
      locationDenied: "Location permission denied. Please enable it in your browser settings.",
      locationUnavailable: "Your location is currently unavailable.",
      locationUnable: "Unable to retrieve your location.",
      foundCount: "Found",
      pharmacySingle: "pharmacy",
      pharmacyPlural: "pharmacies",
      open: "Open",
      closed: "Closed",
      open24Hours: "Open 24/7",
      viewDetails: "View Details",
      noPharmacies: "No pharmacies found",
      adjustFilters: "Try adjusting your search or filters to find what you're looking for.",
      operatingHours: "Operating Hours",
      call: "Call",
      whatsapp: "WhatsApp"
    },
    common: {
      loading: "Loading...",
      search: "Search",
      poweredBy: "Powered by",
    },
    pharmacyDetail: {
      back: "Back",
      callPharmacy: "Call Pharmacy",
      chatWhatsApp: "Chat on WhatsApp",
      address: "Address",
      phone: "Phone",
      email: "Email",
      hours: "Hours",
      openNow: "Open now",
      closedNow: "Closed now",
      hoursNotSpecified: "Hours not specified",
      location: "Location",
      getDirections: "Get Directions",
      gettingLocation: "Getting your location...",
      calculatingRoute: "Calculating route...",
      duration: "Duration",
      distance: "Distance",
      verified: "Verified",
      available247: "24/7 Available",
      premiumMember: "Premium Member",
      notFound: "Pharmacy Not Found",
      notFoundDesc: "The pharmacy you're looking for doesn't exist.",
      defaultDescription: "A verified pharmacy on Blessed Irembo.",
      backToPharmacies: "Back to Pharmacies",
      days: {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday"
      }
    },
    profile: {
      title: "My Profile",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      notProvided: "Not provided",
      backToPharmacies: "Back to Pharmacies",
      settings: "Settings",
    },
    settings: {
      title: "Account Settings",
      profile: {
        title: "Profile Information",
        subtitle: "Update your name and phone number",
        fullName: "Full Name",
        fullNamePlaceholder: "Your full name",
        phone: "Phone Number",
        phonePlaceholder: "+250 7XX XXX XXX",
        email: "Email Address",
        emailLocked: "Email cannot be changed here.",
        save: "Save Profile",
        saving: "Saving...",
        success: "Profile updated successfully.",
        error: "Failed to update profile. Please try again."
      },
      password: {
        title: "Change Password",
        subtitle: "Update your account password",
        current: "Current Password",
        currentPlaceholder: "Enter current password",
        new: "New Password",
        newPlaceholder: "At least 6 characters",
        confirm: "Confirm New Password",
        confirmPlaceholder: "Repeat new password",
        update: "Update Password",
        updating: "Updating...",
        success: "Password updated successfully.",
        errorMinLength: "New password must be at least 6 characters.",
        errorMismatch: "Passwords do not match.",
        errorIncorrect: "Current password is incorrect.",
        errorGeneric: "Something went wrong. Please try again."
      },
      notifications: {
        title: "Notifications",
        subtitle: "Manage how we contact you",
        push: "Push Notifications",
        pushDesc: "Receive alerts on your device",
        email: "Email Alerts",
        emailDesc: "Updates and promotional emails"
      },
      privacy: {
        title: "Location & Privacy",
        subtitle: "Control your data and location access",
        location: "Location Services",
        locationDesc: "Allow app to use your precise location",
        analytics: "Analytics & Sharing",
        analyticsDesc: "Help improve the platform with usage data"
      },
      appearance: {
        title: "Appearance",
        subtitle: "Customize your app interface",
        darkMode: "Dark Mode",
        darkModeDesc: "Switch between light and dark themes"
      },
      delete: {
        title: "Delete Account",
        subtitle: "Permanently remove your account and all data",
        warning: "Once deleted, your account cannot be recovered.",
        confirmPrompt: "Please enter your password to confirm account deletion.",
        passwordPlaceholder: "Enter your password",
        button: "Delete Account",
        cancel: "Cancel",
        confirm: "Confirm Delete",
        deleting: "Deleting...",
        errorIncorrect: "Password is incorrect.",
        errorGeneric: "Something went wrong. Please try again."
      }
    },
    about: {
      title: "About Blessed Irembo",
      subtitle: "A digital healthcare bridge connecting Rwandans to trusted, licensed pharmacies across the country — quickly, easily, and reliably.",
      mission: {
        title: "Our Mission",
        p1: "At Blessed Irembo, we believe that finding medication and healthcare services should never be a challenge. Our mission is to make pharmacy discovery effortless for every Rwandan citizen, while empowering local pharmacies to grow their visibility and serve their communities better.",
        p2: "We are passionate about bridging the gap between healthcare providers and the people who need them most — starting with pharmacies and expanding into a full healthcare digital ecosystem."
      },
      stats: {
        licensed: "Licensed Pharmacies",
        verified: "NPC( national pharmacy council) Verified",
        districts: "Districts Covered",
        access: "Platform Access"
      },
      story: {
        title: "Our Story",
        p1: "Blessed Irembo was born out of a simple but powerful observation: in Rwanda, finding a pharmacy — especially one that has the specific medication you need — can be a time-consuming and frustrating experience. People often visit multiple pharmacies only to find that what they need is out of stock or unavailable.",
        p2: "Our founders, driven by a commitment to improving healthcare access in Rwanda, set out to build a platform that would serve as a comprehensive directory of all licensed pharmacies, verified against the Rwanda NPC( national pharmacy council)'s official records, and presented in an easy-to-use digital format accessible from any smartphone or computer.",
        p3: "Today, Blessed Irembo is operated by Blessed HealthConnect Ltd, a Rwandan company dedicated to leveraging technology for better healthcare outcomes across the country."
      },
      cta: {
        title: "Join Our Growing Community",
        subtitle: "Whether you are a patient looking for a pharmacy or a pharmacy owner wanting to grow — Blessed Irembo is for you.",
        find: "Find a Pharmacy",
        register: "Register Your Pharmacy"
      }
    },
    help: {
      title: "Help & Support",
      subtitle: "Find answers to common questions below. If you still need help, our team is always happy to assist!",
      faqs: [
        {
          question: "How do I find a pharmacy near me?",
          answer: "Visit the home page and use the search bar or the interactive map to explore pharmacies in your area. You can also filter by district."
        },
        {
          question: "Is Blessed Irembo free to use?",
          answer: "Yes! Blessed Irembo is completely free for users looking for pharmacies. Only pharmacies pay a subscription fee to list their services on the platform."
        },
        {
          question: "How do I register my pharmacy?",
          answer: "Click \"For Pharmacies\" in the navigation menu, then follow the registration steps. You will need your Rwanda NPC( national pharmacy council) Council Registration Number (NPC/Axxxx) to sign up."
        },
        {
          question: "What is the pharmacy free trial?",
          answer: "Every newly registered pharmacy receives a 90-day free trial. After that, a subscription plan is required to maintain your listing on the platform."
        },
        {
          question: "How do I pay for a subscription?",
          answer: "Go to your pharmacy dashboard and click \"Subscription\". Choose a plan and dial the USSD code provided using MTN Mobile Money. Then click \"I Intend to Pay\" and optionally upload a screenshot of your receipt. Our team will review and approve your subscription within 24 hours."
        },
        {
          question: "How do I update my pharmacy information?",
          answer: "Log in to your pharmacy dashboard, go to \"Settings\" to update your operating hours, location, contact information, and more."
        },
        {
          question: "I forgot my password. What do I do?",
          answer: "On the login page, click \"Forgot Password\" and enter your email address. You will receive a link to reset your password."
        }
      ],
      stillNeedHelp: "Still need help?",
      stillNeedHelpSubtitle: "Our support team is available to assist you directly."
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: April 2025",
      intro: {
        title: "1. Introduction",
        text: "Blessed Irembo (\"we\", \"our\", or \"us\"), operated by Blessed HealthConnect Ltd, is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform."
      },
      collection: {
        title: "2. Information We Collect",
        personal: "Personal Information: Name, phone number, and email address when you create an account.",
        pharmacy: "Pharmacy Information: Pharmacy name, physical address, GPS coordinates, operating hours, and council registration number.",
        usage: "Usage Data: Pages visited, search queries, and interactions with pharmacy profiles to improve our services.",
        payment: "Payment Records: Subscription payment receipts uploaded for admin review. We do not store card or bank details."
      },
      use: {
        title: "3. How We Use Your Information",
        item1: "To connect users with pharmacies near them.",
        item2: "To manage pharmacy accounts and subscriptions.",
        item3: "To improve the platform based on usage analytics.",
        item4: "To send important account or service-related communications."
      },
      sharing: {
        title: "4. Data Sharing",
        text: "We do not sell, trade, or rent your personal information to third parties. Pharmacy profile details (name, address, phone, operating hours) are publicly visible to help users find pharmacies. Admin staff have access to subscription and account information for platform management purposes only."
      },
      security: {
        title: "5. Data Security",
        text: "We use Firebase (Google Cloud) for secure data storage and authentication. All data is encrypted in transit and at rest. We regularly review our security practices to ensure your data is protected."
      },
      rights: {
        title: "6. Your Rights",
        text: "You have the right to access, correct, or delete your personal data at any time. To make a request, contact us at blessedirembo@gmail.com."
      },
      changes: {
        title: "7. Changes to This Policy",
        text: "We may update this Privacy Policy from time to time. We will notify registered users of significant changes. Continued use of the platform constitutes acceptance of the updated policy."
      },
      contact: {
        title: "8. Contact Us",
        text: "If you have questions about this policy, please reach out to us at blessedirembo@gmail.com or call +250 799 538 220."
      }
    },
    terms: {
      title: "Terms and Conditions",
      lastUpdated: "Last updated: April 2025",
      consentNotice: "By registering on Blessed Irembo, operated by Blessed HealthConnect Ltd, you consent that your personal and/or business information will be collected, stored, and securely processed solely for the purpose of providing and managing platform services. Your data will be handled in accordance with applicable laws of Rwanda, including Law No. 058/2021 relating to the protection of personal data and privacy. We do not sell, share, or use your information for any other purpose unless required by law or with your explicit consent.",
      acceptance: {
        title: "1. Acceptance of Terms",
        text: "By accessing or using Blessed Irembo, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform. These terms apply to all users, including pharmacies and the general public."
      },
      use: {
        title: "2. Use of the Platform",
        item1: "You must be at least 18 years old to create an account.",
        item2: "You are responsible for keeping your account credentials confidential.",
        item3: "You agree not to misuse the platform for fraudulent or unlawful purposes.",
        item4: "You must not attempt to access accounts, data, or systems you are not authorized to use."
      },
      listings: {
        title: "3. Pharmacy Listings",
        text: "Pharmacies listed on Blessed Irembo must be licensed by the Rwanda NPC( national pharmacy council). We verify registration numbers during signup, but we are not liable for any inaccuracies in the information provided by pharmacies. Users should independently verify important medical information before making decisions."
      },
      subscriptions: {
        title: "4. Subscription Services",
        text: "Pharmacy subscriptions are subject to a free trial period of 90 days from registration. After the trial, pharmacies must subscribe to maintain full platform access. Subscription payments are processed manually via MoMo and approved by the Blessed Irembo admin team. Refunds are not offered once a subscription is approved."
      },
      ip: {
        title: "5. Intellectual Property",
        text: "All content, branding, and technology on this platform are the property of Blessed HealthConnect Ltd. You may not reproduce, copy, or distribute any part of the platform without written permission."
      },
      liability: {
        title: "6. Limitation of Liability",
        text: "Blessed Irembo is a directory service and does not provide medical advice. We are not liable for any decisions made based on information found on this platform. Always consult a qualified healthcare professional for medical guidance."
      },
      termination: {
        title: "7. Termination",
        text: "We reserve the right to suspend or terminate accounts that violate these terms, without prior notice. Pharmacies found to have provided false information during registration will be immediately removed from the platform."
      },
      contact: {
        title: "8. Contact Us",
        text: "For questions about these terms, contact us at blessedirembo@gmail.com or call +250 799 538 220."
      }
    },
    forPharmacies: {
      hero: {
        badge: "For Licensed Pharmacies in Rwanda",
        title: "Grow Your Pharmacy with Blessed Irembo",
        subtitle: "Join Rwanda's first digital pharmacy directory. Get verified, get found, and connect with thousands of patients looking for pharmacies near them.",
        cta: "Register Your Pharmacy — Free Trial"
      },
      benefits: {
        title: "Why Join Blessed Irembo?",
        items: {
          visibility: {
            title: "Map Visibility",
            desc: "Your pharmacy appears as a pin on our interactive map, helping nearby users find you instantly."
          },
          verified: {
            title: "Verified Badge",
            desc: "Your pharmacy gets a \"Verified\" badge, building instant trust with users across Rwanda."
          },
          whatsapp: {
            title: "Direct WhatsApp",
            desc: "Users can contact you directly via WhatsApp from your profile, enabling quick customer inquiries."
          },
          analytics: {
            title: "Analytics Dashboard",
            desc: "Track your profile views and WhatsApp click-through rate directly from your pharmacy dashboard."
          }
        }
      },
      freeTrial: {
        title: "Start with a 90-Day Free Trial",
        desc: "Every new pharmacy gets 3 months of full access completely free. No payment required to get started. After the trial, choose a plan that works for you."
      },
      pricing: {
        title: "Subscription Plans",
        subtitle: "Simple, affordable pricing with no hidden fees. Pay via MTN Mobile Money.",
        plans: [
          { name: "1 Month", price: "1,000 RWF", period: "/month" },
          { name: "3 Months", price: "3,000 RWF", period: "/3 months", badge: "Most Popular" },
          { name: "12 Months", price: "10,000 RWF", period: "/year" }
        ],
        cta: "Get Started"
      },
      howItWorks: {
        title: "How It Works",
        steps: [
          { title: "Register", desc: "Sign up with your Rwanda NPC( national pharmacy council) Council Registration Number." },
          { title: "Get Verified", desc: "Our team verifies your registration and activates your listing." },
          { title: "Grow", desc: "Users find your pharmacy on the map and contact you directly." }
        ]
      },
      finalCta: {
        title: "Ready to get started?",
        subtitle: "Join hundreds of pharmacies already listed on Blessed Irembo.",
        button: "Register Your Pharmacy Today",
        questions: "Have questions? Call us at"
      }
    },
    getStarted: {
      title: "Get Started with Blessed Irembo",
      subtitle: "Choose your account type to begin connecting with Rwanda's pharmacy network",
      user: {
        title: "I'm a User",
        subtitle: "Find and connect with pharmacies",
        features: [
          "Search pharmacies nationwide",
          "View verified pharmacy information",
          "Send inquiries directly to pharmacies",
          "Access 24/7 pharmacy locations"
        ],
        cta: "Continue as User"
      },
      pharmacy: {
        title: "I'm a Pharmacy",
        subtitle: "Register your pharmacy business",
        trialBadge: "3-Month Free Trial",
        features: [
          "3-month free trial (no credit card required)",
          "Nationwide visibility on our platform",
          "Manage customer inquiries in one dashboard",
          "Verification badge for credibility"
        ],
        cta: "Continue as Pharmacy"
      },
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in here"
    },
    pharmacyDashboard: {
      nav: {
        overview: "Overview",
        subscription: "Subscription",
        profile: "Profile",
        settings: "Settings",
        logout: "Log out",
        myPharmacy: "My Pharmacy",
        badge: "Pharmacy"
      },
      overview: {
        subtitle: "Manage your pharmacy profile and subscriptions",
        stats: {
          whatsappClicks: "WhatsApp Clicks",
          whatsappClicksSubtitle: "Platform redirections",
          profileViews: "Profile Views",
          profileViewsSubtitle: "Pharmacy detail visits",
          subscriptionStatus: "Subscription Status",
          active: "active",
          expired: "expired"
        },
        info: {
          title: "Pharmacy Information",
          address: "Address",
          phone: "Phone",
          email: "Email",
          memberSince: "Member Since"
        }
      },
      profile: {
        title: "My Profile",
        backToDashboard: "Back to Dashboard",
        labels: {
          name: "Pharmacy Name",
          email: "Email Address",
          phone: "Phone Number",
          address: "Address"
        },
        notProvided: "Not provided"
      },
      settings: {
        title: "Settings",
        subtitle: "Manage your account preferences and settings",
        tabs: {
          account: "Account",
          workingHours: "Working Hours",
          location: "Location"
        },
        account: {
          changePassword: "Change Password",
          currentPassword: "Current Password",
          newPassword: "New Password",
          confirmPassword: "Confirm New Password",
          updateButton: "Update Password",
          updating: "Updating...",
          success: "Password successfully updated!",
          twoFactor: "Two-Factor Authentication",
          twoFactorSubtitle: "Add an extra layer of security to your account",
          enable2FA: "Enable 2FA",
          deleteAccount: "Delete Account",
          deleteSubtitle: "Permanently delete your account and all associated data. This action cannot be undone.",
          confirmDelete: "Please confirm your current password to delete your account.",
          confirmButton: "Confirm Deletion",
          cancelButton: "Cancel"
        },
        workingHours: {
          title: "Working Hours",
          is24Hours: "Open 24/7",
          days: "Operating Days",
          openTime: "Opening Time",
          closeTime: "Closing Time",
          saveButton: "Save Working Hours",
          saving: "Saving...",
          success: "Operating hours updated successfully!"
        },
        location: {
          title: "Location & Address",
          pinLocation: "Pin Location",
          pinSubtitle: "Click on the map to set your exact location.",
          address: "Pharmacy Address",
          addressPlaceholder: "e.g. KN 5 Rd, Kigali",
          saveButton: "Save Location",
          saving: "Saving...",
          success: "Location and map coordinates updated successfully!",
          errors: {
            incorrectPassword: "Incorrect current password.",
            fillHours: "Please fill out all operating hours fields or select 24/7.",
            hoursUpdateFailed: "Failed to update operating hours.",
            addressEmpty: "Address cannot be empty.",
            locationUpdateFailed: "Failed to update location.",
            deleteConfirmPassword: "Please enter your password to confirm.",
            deleteAccountFailed: "Failed to delete account. Please try again."
          }
        }
      },
      subscription: {
        title: "Subscription Management",
        status: {
          title: "Current Status",
          active: "Active",
          expired: "Expired",
          validUntil: "Access Valid Until",
          expiredMsg: "Your access has expired or is pending renewal."
        },
        pending: {
          title: "Request Sent to Admin",
          msg: "We have notified the admin that you intend to pay {amount} RWF. The admin is reviewing your request.",
          step2: "Step 2: Upload Receipt",
          step2Msg: "To speed up approval, upload a screenshot of your MoMo receipt:",
          uploadButton: "Upload Receipt",
          uploading: "Uploading...",
          success: "Your receipt has been securely uploaded.",
          approvalPending: "Receipt uploaded successfully. The admin will review it shortly to activate your subscription.",
          cancelButton: "Cancel Pending Request"
        },
        plans: {
          title: "Select a Plan to Renew",
          bestValue: "Best Value",
          totalAmount: "Total amount"
        },
        payment: {
          title: "Complete Your Payment",
          step1: "Step 1: Make the payment",
          instruction: "Open your phone dialer and enter the following code:",
          confirmation: "You will be prompted to confirm a payment to Blessed HealthConnect LTD for {amount} RWF.",
          paidButton: "I have Paid (Intend to Pay)",
          sending: "Sending Request...",
          errors: {
            selectScreenshot: "Please select a payment screenshot first.",
            uploadFailed: "Failed to upload receipt. Please try again.",
            cancelConfirm: "Are you sure you want to cancel this request?",
            cancelFailed: "Failed to cancel request."
          }
        }
      },
    },
    registerPharmacy: {
      title: "Register Pharmacy",
      subtitle: "Your council registration number is verified against the official list.",
      fdaList: "as issued by NPC( national pharmacy council)",
      labels: {
        registrationNumber: "Council Registration Number of responsible personnel",
        registrationNumberPlaceholder: "NPC/A0000",
        registrationNumberHint: "Format: NPC/A0000 — as issued by Rwanda NPC( national pharmacy council)",
        pharmacyName: "Pharmacy Name",
        pharmacyNamePlaceholder: "Enter pharmacy name",
        ownerName: "Owner / Responsible Person",
        ownerNamePlaceholder: "Enter owner full name",
        phone: "Phone Number",
        phonePlaceholder: "+250 788 123 456",
        email: "Email Address",
        emailPlaceholder: "pharmacy@example.com",
        address: "Physical Address",
        addressPlaceholder: "Enter full address including district",
        operatingHours: "Operating Hours",
        is24Hours: "Open 24/7 (Always open)",
        daysOpen: "Days Open",
        openingTime: "Opening Time",
        closingTime: "Closing Time",
        location: "Pharmacy Location on Map",
        locationHint: "Choose how to set your pharmacy's position on the map. At least one method is required.",
        gpsTab: "Use My Location",
        gpsHint: "Best accuracy. Open this page while physically at the pharmacy.",
        gpsButton: "Use My Location",
        gpsLocating: "Getting your location...",
        gpsSuccess: "Location captured — click to update",
        gpsCaptured: "Location captured",
        manualTab: "Enter Coordinates",
        manualHint: "Open Google Maps, right-click your pharmacy → copy the coordinates shown, and paste them below.",
        latitude: "Latitude",
        longitude: "Longitude",
        coordinatesSet: "Coordinates set",
        openMaps: "Open Google Maps to find coordinates",
        descriptionTab: "Description Only",
        descriptionHint: "Note: Without coordinates, your pharmacy won't appear as a pin on the map. You can update your location later.",
        password: "Password",
        passwordPlaceholder: "Create secure password (min. 6 characters)",
        confirmPassword: "Confirm Password",
        confirmPasswordPlaceholder: "Re-enter your password",
        fdaNotice: "Verified by Rwanda NPC( national pharmacy council). Your council registration number is cross-checked against the official list of 725 licensed human retail pharmacies."
      },
      submitButton: "Register Pharmacy",
      registering: "Registering...",
      alreadyAccount: "Already have an account?",
      signIn: "Sign In",
      status: {
        checking: "Checking...",
        verified: "Verified",
        alreadyRegistered: "Already registered",
        notFound: "Not found in the Rwanda NPC( national pharmacy council) licensed list"
      },
      errors: {
        pharmacyNameRequired: "Pharmacy name is required",
        ownerNameRequired: "Owner name is required",
        emailRequired: "Email is required",
        emailInvalid: "Email is invalid",
        phoneRequired: "Phone number is required",
        addressRequired: "Physical address is required",
        openTimeRequired: "Opening time required",
        closeTimeRequired: "Closing time required",
        locationRequired: "Click \"Use My Location\" to capture your GPS coordinates.",
        locationRequiredManual: "Enter valid latitude and longitude coordinates.",
        registrationNumberRequired: "Council registration number of responsible personnel is required",
        registrationNumberNotFound: "Not found in the Rwanda NPC( national pharmacy council) licensed pharmacy list",
        registrationNumberTaken: "This pharmacy is already registered on Blessed Irembo",
        registrationNumberChecking: "Still verifying — please wait a moment",
        passwordRequired: "Password is required",
        passwordMinLength: "Password must be at least 6 characters",
        passwordsMismatch: "Passwords do not match",
        generic: "Something went wrong. Please try again."
      }
    },
    download: {
      title: "Download the Blessed Irembo App",
      subtitle: "Access the best pharmacy finder in Rwanda directly from your mobile device. Search pharmacies on the go, check real-time availability, and view contact details instantly.",
      playStoreButton: "Get it on Google Play",
      appStoreButton: "Download on the App Store",
      qrTitle: "Scan to Download",
      qrText: "Scan the QR code below with your phone's camera to download the app directly.",
      featuresTitle: "Mobile App Features",
      feature1Title: "Real-time Map Search",
      feature1Desc: "Locate verified pharmacies near you in real-time with interactive mapping.",
      feature2Title: "Direct WhatsApp Chat",
      feature2Desc: "Message pharmacies directly to check medicine availability and pricing.",
      feature3Title: "24/7 Hours & Info",
      feature3Desc: "Find which pharmacies are open 24/7, check reviews, and get directions."
    }
  },
  rw: {
    nav: {
      home: "Ahabanza",
      findPharmacies: "Shaka Farumasi",
      login: "Injira",
      getStarted: "Tangira",
      logout: "Sohoka",
      profile: "Umwirondoro wanjye",
      settings: "Igenamiterere",
      downloadApp: "Manura App",
    },
    hero: {
      title: "Shaka Farumasi Zizewe Aho Ariho Hose mu Rwanda",
      subtitle: "Blessed Irembo Ikora ishikamiye kuri Blessed HealthConnect Ltd, iguhuza farumasi zujuje ibyangombwa mu gihugu hose. Shaka aho uherereye, reba niba imiti ihari, ubone imiti ukeneye mu gihe gikwiye.",
      cta_find: "Shaka Farumasi",
      cta_register: "Iyandikishe nka Farumasi",
    },
    features: {
      title: "Kuki wahitamo Blessed Irembo?",
      subtitle: "Urubuga rwa mbere rwagufasha kubona farumasi mu Rwanda",
      stats: {
        pharmacies: "Farumasi Ziyandikishije",
        users: "Abakoresha Urubuga",
        cities: "Intara/Uturere Twagezweho",
        support: "Ubufasha Buhari"
      },
      f1: {
        title: "Igihugu Hose",
        desc: "Gera kuri farumasi mu ntara n'uturere twose tw'u Rwanda"
      },
      f2: {
        title: "Farumasi Zujuje Ibyangombwa",
        desc: "Farumasi zose zifite impushya kandi zagenzuwe n'inzego z'ubuzima"
      },
      f3: {
        title: "Igihe Cyose",
        desc: "Shaka farumasi zikora amasaha 24 kuri 24 n'izikora mu bihe by'izina"
      },
      f4: {
        title: "Ubuziranenge",
        desc: "Gana farumasi zizerwa kandi ziharanira gutanga serivisi nziza"
      }
    },
    owners: {
      title: "Ku Banyamuryango (Ba Nyiri Farumasi)",
      subtitle: "Yinjire mu rusobe rwa farumasi zikomeye mu Rwanda maze uhure n'abakiriya bakeneye serivisi zawe.",
      b1: { title: "Igihe cy'Igeragezwa ry'Amezi 3", desc: "Tangira gukoresha urubuga ku buntu" },
      b2: { title: "Kumenyekana Cyane", desc: "Gera ku bakiriya mu gihugu hose" },
      b3: { title: "Inyandiko z'Abakiriya Zihuse", desc: "Genzura ibibazo n'ibyifuzo by'abakiriya hano" },
      cta: "Iyandikishe nka Farumasi"
    },
    cta: {
      title: "Witeguye kubona imiti ukeneye?",
      subtitle: "Shaka farumasi zizerwa ziri hafi yawe kandi urebe niba imiti ihari mu gihe nyacyo.",
      button: "Shaka Farumasi None"
    },
    footer: {
      desc: "Guhuza Abanyarwanda na farumasi zizerwa mu gihugu hose. Wabona imiti vuba kandi bworoshye.",
      solution: "Igisubizo mu buvuzi gitanzwe na",
      quickLinks: "Ihuza Rikoreshwa Cyane",
      contact: "Twandikire",
      rights: "Uburenganzira bwose ni ubwa Blessed Irembo.",
      operatedBy: "Icungwa na",
      links: {
        privacy: "Ibijyanye n'Ibanga",
        terms: "Amategeko n'Amabwiriza",
        help: "Ubufasha",
        about: "Ibitwerekeyeho",
        forPharmacies: "Ku Banyamuryango"
      }
    },
    login: {
      title: "Murakaza Neza",
      subtitle: "Injira muri konti yawe kugira ngo ukomeze",
      emailLabel: "Imeri cyangwa Nimero ya Terefone",
      emailPlaceholder: "name@example.com cyangwa +250 788...",
      passwordLabel: "Ijambo ry'ibanga",
      passwordPlaceholder: "Andika ijambo ry'ibanga ryawe",
      forgotPassword: "Wibagiwe ijambo ry'ibanga?",
      signInButton: "Injira",
      signingIn: "Kwinjira...",
      noAccount: "Ntabwo ufite konti?",
      getStarted: "Tangira hano",
      errors: {
        identifierRequired: "Imeri cyangwa nimero ya terefone ni ngombwa",
        passwordMinLength: "Ijambo ry'ibanga rigomba kugira inyuguti nibura 6",
        invalidCredentials: "Imeri cyangwa ijambo ry'ibanga ntabwo ari byo. Ongera ugerageze.",
        tooManyRequests: "Wagerageje kenshi bidakunze. Ongera ugerageze nyuma.",
        accountDisabled: "Iyi konti yahagaritswe. Hamagara ubufasha.",
        generic: "Hagaragaye ikibazo. Ongera ugerageze."
      }
    },
    signup: {
      title: "Iyandikishe",
      subtitle: "Fungura konti yawe kugira ngo utangire",
      successTitle: "Konti yawe yafunguwe!",
      successDesc: "Konti yawe yafunguwe neza. Injira kugira ngo ukomeze.",
      loginLink: "Gana ahabanza kwinjira",
      fullNameLabel: "Amazina Yose",
      fullNamePlaceholder: "Andika amazina yawe yose",
      phoneLabel: "Nimero ya Terefone",
      phonePlaceholder: "+250 788 123 456",
      emailLabel: "Imeri",
      emailPlaceholder: "imeri.yawe@urugero.com",
      passwordLabel: "Ijambo ry'ibanga",
      passwordPlaceholder: "Andika ijambo ry'ibanga rifite inyuguti 6",
      confirmPasswordLabel: "Subiramo Ijambo ry'ibanga",
      confirmPasswordPlaceholder: "Subiramo ijambo ry'ibanga ryawe",
      acceptTerms: "Nemeye",
      termsLink: "Amategeko n'Amabwiriza",
      submitButton: "Iyandikishe",
      submitting: "Kwiyandikisha...",
      alreadyAccount: "Ufite konti?",
      signIn: "Injira hano",
      errors: {
        fullNameRequired: "Amazina yose ni ngombwa",
        emailRequired: "Imeri ni ngombwa",
        emailInvalid: "Imeri ntabwo ari yo",
        phoneRequired: "Nimero ya terefone ni ngombwa",
        passwordRequired: "Ijambo ry'ibanga ni ngombwa",
        passwordMinLength: "Ijambo ry'ibanga rigomba kugira inyuguti nibura 6",
        passwordsMismatch: "Amagambo y'ibanga ntabwo ahuye",
        termsRequired: "Ugomba kwemera amategeko n'amabwiriza",
        emailInUse: "Iyi imeri isanzwe ifite konti. Gerageza kwinjira.",
        weakPassword: "Ijambo ry'ibanga ni rito cyane. Koresha inyuguti 6.",
        invalidEmail: "Andika imeri ifite ishingiro.",
        generic: "Hagaragaye ikibazo. Ongera ugerageze."
      }
    },
    pharmacies: {
      title: "Farumasi",
      subtitle: "Shaka kandi uvugane na farumasi zifite impushya mu Rwanda hose.",
      searchPlaceholder: "Shakisha ukoresheje izina cyangwa aho iherereye...",
      allDistricts: "Uturere Twose",
      districts: {
        kigali: "Umujyi wa Kigali",
        northern: "Intara y'Amajyaruguru",
        southern: "Intara y'Amajyepfo",
        eastern: "Intara y'Iburasirazuba",
        western: "Intara y'Iburengerazuba"
      },
      openNow: "Izifunguye ubu",
      nearMe: "Izinyegereye",
      locating: "Turashaka aho uri...",
      locationDenied: "Uburenganzira bwo kubona aho uri bwanzwe. Nyamuneka buburenganzire muri porogaramu yawe.",
      locationUnavailable: "Aho uherereye ntabwo haboneka ubu.",
      locationUnable: "Ntabwo dushoboye kubona aho uherereye.",
      foundCount: "Habonetse",
      pharmacySingle: "farumasi",
      pharmacyPlural: "farumasi",
      open: "Irafunguye",
      closed: "Irafunze",
      open24Hours: "Ikora amasaha 24/7",
      viewDetails: "Reba birambuye",
      noPharmacies: "Nta farumasi yaboneka",
      adjustFilters: "Geregeza guhindura ibyo washakaga cyangwa uturere watoranyije.",
      operatingHours: "Amasaha yo gukora",
      call: "Hamagara",
      whatsapp: "WhatsApp"
    },
    common: {
      loading: "Biracyatunganywa...",
      search: "Shakisha",
      poweredBy: "Ikoranabuhanga rya",
    },
    pharmacyDetail: {
      back: "Subira inyuma",
      callPharmacy: "Hamagara Farumasi",
      chatWhatsApp: "Andikira kuri WhatsApp",
      address: "Aho iherereye",
      phone: "Terefone",
      email: "Imeri",
      hours: "Amasaha yo gukora",
      openNow: "Irafunguye ubu",
      closedNow: "Irafunze ubu",
      hoursNotSpecified: "Amasaha ntabwo azwi",
      location: "Aho iherereye",
      getDirections: "Kwereka inzira",
      gettingLocation: "Biracyashakisha aho uherereye...",
      calculatingRoute: "Biracyabara inzira...",
      duration: "Igihe",
      distance: "Intera",
      verified: "Yagenzuwe",
      available247: "Ikora 24/7",
      premiumMember: "Umunyamuryango w'Imena",
      notFound: "Farumasi ntabwo ibonetse",
      notFoundDesc: "Farumasi urimo ushaka ntabwo ibonetse.",
      defaultDescription: "Farumasi yemejwe kuri Blessed Irembo.",
      backToPharmacies: "Subira kuri farumasi zose",
      days: {
        monday: "Kuwa Mbere",
        tuesday: "Kuwa Kabiri",
        wednesday: "Kuwa Gatatu",
        thursday: "Kuwa Kane",
        friday: "Kuwa Gatanu",
        saturday: "Kuwa Gatandatu",
        sunday: "Ku Cyumweru"
      }
    },
    profile: {
      title: "Umwirondoro wanjye",
      fullName: "Amazina Yose",
      email: "Imeri",
      phone: "Nimero ya Terefone",
      notProvided: "Ntabwo yatanzwe",
      backToPharmacies: "Subira kuri Farumasi",
      settings: "Igenamiterere",
    },
    settings: {
      title: "Igenamiterere rya Konti",
      profile: {
        title: "Umwirondoro",
        subtitle: "Hindura amazina yawe n'nimero ya terefone",
        fullName: "Amazina Yose",
        fullNamePlaceholder: "Amazina yawe yose",
        phone: "Nimero ya Terefone",
        phonePlaceholder: "+250 7XX XXX XXX",
        email: "Imeri",
        emailLocked: "Imeri ntabwo ihindurirwa hano.",
        save: "Bika Umwirondoro",
        saving: "Biracyabikwa...",
        success: "Umwirondoro wahinduwe neza.",
        error: "Guhindura umwirondoro ntibyashobotse. Ongera ugerageze."
      },
      password: {
        title: "Hindura Ijambo ry'ibanga",
        subtitle: "Hindura ijambo ry'ibanga rya konti yawe",
        current: "Ijambo ry'ibanga rya ubu",
        currentPlaceholder: "Andika ijambo ry'ibanga rya ubu",
        new: "Ijambo ry'ibanga rishya",
        newPlaceholder: "Nibura inyuguti 6",
        confirm: "Subiramo Ijambo ry'ibanga rishya",
        confirmPlaceholder: "Subiramo ijambo ry'ibanga rishya",
        update: "Hindura Ijambo ry'ibanga",
        updating: "Biracyahindurwa...",
        success: "Ijambo ry'ibanga ryahinduwe neza.",
        errorMinLength: "Ijambo ry'ibanga rishya rigomba kugira inyuguti nibura 6.",
        errorMismatch: "Amagambo y'ibanga ntabwo ahuye.",
        errorIncorrect: "Ijambo ry'ibanga rya ubu ntabwo ari ryo.",
        errorGeneric: "Hagaragaye ikibazo. Ongera ugerageze."
      },
      notifications: {
        title: "Imenyekanisha",
        subtitle: "Hitamo uko twakuvugisha",
        push: "Imenyekanisha kuri Terefone",
        pushDesc: "Bona ubutumwa kuri terefone yawe",
        email: "Ubutumwa kuri Imeri",
        emailDesc: "Amakuru mashya n'amatangazo"
      },
      privacy: {
        title: "Aho uherereye n'Ibanga",
        subtitle: "Genzura amakuru yawe n'uburenganzira bwo kumenya aho uherereye",
        location: "Serivisi z'aho uherereye",
        locationDesc: "Emerera porogaramu kumenya neza aho uherereye",
        analytics: "Ubushakashatsi n'Ibisangirwa",
        analyticsDesc: "Fasha kunoza urubuga utanga amakuru y'uko urukoresha"
      },
      appearance: {
        title: "Imigaragarire",
        subtitle: "Hitamo uko urubuga rugaragara",
        darkMode: "Ibara ry'Umukara",
        darkModeDesc: "Hindura hagati y'ibara ryera n'iry'umukara"
      },
      delete: {
        title: "Siba Konti",
        subtitle: "Siba konti yawe n'amakuru yose burundu",
        warning: "Iyo usibye konti, ntabwo ushobora kuyigarura.",
        confirmPrompt: "Andika ijambo ry'ibanga ryawe kugira ngo wemeze isibwa rya konti.",
        passwordPlaceholder: "Andika ijambo ry'ibanga ryawe",
        button: "Siba Konti",
        cancel: "Reka",
        confirm: "Emeza Isiba",
        deleting: "Biracyasibwa...",
        errorIncorrect: "Ijambo ry'ibanga ntabwo ari ryo.",
        errorGeneric: "Hagaragaye ikibazo. Ongera ugerageze."
      }
    },
    about: {
      title: "Tumenye - Blessed Irembo",
      subtitle: "Ihuriro ry'ubuzima rishingiye ku ikoranabuhanga ryorohereza Abanyarwanda kubona farumasi zizewe kandi zujuje ibyangombwa mu gihugu hose — vuba, mu buryo bworoshye, kandi bwizewe.",
      mission: {
        title: "Intego Yacu",
        p1: "Muri Blessed Irembo, twemera ko kubona imiti n'serivisi z'ubuzima bitagombye kuba ikibazo. Intego yacu ni ukwemeza ko kubona farumasi byorohera buri munyarwanda wese, mu gihe dufasha farumasi zo mu gihugu kumenyekana no gukorera abaturage neza kurusha mbere.",
        p2: "Tudushishikajwe no guhuza abatanga serivisi z'ubuzima n'abazikeneye kurusha abandi — guhera kuri farumasi no kwaguka mu bindi bice by'ubuzima hifashishijwe ikoranabuhanga."
      },
      stats: {
        licensed: "Farumasi Zifite Impushya",
        verified: "Zagenzuwe na NPC( national pharmacy council)",
        districts: "Uturere Twagezweho",
        access: "Uburyo bwo kuyikoresha"
      },
      story: {
        title: "Amateka Yacu",
        p1: "Blessed Irembo yavutse ishingiye ku kintu cyoroheje ariko gifite imbaraga: mu Rwanda, gushaka farumasi — cyane cyane ifite umuti wihariye ukeneye — bishobora gutwara igihe kinini kandi bikagorana. Abantu akenshi basura farumasi nyinshi bakaza gusanga ibyo bakeneye bidahari.",
        p2: "Abashinze uru urubuga, babitewe n'ubushake bwo kunoza uburyo bwo kubona serivisi z'ubuzima mu Rwanda, biyemeje kubaka urubuga rwaba rurimo farumasi zose zifite impushya, zagenzuwe hakoreshejwe amakuru ya NPC( national pharmacy council) y'u Rwanda, kandi zigaragara mu buryo bworoshye bwakoreshwa kuri terefone cyangwa mudasobwa.",
        p3: "Uyu munsi, Blessed Irembo icungwa na Blessed HealthConnect Ltd, ikigo cy'Abanyarwanda cyiyemeje gukoresha ikoranabuhanga mu kuzamura ireme rya serivisi z'ubuzima mu gihugu hose."
      },
      cta: {
        title: "Fatanya Natwe",
        subtitle: "Waba uri umurwayi ushaka farumasi cyangwa uri nyiri farumasi ushaka kwagura ibikorwa — Blessed Irembo ni iyawe.",
        find: "Shaka Farumasi",
        register: "Iyandikishe nka Farumasi"
      }
    },
    help: {
      title: "Ubufasha",
      subtitle: "Soma ibisubizo by'ibibazo bikunze kubazwa hano munsi. Niba ukeneye ubufasha bwihariye, itsinda ryacu ryiteguye kugufasha!",
      faqs: [
        {
          question: "Ni gute nashaka farumasi iri hafi yanjye?",
          answer: "Jya ahabanza ukoreshe akadirishya ko gushakisha cyangwa ikarita yacu kugira ngo urebe farumasi ziri mu karere kawe. Ushobora no gushaka ukoresheje akarere."
        },
        {
          question: "Ese gukoresha Blessed Irembo ni ubuntu?",
          answer: "Yego! Blessed Irembo ni ubuntu ku muntu wese ushaka farumasi. Farumasi nizo gusa wishyura amafaranga y'ifatabuguzi kugira ngo serivisi zazo zigaragare ku rubuga."
        },
        {
          question: "Ni gute nakwiyandikisha nka farumasi?",
          answer: "Kanda \"Kuri Farumasi\" ahabanza, hanyuma ukurikize amabwiriza yo kwiyandikisha. Uzakenera nimero yawe yo kwiyandikisha muri Rwanda NPC( national pharmacy council) (NPC/Axxxx) kugira ngo wiyandikishe."
        },
        {
          question: "Ese farumasi ihabwa igihe cy'igerageza?",
          answer: "Buri farumasi nshya yiyandikishije ihabwa iminsi 90 y'igerageza ku buntu. Nyuma y'icyo gihe, usabwa guhitamo uburyo bw'ifatabuguzi kugira ngo ukomeze kugaragara ku rubuga."
        },
        {
          question: "Ni gute wishyura ifatabuguzi?",
          answer: "Jya ahabanza ha farumasi yawe ukande ahanditse \"Subscription\". Hitamo uburyo bwo kwishyura hanyuma ukande nimero ya USSD wahawe ukoresheje MTN Mobile Money. Hanyuma ukande \"I Intend to Pay\" kandi ushobora no kohereza ifoto y'inyemezabwishyu yawe. Itsinda ryacu rirasuzuma rikemeza ifatabuguzi ryawe mu masaha 24."
        },
        {
          question: "Ni gute nahindura amakuru ya farumasi yanjye?",
          answer: "Injira ahabanza ha farumasi yawe, jya kuri \"Settings\" kugira ngo uhindure amasaha ukoreraho, aho uherereye, uko bakuvugisha, n'ibindi."
        },
        {
          question: "Nahemutse ijambo ry'ibanga. Nakora iki?",
          answer: "Ahanditse kwinjira (login), kanda ahanditse \"Forgot Password\" hanyuma wandike imeri yawe. Uzahita ubona ubutumwa bugufasha guhindura ijambo ry'ibanga."
        }
      ],
      stillNeedHelp: "Ukeneye ubundi bufasha?",
      stillNeedHelpSubtitle: "Itsinda ryacu ry'ubufasha ryiteguye kugufasha mu buryo bwisumbuyeho."
    },
    privacy: {
      title: "Politiki y'Ibanga",
      lastUpdated: "Iheruka kuvugururwa: Mata 2025",
      intro: {
        title: "1. Intangiriro",
        text: "Blessed Irembo (\"twebwe\", cyangwa \"acu\"), icungwa na Blessed HealthConnect Ltd, biyemeje kurinda amakuru yawe bwite. Iyi Politiki y'Ibanga isobanura uburyo dukusanya, dukoresha, kandi turinda amakuru yawe iyo ukoresha urubuga rwacu."
      },
      collection: {
        title: "2. Amakuru Dukusanya",
        personal: "Amakuru bwite: Amazina, nimero ya terefone, n'imeri yawe iyo ufunguye konti.",
        pharmacy: "Amakuru ya Farumasi: Izina rya farumasi, aho iherereye, aho iherereye kuri GPS, amasaha ikoreraho, n'nimero yayo yo kwiyandikisha muri koperative y'abafuramatama.",
        usage: "Amakuru y'imikoreshereze: Impapuro wasuye, ibyo washakishije, n'uburyo wakoresheje umwirondoro wa farumasi kugira ngo tunoze serivisi zacu.",
        payment: "Amakuru yo kwishyura: Inyemezabwishyu z'ifatabuguzi wohereza kugira ngo zibanza gusuzumwa. Ntabwo tubika amakuru ya karite cyangwa ya banki."
      },
      use: {
        title: "3. Uburyo Dukoresha Amakuru Yawe",
        item1: "Guhuza abakoresha n'farumasi zibari hafi.",
        item2: "Gucunga konti n'ifatabuguzi bya farumasi.",
        item3: "Kunoza urubuga dushingiye ku busesenguzi bw'uko rukoreshwa.",
        item4: "Kohereza ubutumwa bw'ingenzi bujyanye na konti cyangwa serivisi."
      },
      sharing: {
        title: "4. Isangira ry'Amakuru",
        text: "Ntabwo tugurisha cyangwa ngo dukodeshe amakuru yawe bwite ku bandi bantu. Amakuru y'umwirondoro wa farumasi (izina, aho iherereye, terefone, amasaha) agaragarira buri wese kugira ngo afashe abakoresha kubona farumasi. Abakozi bacu nibo gusa bafite uburenganzira bwo kureba amakuru y'ifatabuguzi n'aya konti mu rwego rwo gucunga urubuga gusa."
      },
      security: {
        title: "5. Umutekano w'Amakuru",
        text: "Dukoresha Firebase (Google Cloud) mu kubika amakuru no kwemeza abayinjiramo mu buryo bwizewe. Amakuru yose ararinzwe mu gihe yoherezwa no mu gihe abitswe. Dusuzuma kenshi uburyo bwacu bw'umutekano kugira ngo tumenye ko amakuru yawe arinzwe."
      },
      rights: {
        title: "6. Uburenganzira Bwawe",
        text: "Ufite uburenganzira bwo kureba, guhindura, cyangwa gusiba amakuru yawe bwite igihe icyo ari cyo cyose. Kugira ngo ubisabe, utwandikire kuri blessedirembo@gmail.com."
      },
      changes: {
        title: "7. Impinduka kuri iyi Politiki",
        text: "Dushobora kuvugurura iyi Politiki y'Ibanga n'igihe icyo ari cyo cyose. Tuzamenyesha abakoresha bafite konti igihe habaye impinduka zikomeye. Gukomeza gukoresha urubuga bivuze ko wemeye politiki ivuguruye."
      },
      contact: {
        title: "8. Twandikire",
        text: "Niba ufite ibibazo kuri iyi politiki, nyamuneka utwandikire kuri blessedirembo@gmail.com cyangwa uduhamagare kuri +250 799 538 220."
      }
    },
    terms: {
      title: "Amategeko n'Amabwiriza",
      lastUpdated: "Iheruka kuvugururwa: Mata 2025",
      consentNotice: "Binyuze mu kwiyandikisha kuri Blessed Irembo, icungwa na Blessed HealthConnect Ltd, wemeye ko amakuru yawe bwite cyangwa ay'ubucuruzi bwawe akusanywa, akabikwa, kandi agacungwa mu buryo bwizewe ku bw'intego yo gutanga no gucunga serivisi z'uru rubuga gusa. Amakuru yawe azafatwa mu buryo buhuye n'amategeko ya Repubulika y'u Rwanda, ryaba Itegeko N° 058/2021 ryerekeye kurinda amakuru bwite n'imibereho bwite y'umuntu. Ntabwo tugurisha, dusangira, cyangwa ngo dukoreshe amakuru yawe ku bindi bikorwa ibyo ari byo byose, keretse bibaye ngombwa bishingiye ku mategeko cyangwa ku ruhushya rwawe bwite.",
      acceptance: {
        title: "1. Kwemera Amategeko",
        text: "Gukoresha Blessed Irembo bivuze ko wemeye kubahiriza aya mategeko n'amabwiriza. Niba utayemeye, nyamuneka ntukoreshe uru rubuga. Aya mategeko areba abakoresha bose, harimo farumasi n'abaturage bose."
      },
      use: {
        title: "2. Imikoreshereze y'Urubuga",
        item1: "Ugomba kuba ufite nibura imyaka 18 kugira ngo ufungure konti.",
        item2: "Ufite inshingano yo kurinda ibanga rya konti yawe.",
        item3: "Wemeye kutazakoresha uru rubuga mu bikorwa by'uburiganya cyangwa binyuranyije n'amategeko.",
        item4: "Ntabwo ugomba kugerageza kwinjira muri konti, amakuru, cyangwa uburyo udafitiye uburenganzira."
      },
      listings: {
        title: "3. Urutonde rwa Farumasi",
        text: "Farumasi zose ziri kuri Blessed Irembo zigomba kuba zifite uruhushya rwa Rwanda NPC( national pharmacy council). Dusuzuma nimero zo kwiyandikisha igihe bafungura konti, ariko ntabwo turyozwa amakuru atari yo yatanzwe na farumasi. Abakoresha bagomba kwisuzumira amakuru y'ingenzi y'ubuvuzi mbere yo gufata imyanzuro."
      },
      subscriptions: {
        title: "4. Serivisi z'Ifatabuguzi",
        text: "Ifatabuguzi rya farumasi rishingiye ku gihe cy'igerageza cy'iminsi 90 kuva biyandikishije. Nyuma y'icyo gihe, farumasi zigomba kwishyura ifatabuguzi kugira ngo bakomeze gukoresha urubuga. Kwishyura bikorwa mu buryo bwa MoMo maze itsinda rya Blessed Irembo rikabyemeza. Ntabwo asubizwa iyo amaze kwemezwa."
      },
      ip: {
        title: "5. Uburenganzira mu by'Ubwenge",
        text: "Ibirimo byose, ikirango, n'ikoranabuhanga riri kuri uru rubuga ni umutungo wa Blessed HealthConnect Ltd. Ntabwo wemerewe kubikoporora, kubitangaza, cyangwa kubikwirakwiza utabiherewe uburenganzira mu nyandiko."
      },
      liability: {
        title: "6. Imbibi z'Inshingano",
        text: "Blessed Irembo ni urubuga rutanga amakuru gusa, ntabwo rutanga inama z'ubuvuzi. Ntabwo turyozwa imyanzuro yafashwe dushingiye ku makuru aboneka kuri uru rubuga. Buri gihe jya ugisha inama muganga wize cyangwa umufuramatama ku bibazo by'ubuzima."
      },
      termination: {
        title: "7. Guhagarika Konti",
        text: "Tuzigamiye uburenganzira bwo guhagarika cyangwa gusiba konti zarenze kuri aya mategeko, tutabanje gutanga integuza. Farumasi zibasanganywe amakuru atari yo igihe biyandikishaga zizahita zisibwa kuri uru rubuga."
      },
      contact: {
        title: "8. Twandikire",
        text: "Niba ufite ibibazo kuri aya mategeko, utwandikire kuri blessedirembo@gmail.com cyangwa uduhamagare kuri +250 799 538 220."
      }
    },
    forPharmacies: {
      hero: {
        badge: "Kuri Farumasi zifite impushya mu Rwanda",
        title: "Agura ibikorwa bya Farumasi yawe ukoresheje Blessed Irembo",
        subtitle: "Fatanya n'ihuriro rya mbere rya farumasi mu Rwanda rishingiye ku ikoranabuhanga. Menyekana, ugaragare, kandi uhuzwe n'ibihumbi by'abarwayi bashaka farumasi zibari hafi.",
        cta: "Iyandikishe nka Farumasi — Igerageza ry'ubuntu"
      },
      benefits: {
        title: "Kuki wagakwiye kwiyandikisha kuri Blessed Irembo?",
        items: {
          visibility: {
            title: "Kugaragara ku ikarita",
            desc: "Farumasi yawe igaragara nk'akamenyetso ku ikarita yacu, bikafasha abakoresha bakubari hafi kugubona vuba."
          },
          verified: {
            title: "Ikirango cy'uko wizewe",
            desc: "Farumasi yawe ihabwa ikirango cya \"Verified\", bikubaka icyizere ku bakoresha mu Rwanda hose."
          },
          whatsapp: {
            title: "WhatsApp itaziguye",
            desc: "Abakoresha bashobora kukwandikira kuri WhatsApp bitaziguye bakuye ku mwinrodoro wawe."
          },
          analytics: {
            title: "Imibare n'Isesengura",
            desc: "Genzura umubare w'abasura umwirondoro wawe n'abakanda kuri WhatsApp yawe binyuze ahabanza ha farumasi yawe."
          }
        }
      },
      freeTrial: {
        title: "Tangira n'igerageza ry'iminsi 90 ku buntu",
        desc: "Buri farumasi nshya ihabwa amezi 3 yo gukoresha urubuga rwose ku buntu. Nta kiguzi gisabwa kugira ngo utangire. Nyuma y'igerageza, hitamo uburyo bw'ifatabuguzi bukwaniye."
      },
      pricing: {
        title: "Uburyo bw'Ifatabuguzi",
        subtitle: "Ibiciro byoroheje kandi bito nta bindi biguzi byihishe. Ishyura ukoresheje MTN Mobile Money.",
        plans: [
          { name: "Ukwezi 1", price: "1,000 RWF", period: "/ku kwezi" },
          { name: "Amezi 3", price: "3,000 RWF", period: "/amezi 3", badge: "Ibikunzwe cyane" },
          { name: "Amezi 12", price: "10,000 RWF", period: "/ku mwaka" }
        ],
        cta: "Tangira ubu"
      },
      howItWorks: {
        title: "Uko Bikora",
        steps: [
          { title: "Iyandikishe", desc: "Andika amakuru yawe ukoresheje nimero yawe yo kwiyandikisha muri Rwanda NPC( national pharmacy council)." },
          { title: "Genzurwa", desc: "Itsinda ryacu rirasuzuma nimero yawe maze rikakwemerera kugaragara ku urubuga." },
          { title: "Aguka", desc: "Abakoresha babona farumasi yawe ku ikarita maze bakakwandikira cyangwa bakaguhamagara." }
        ]
      },
      finalCta: {
        title: "Witeguye gutangira?",
        subtitle: "Fatanya n'amafarumasi amagana amaze kwiyandikisha kuri Blessed Irembo.",
        button: "Iyandikishe nka Farumasi uyu munsi",
        questions: "Ufite ibibazo? Duhamagare kuri"
      }
    },
    getStarted: {
      title: "Tangira gukoresha Blessed Irembo",
      subtitle: "Hitamo uburyo ushaka gukoreshamo urubuga kugira ngo utangire gukoresha urubuga rwa farumasi mu Rwanda",
      user: {
        title: "Ndi Umukoresha",
        subtitle: "Shaka kandi uvugane na farumasi",
        features: [
          "Shaka farumasi mu gihugu hose",
          "Reba amakuru ya farumasi yizewe",
          "Ohereza ubutumwa muri farumasi bitaziguye",
          "Bona aho farumasi zikora amasaha 24 ziherereye"
        ],
        cta: "Komeza nka we"
      },
      pharmacy: {
        title: "Ndi Farumasi",
        subtitle: "Iyandikishe nka farumasi",
        trialBadge: "Igerageza ry'amezi 3",
        features: [
          "Igerageza ry'amezi 3 (nta kiguzi gisabwa)",
          "Kumenyekana mu gihugu hose kuri uru rubuga",
          "Gucunga ubusabe bw'abakoresha ahanditse hamwe",
          "Ikirango cy'uko wizewe"
        ],
        cta: "Komeza nka Farumasi"
      },
      alreadyHaveAccount: "Ufite konti umaze gufungura?",
      signIn: "Injira hano"
    },
    pharmacyDashboard: {
      nav: {
        overview: "Incamake",
        subscription: "Ifatabuguzi",
        profile: "Umwirondoro",
        settings: "Igenamiterere",
        logout: "Sohoka",
        myPharmacy: "Farumasi Yanjye",
        badge: "Farumasi"
      },
      overview: {
        subtitle: "Cunga umwirondoro wa farumasi yawe n'ifatabuguzi",
        stats: {
          whatsappClicks: "Abakanda kuri WhatsApp",
          whatsappClicksSubtitle: "Aberekejwe kuri WhatsApp yawe",
          profileViews: "Abasura Umwirondoro",
          profileViewsSubtitle: "Abasuye umwirondoro wa farumasi",
          subscriptionStatus: "Imiterere y'Ifatabuguzi",
          active: "ikora",
          expired: "yarangiye"
        },
        info: {
          title: "Amakuru ya Farumasi",
          address: "Aho iherereye",
          phone: "Terefone",
          email: "Imeri",
          memberSince: "Yatangiye gukoresha urubuga"
        }
      },
      profile: {
        title: "Umwirondoro wanjye",
        backToDashboard: "Subira ku ncamake",
        labels: {
          name: "Izina rya Farumasi",
          email: "Imeri",
          phone: "Nimero ya Terefone",
          address: "Aho iherereye"
        },
        notProvided: "Ntabwo byatanzwe"
      },
      settings: {
        title: "Igenamiterere",
        subtitle: "Cunga ibyo ukunda kuri konti yawe n'igenamiterere",
        tabs: {
          account: "Konti",
          workingHours: "Amasaha yo gukora",
          location: "Aho iherereye"
        },
        account: {
          changePassword: "Hindura Ijambo ry'ibanga",
          currentPassword: "Ijambo ry'ibanga ririho",
          newPassword: "Ijambo ry'ibanga rishya",
          confirmPassword: "Emeza Ijambo ry'ibanga rishya",
          updateButton: "Vugurura Ijambo ry'ibanga",
          updating: "Biravugururwa...",
          success: "Ijambo ry'ibanga ryahindutse neza!",
          twoFactor: "Uburyo bwo Kwemeza Kabiri (2FA)",
          twoFactorSubtitle: "Ongeraho umutekano mwinshi kuri konti yawe",
          enable2FA: "Enable 2FA",
          deleteAccount: "Siba Konti",
          deleteSubtitle: "Siba burundu konti yawe n'amakuru yose ajyanye nayo. Ibi ntibishobora gusubirwamo.",
          confirmDelete: "Nyamuneka emeza ijambo ry'ibanga ryawe ririho kugira ngo usibe konti.",
          confirmButton: "Emeza Isiba",
          cancelButton: "Hagarika"
        },
        workingHours: {
          title: "Amasaha yo gukora",
          is24Hours: "Ifunguye 24/7",
          days: "Iminsi yo gukora",
          openTime: "Igihe cyo gufungura",
          closeTime: "Igihe cyo gufunga",
          saveButton: "Bika Amasaha yo gukora",
          saving: "Birabikwa...",
          success: "Amasaha yo gukora yavuguruwe neza!"
        },
        location: {
          title: "Aho iherereye n'Aderesi",
          pinLocation: "Shyira akamenyetso aho iherereye",
          pinSubtitle: "Kanda ku ikarita kugira ngo ushyireho aho uherereye neza.",
          address: "Aderesi ya Farumasi",
          addressPlaceholder: "rugero: KN 5 Rd, Kigali",
          saveButton: "Bika aho uherereye",
          saving: "Birabikwa...",
          success: "Aho iherereye n'aho iri ku ikarita byavuguruwe neza!",
          errors: {
            incorrectPassword: "Ijambo ry'ibanga ntabwo ari ryo.",
            fillHours: "Nyamunekauzuza amasaha yose cyangwa uhitemo 24/7.",
            hoursUpdateFailed: "Kuvugurura amasaha byanze.",
            addressEmpty: "Aderesi ntabwo igomba kuba irimo ubusa.",
            locationUpdateFailed: "Kuvugurura aho iherereye byanze.",
            deleteConfirmPassword: "Nyamuneka andika ijambo ry'ibanga ryawe kugira ngo wemeze.",
            deleteAccountFailed: "Gusiba konti byanze. Nyamuneka ongera ugerageze."
          }
        }
      },
      subscription: {
        title: "Igenamiterere ry'Ifatabuguzi",
        status: {
          title: "Imiterere iriho",
          active: "Ikora",
          expired: "Yarangiye",
          validUntil: "Ifatabuguzi rizageza",
          expiredMsg: "Uburenganzira bwawe bwarangiye cyangwa butegereje kuvugururwa."
        },
        pending: {
          title: "Ubusabe bwoherejwe ku Muyobozi",
          msg: "Tumenyesheje umuyobozi ko ushaka kwishyura {amount} RWF. Umuyobozi ari gusuzuma ubusabe bwawe.",
          step2: "Intambwe ya 2: Ohereza Inyemezabwishyu",
          step2Msg: "Kugira ngo ubusabe bwemezwe vuba, ohereza ifoto (screenshot) y'inyemezabwishyu ya MoMo:",
          uploadButton: "Ohereza Inyemezabwishyu",
          uploading: "Irarasohoka...",
          success: "Inyemezabwishyu yawe yohererejwe neza mu buryo bwizewe.",
          approvalPending: "Inyemezabwishyu yohererejwe neza. Umuyobozi arayisuzuma vuba kugira ngo itangire gukora.",
          cancelButton: "Hagarika ubu busabe"
        },
        plans: {
          title: "Hitamo uburyo bwo kuvugurura",
          bestValue: "Ibiciro byiza",
          totalAmount: "Amafaranga yose"
        },
        payment: {
          title: "Rangiza Kwishyura",
          step1: "Intambwe ya 1: Ishyura",
          instruction: "Fungura terefone yawe wandike iyi mibare:",
          confirmation: "Uzasabwa kwemeza kwishyura Blessed HealthConnect LTD {amount} RWF.",
          paidButton: "Namaze kwishyura",
          sending: "Ubusabe buragenda...",
          errors: {
            selectScreenshot: "Nyamunekaanza utabure ifoto (screenshot) y'inyemezabwishyu.",
            uploadFailed: "Gushyiraho inyemezabwishyu byanze. Nyamuneka ongera ugerageze.",
            cancelConfirm: "Ese wizeye ko ushaka guhagarika ubu busabe?",
            cancelFailed: "Guhagarika ubusabe byanze."
          }
        }
      },
    },
    registerPharmacy: {
      title: "Iyandikishe nka Farumasi",
      subtitle: "Nimero yawe yo kwiyandikisha muri koperative y'abafuramatama isuzumwa hakoreshejwe urutonde rwemewe.",
      fdaList: "nk'uko yatanzwe na NPC( national pharmacy council)",
      labels: {
        registrationNumber: "Nimero ya NPC ya farumasiye.",
        registrationNumberPlaceholder: "NPC/A0000",
        registrationNumberHint: "Uburyo bwanditsemo: NPC/A0000 — nk'uko yatanzwe na Rwanda NPC( national pharmacy council)",
        pharmacyName: "Izina rya Farumasi",
        pharmacyNamePlaceholder: "Andika izina rya farumasi",
        ownerName: "Nyirayo / Umuntu Ubishinzwe",
        ownerNamePlaceholder: "Andika amazina yose ya nyirayo",
        phone: "Nimero ya Terefone",
        phonePlaceholder: "+250 788 123 456",
        email: "Imeri",
        emailPlaceholder: "farumasi@urugero.com",
        address: "Aho iherereye (Aderesi)",
        addressPlaceholder: "Andika aderesi yose harimo n'akarere",
        operatingHours: "Amasaha yo gukora",
        is24Hours: "Ikora 24/7 (Ifunguye igihe cyose)",
        daysOpen: "Iminsi ifunguye",
        openingTime: "Igihe cyo gufungura",
        closingTime: "Igihe cyo gufunga",
        location: "Aho Farumasi iherereye ku Ikarita",
        locationHint: "Hitamo uburyo washyiraho aho farumasi yawe iherereye ku ikarita. Nibura uburyo bumwe ni ngombwa.",
        gpsTab: "Koresha aho ndi",
        gpsHint: "Ni uburyo bwiza cyane. Fungura uru rupapuro uri kuri farumasi neza.",
        gpsButton: "Koresha aho ndi ubu",
        gpsLocating: "Biracyashakisha aho uherereye...",
        gpsSuccess: "Aho uherereye hamaze kugaragazwa — kanda hano uhavugurure",
        gpsCaptured: "Aho uherereye hamaze kuboneka",
        manualTab: "Andika imibare (Coordinates)",
        manualHint: "Fungura Google Maps, kanda iburyo kuri farumasi yawe → kopa imibare igaragara (coordinates), maze uyandike hano munsi.",
        latitude: "Latitude",
        longitude: "Longitude",
        coordinatesSet: "Imibare yamaze gushyirwaho",
        openMaps: "Fungura Google Maps ushake imibare",
        descriptionTab: "Ibisobanuro gusa",
        descriptionHint: "Icyitonderwa: Hatariho imibare (coordinates), farumasi yawe ntabwo izagaragara nk'akamenyetso ku ikarita. Ushobora kuzashyiraho aho uherereye nyuma.",
        password: "Ijambo ry'ibanga",
        passwordPlaceholder: "Andika ijambo ry'ibanga rifite inyuguti 6",
        confirmPassword: "Emeza Ijambo ry'ibanga",
        confirmPasswordPlaceholder: "Subiramo ijambo ry'ibanga ryawe",
        fdaNotice: "Yagenzuwe na Rwanda NPC( national pharmacy council). Nimero yawe yo kwiyandikisha isuzumwa hakoreshejwe urutonde rwemewe rwa farumasi 725 zifite impushya."
      },
      submitButton: "Iyandikishe nka Farumasi",
      registering: "Kwiyandikisha...",
      alreadyAccount: "Ufite konti?",
      signIn: "Injira hano",
      status: {
        checking: "Biracyasuzumwa...",
        verified: "Yagenzuwe",
        alreadyRegistered: "Isanzwe iyandikishije",
        notFound: "Ntabwo iboneka ku rutonde rwa Rwanda NPC( national pharmacy council)"
      },
      errors: {
        pharmacyNameRequired: "Izina rya farumasi ni ngombwa",
        ownerNameRequired: "Amazina ya nyirayo ni ngombwa",
        emailRequired: "Imeri ni ngombwa",
        emailInvalid: "Imeri ntabwo ari yo",
        phoneRequired: "Nimero ya terefone ni ngombwa",
        addressRequired: "Aderesi ni ngombwa",
        openTimeRequired: "Igihe cyo gufungura ni ngombwa",
        closeTimeRequired: "Igihe cyo gufunga ni ngombwa",
        locationRequired: "Kanda \"Koresha aho ndi\" kugira ngo ugaragaze aho uherereye kuri GPS.",
        locationRequiredManual: "Andika imibare (latitude na longitude) ifite ishingiro.",
        registrationNumberRequired: "Nimero yo kwiyandikisha y'abakozi bashinzwe farumasi ni ngombwa",
        registrationNumberNotFound: "Ntabwo ibonetse ku rutonde rwa farumasi zifite impushya rwa Rwanda NPC( national pharmacy council)",
        registrationNumberTaken: "Iyi farumasi isanzwe iyandikishije kuri Blessed Irembo",
        registrationNumberChecking: "Biracyasuzumwa — utegereze gato",
        passwordRequired: "Ijambo ry'ibanga ni ngombwa",
        passwordMinLength: "Ijambo ry'ibanga rigomba kugira inyuguti nibura 6",
        passwordsMismatch: "Amagambo y'ibanga ntabwo ahuye",
        generic: "Hagaragaye ikibazo. Ongera ugerageze."
      }
    },
    download: {
      title: "Manura Porogaramu ya Blessed Irembo",
      subtitle: "Bona uburyo bwo gushaka farumasi bworoshye cyane mu Rwanda binyuze kuri terefone yawe. Shaka farumasi aho uherereye hose, reba niba imiti ihari, kandi ubone nimero zabo ako kanya.",
      playStoreButton: "Yikure kuri Google Play",
      appStoreButton: "Manura kuri App Store",
      qrTitle: "Sikana hano uyimanurire",
      qrText: "Sikana iyi kode (QR) ukoresheje kamera ya terefone yawe kugira ngo uhite umanura porogaramu.",
      featuresTitle: "Ibyiza bya Porogaramu ya Terefone",
      feature1Title: "Gushakisha Kuri Ikarita",
      feature1Desc: "Shaka farumasi zujuje ibyangombwa zikuri hafi ukanze ku ikarita yacu.",
      feature2Title: "Kuvugana Kuri WhatsApp",
      feature2Desc: "Vugana na farumasi ako kanya kuri WhatsApp ubaze niba imiti ihari n'igiciro cyayo.",
      feature3Title: "Gufungura 24/7 n'Amakuru",
      feature3Desc: "Shaka farumasi zifunguye amanywa n'ijoro (24/7), reba uko bazigisha, kandi uhabwe icyerekezo."
    }
  }
};

export type TranslationKeys = typeof translations.en;
