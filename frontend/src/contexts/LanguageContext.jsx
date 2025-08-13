import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children, user }) => {
  const [language, setLanguage] = useState('en'); // default to English

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  // Initialize language from localStorage or user preferences
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language');
    const userLang = user?.preferences?.language;
    
    // Priority: localStorage > user preferences > default 'en'
    if (savedLang && (savedLang === 'en' || savedLang === 'fr')) {
      setLanguage(savedLang);
    } else if (userLang && (userLang === 'en' || userLang === 'fr')) {
      setLanguage(userLang);
      localStorage.setItem('preferred-language', userLang);
    }
  }, [user]);

  // Sync with user preferences when they change
  useEffect(() => {
    if (user?.preferences?.language && user.preferences.language !== language) {
      const userLang = user.preferences.language;
      if (userLang === 'en' || userLang === 'fr') {
        setLanguage(userLang);
        localStorage.setItem('preferred-language', userLang);
      }
    }
  }, [user?.preferences?.language]);

  const translations = {
    // Navigation
    home: { en: 'Home', fr: 'Accueil' },
    categories: { en: 'Categories', fr: 'Catégories' },
    about: { en: 'About', fr: 'À propos' },
    contact: { en: 'Contact', fr: 'Contact' },
    
    // Search
    searchPlaceholder: { en: 'What are you looking for?', fr: 'Que cherchez-vous ?' },
    searchSuggestions: { en: 'Popular searches', fr: 'Recherches populaires' },
    recentSearches: { en: 'Recent searches', fr: 'Recherches récentes' },
    trendingSearches: { en: 'Trending searches', fr: 'Recherches tendances' },
    
    // Actions  
    shopNow: { en: 'Shop Now', fr: 'Acheter maintenant' },
    viewAll: { en: 'View All', fr: 'Voir tout' },
    addToCart: { en: 'Add to Cart', fr: 'Ajouter au panier' },
    buyNow: { en: 'Buy Now', fr: 'Acheter maintenant' },
    
    // Product
    featured: { en: 'Featured', fr: 'En vedette' },
    outOfStock: { en: 'Out of Stock', fr: 'Rupture de stock' },
    inStock: { en: 'In Stock', fr: 'En stock' },
    reviews: { en: 'reviews', fr: 'avis' },
    rating: { en: 'Rating', fr: 'Note' },
    
    // Categories
    electronics: { en: 'Electronics', fr: 'Électronique' },
    fashion: { en: 'Fashion', fr: 'Mode' },
    homeGarden: { en: 'Home & Garden', fr: 'Maison et Jardin' },
    sportsOutdoors: { en: 'Sports & Outdoors', fr: 'Sports et Plein Air' },
    healthBeauty: { en: 'Health & Beauty', fr: 'Santé et Beauté' },
    booksMedia: { en: 'Books & Media', fr: 'Livres et Médias' },
    
    // Testimonials
    testimonials: { en: 'What Our Customers Say', fr: 'Ce que disent nos clients' },
    customerReviews: { en: 'Customer Reviews', fr: 'Avis clients' },
    
    // Common
    loading: { en: 'Loading...', fr: 'Chargement...' },
    error: { en: 'Error', fr: 'Erreur' },
    success: { en: 'Success', fr: 'Succès' },
    
    // Languages
    english: { en: 'English', fr: 'Anglais' },
    french: { en: 'French', fr: 'Français' },
    
    // Authentication
    signIn: { en: 'Sign In', fr: 'Se connecter' },
    signUp: { en: 'Sign Up', fr: "S'inscrire" },
    login: { en: 'Login', fr: 'Connexion' },
    register: { en: 'Register', fr: "S'inscrire" },
    logout: { en: 'Logout', fr: 'Déconnexion' },
    email: { en: 'Email', fr: 'E-mail' },
    password: { en: 'Password', fr: 'Mot de passe' },
    confirmPassword: { en: 'Confirm Password', fr: 'Confirmer le mot de passe' },
    firstName: { en: 'First Name', fr: 'Prénom' },
    lastName: { en: 'Last Name', fr: 'Nom de famille' },
    phone: { en: 'Phone', fr: 'Téléphone' },
    dateOfBirth: { en: 'Date of Birth', fr: 'Date de naissance' },
    gender: { en: 'Gender', fr: 'Genre' },
    male: { en: 'Male', fr: 'Homme' },
    female: { en: 'Female', fr: 'Femme' },
    other: { en: 'Other', fr: 'Autre' },
    
    // Form Actions
    save: { en: 'Save', fr: 'Enregistrer' },
    cancel: { en: 'Cancel', fr: 'Annuler' },
    edit: { en: 'Edit', fr: 'Modifier' },
    delete: { en: 'Delete', fr: 'Supprimer' },
    update: { en: 'Update', fr: 'Mettre à jour' },
    
    // Profile
    profile: { en: 'Profile', fr: 'Profil' },
    myAccount: { en: 'My Account', fr: 'Mon compte' },
    personalInfo: { en: 'Personal Info', fr: 'Infos personnelles' },
    personalInformation: { en: 'Personal Information', fr: 'Informations personnelles' },
    addresses: { en: 'Addresses', fr: 'Adresses' },
    preferences: { en: 'Preferences', fr: 'Préférences' },
    accountPreferences: { en: 'Account Preferences', fr: 'Préférences du compte' },
    
    // Address
    addAddress: { en: 'Add Address', fr: 'Ajouter une adresse' },
    addNewAddress: { en: 'Add New Address', fr: 'Ajouter une nouvelle adresse' },
    editAddress: { en: 'Edit Address', fr: 'Modifier l\'adresse' },
    shippingAddress: { en: 'Shipping Address', fr: 'Adresse de livraison' },
    shippingAddresses: { en: 'Shipping Addresses', fr: 'Adresses de livraison' },
    addressType: { en: 'Address Type', fr: 'Type d\'adresse' },
    streetAddress: { en: 'Street Address', fr: 'Adresse de rue' },
    city: { en: 'City', fr: 'Ville' },
    state: { en: 'State', fr: 'État' },
    zipCode: { en: 'ZIP Code', fr: 'Code postal' },
    country: { en: 'Country', fr: 'Pays' },
    homeAddress: { en: 'Home', fr: 'Domicile' },
    work: { en: 'Work', fr: 'Travail' },
    default: { en: 'Default', fr: 'Par défaut' },
    
    // Orders
    myOrders: { en: 'My Orders', fr: 'Mes commandes' },
    allOrders: { en: 'All Orders', fr: 'Toutes les commandes' },
    orderDetails: { en: 'Order Details', fr: 'Détails de la commande' },
    orderNumber: { en: 'Order Number', fr: 'Numéro de commande' },
    orderDate: { en: 'Order Date', fr: 'Date de commande' },
    orderTimeline: { en: 'Order Timeline', fr: 'Chronologie de la commande' },
    orderedItems: { en: 'Ordered Items', fr: 'Articles commandés' },
    orderSummary: { en: 'Order Summary', fr: 'Résumé de la commande' },
    
    // Order Status
    pending: { en: 'Pending', fr: 'En attente' },
    confirmed: { en: 'Confirmed', fr: 'Confirmée' },
    processing: { en: 'Processing', fr: 'En cours de traitement' },
    shipped: { en: 'Shipped', fr: 'Expédiée' },
    delivered: { en: 'Delivered', fr: 'Livrée' },
    cancelled: { en: 'Cancelled', fr: 'Annulée' },
    refunded: { en: 'Refunded', fr: 'Remboursée' },
    
    // Payment
    paymentMethod: { en: 'Payment Method', fr: 'Mode de paiement' },
    subtotal: { en: 'Subtotal', fr: 'Sous-total' },
    shipping: { en: 'Shipping', fr: 'Livraison' },
    tax: { en: 'Tax', fr: 'Taxes' },
    discount: { en: 'Discount', fr: 'Remise' },
    total: { en: 'Total', fr: 'Total' },
    
    // Messages
    profileUpdatedSuccessfully: { en: 'Profile updated successfully', fr: 'Profil mis à jour avec succès' },
    passwordsDoNotMatch: { en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas' },
    somethingWentWrong: { en: 'Something went wrong', fr: 'Quelque chose s\'est mal passé' },
    pleaseLogin: { en: 'Please login to continue', fr: 'Veuillez vous connecter pour continuer' },
    noOrdersFound: { en: 'No orders found', fr: 'Aucune commande trouvée' },
    noOrdersDescription: { en: 'You haven\'t placed any orders yet', fr: 'Vous n\'avez encore passé aucune commande' },
    
    // Common Form Fields
    enterEmail: { en: 'Enter your email', fr: 'Entrez votre e-mail' },
    enterPassword: { en: 'Enter your password', fr: 'Entrez votre mot de passe' },
    enterFirstName: { en: 'Enter your first name', fr: 'Entrez votre prénom' },
    enterLastName: { en: 'Enter your last name', fr: 'Entrez votre nom de famille' },
    selectGender: { en: 'Select gender', fr: 'Sélectionnez le genre' },
    processingAction: { en: 'Processing...', fr: 'Traitement en cours...' },
    saving: { en: 'Saving...', fr: 'Enregistrement...' },
    saveChanges: { en: 'Save Changes', fr: 'Enregistrer les modifications' },
    saveAddress: { en: 'Save Address', fr: 'Enregistrer l\'adresse' },
    
    // Preferences
    subscribeToNewsletter: { en: 'Subscribe to newsletter', fr: 'S\'abonner à la newsletter' },
    emailNotifications: { en: 'Email notifications', fr: 'Notifications par e-mail' },
    smsNotifications: { en: 'SMS notifications', fr: 'Notifications par SMS' },
    setAsDefaultAddress: { en: 'Set as default address', fr: 'Définir comme adresse par défaut' },
    
    // Validation
    emailCannotBeChanged: { en: 'Email cannot be changed', fr: 'L\'e-mail ne peut pas être modifié' },
    memberSince: { en: 'Member since', fr: 'Membre depuis' },
    
    // Actions
    viewDetails: { en: 'View Details', fr: 'Voir les détails' },
    reorder: { en: 'Reorder', fr: 'Recommander' },
    cancelOrder: { en: 'Cancel Order', fr: 'Annuler la commande' },
    quantity: { en: 'Quantity', fr: 'Quantité' },
    moreItems: { en: 'more items', fr: 'autres articles' },
    tracking: { en: 'Tracking', fr: 'Suivi' },
    
    // Product Details
    description: { en: 'Description', fr: 'Description' },
    specifications: { en: 'Specifications', fr: 'Spécifications' },
    noSpecifications: { en: 'No specifications available', fr: 'Aucune spécification disponible' },
    reviewsComingSoon: { en: 'Reviews coming soon...', fr: 'Avis disponibles bientôt...' },
    backToHome: { en: 'Back to Home', fr: 'Retour à l\'accueil' },
    off: { en: 'off', fr: 'de réduction' },
    saveAmount: { en: 'Save', fr: 'Économisez' },
    freeShippingTitle: { en: 'Free Shipping', fr: 'Livraison Gratuite' },
    yearWarranty: { en: '1 Year Warranty', fr: 'Garantie 1 An' },
    easyReturnTitle: { en: '30-Day Returns', fr: 'Retours 30 Jours' },
    
    // Confirmations
    confirmCancelOrder: { en: 'Are you sure you want to cancel this order?', fr: 'Êtes-vous sûr de vouloir annuler cette commande ?' },
    confirmDeleteAddress: { en: 'Are you sure you want to delete this address?', fr: 'Êtes-vous sûr de vouloir supprimer cette adresse ?' },
    reorderSuccessful: { en: 'Items added to cart successfully!', fr: 'Articles ajoutés au panier avec succès !' },
    reorderFailed: { en: 'Failed to reorder items', fr: 'Impossible de recommander les articles' },
    
    // Modal actions
    or: { en: 'or', fr: 'ou' },
    noAccount: { en: 'Don\'t have an account?', fr: 'Vous n\'avez pas de compte ?' },
    alreadyHaveAccount: { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?' }
  };

  const t = (key) => {
    return translations[key] ? translations[key][language] || translations[key]['en'] || key : key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};