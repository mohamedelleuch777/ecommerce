import mongoose from 'mongoose';

const footerLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  openInNewTab: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
});

const footerSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  links: [footerLinkSchema],
  order: {
    type: Number,
    default: 0
  }
});

const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest']
  },
  url: {
    type: String,
    required: true
  },
  icon: String,
  order: {
    type: Number,
    default: 0
  }
});

const footerSchema = new mongoose.Schema({
  // Company Info Section
  companyInfo: {
    name: {
      type: String,
      required: true
    },
    logo: String,
    description: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    contact: {
      phone: String,
      email: String,
      fax: String
    }
  },

  // Footer Sections (Quick Links, Customer Service, etc.)
  sections: [footerSectionSchema],

  // Social Media Links
  socialLinks: [socialLinkSchema],

  // Newsletter Section
  newsletter: {
    enabled: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: 'Subscribe to Our Newsletter'
    },
    description: {
      type: String,
      default: 'Get the latest updates on new products and upcoming sales'
    }
  },

  // Copyright and Legal
  copyright: {
    text: String,
    year: {
      type: Number,
      default: () => new Date().getFullYear()
    }
  },

  // Footer Appearance
  appearance: {
    backgroundColor: {
      type: String,
      default: '#1f2937'
    },
    textColor: {
      type: String,
      default: '#ffffff'
    },
    linkColor: {
      type: String,
      default: '#60a5fa'
    },
    showLogo: {
      type: Boolean,
      default: true
    },
    showSocialLinks: {
      type: Boolean,
      default: true
    }
  },

  // SEO and Analytics
  seo: {
    enableSchemaMarkup: {
      type: Boolean,
      default: true
    },
    trackingCodes: [{
      name: String,
      code: String,
      position: {
        type: String,
        enum: ['head', 'body'],
        default: 'body'
      }
    }]
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
footerSchema.index({ isActive: 1 });
footerSchema.index({ 'sections.order': 1 });
footerSchema.index({ 'socialLinks.order': 1 });

const Footer = mongoose.model('Footer', footerSchema);

export default Footer;