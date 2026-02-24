{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://smartrealtoragent.com/#organization",
      "name": "Smart Realtor Agent",
      "url": "https://smartrealtoragent.com",
      "logo": "https://smartrealtoragent.com/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://smartrealtoragent.com/#website",
      "url": "https://smartrealtoragent.com",
      "name": "Smart Realtor Agent",
      "description": "Embeddable AI chatbot platform for real estate agents with citation-backed responses and tenant-isolated architecture.",
      "publisher": {
        "@id": "https://smartrealtoragent.com/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://smartrealtoragent.com/#webpage",
      "url": "https://smartrealtoragent.com",
      "name": "AI Chatbot for Real Estate Agents",
      "isPartOf": {
        "@id": "https://smartrealtoragent.com/#website"
      },
      "about": {
        "@type": "SoftwareApplication",
        "name": "Smart Realtor Agent"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://smartrealtoragent.com/#software",
      "name": "Smart Realtor Agent",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "A multi-tenant SaaS platform providing embeddable AI chatbots for real estate agents with knowledge-base retrieval and structured lead capture.",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "0",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
}