## Ana sayfa SEO özeti (GENERIC ŞABLON)


> **Current:** homepage_seo.md  
> **Next:** → product_detail_seo.md
### Yapı (kısa)
- **Amaç**: Ana sayfada konu/ürün kümelerini (kategori veya hedef sayfalar) netleştirip, hem kullanıcı niyetini hem de arama motoru sinyallerini güçlendirmek.
- **Odak**: Ana sayfada genelde 3–6 adet “hedef sayfa/ürün” belirlenir; görsel, metin ve schema ile bu hedeflere sinyal verilir.

### H1–H2–H3 hiyerarşisi
- **H1**: Ana sayfanın ana teması (site ana vaadi + ana hedef sorgu).
- **H2**: Ana bölümler (örn. “Öne Çıkan Kategoriler/Ürünler”, “Neden Biz?”, “Referanslar”, “SSS”, “Blog/İçerikler”).
- **H3**: H2 altı alt başlıklar (örn. fayda maddeleri, mini bölüm başlıkları). **Seviye atlanmıyor**.

### İç linkleme (internal linking)
- **Hedef blok(lar)**: Ana sayfada hedef sayfalara kart/CTA ile linkleme:
  - `/kategori-x`
  - `/urun-a`
  - `/urun-b`
- **Bağlamsal linkler**: Metin içinde aynı hedef sayfalara doğal anchor ile link.
- **Footer/Nav**: Kategori/kurumsal linkleriyle crawl dağılımı.

### Canonical / URL tekilleştirme
- **Canonical**: Query parametreleri temizlenmiş tek URL hedeflenir.
- **Tekilleştirme**: `/index` veya `/index.php` varyasyonları kök `/` ile birleştirilir.

---

## Schema.org (JSON-LD) — anasayfada kullanılan şemalar ve alanları

### 1) Organization SCHEMASI alanları ->
- `@type`(Organization), `@id`, `name`, `url`, `logo`, `sameAs`, `contactPoint`

### 2) ContactPoint SCHEMASI alanları ->
- `@type`(ContactPoint), `telephone`, `contactType`, `areaServed`, `availableLanguage`

### 3) ImageObject SCHEMASI alanları ->
- `@type`(ImageObject), `url`, `width`, `height`

### 4) WebSite SCHEMASI alanları ->
- `@type`(WebSite), `@id`, `url`, `name`, `description`, `publisher`, `inLanguage`, `potentialAction`

### 5) SearchAction SCHEMASI alanları ->
- `@type`(SearchAction), `target`, `query-input`

### 6) EntryPoint SCHEMASI alanları ->
- `@type`(EntryPoint), `urlTemplate`

### 7) WebPage SCHEMASI alanları ->
- `@type`(WebPage), `@id`, `url`, `name`, `description`, `isPartOf`, `about`, `breadcrumb`, `inLanguage`, `primaryImageOfPage`

### 8) BreadcrumbList SCHEMASI alanları ->
- `@type`(BreadcrumbList), `@id`, `itemListElement`

### 9) ListItem SCHEMASI alanları ->
- `@type`(ListItem), `position`, `name`, `item`

---

## Ana sayfada hedef ürün/kategori listesi (opsiyonel ama güçlü)

### 10) ItemList SCHEMASI alanları ->
- `@type`(ItemList), `itemListElement`, `numberOfItems`

### 11) (ItemList içindeki) ListItem alanları ->
- `@type`(ListItem), `position`, `item`(Product)

### 12) Product SCHEMASI alanları ->
- `@type`(Product), `@id`, `name`, `image`, `description`, `brand`, `url`, `sku`, `mpn`, `offers`, `aggregateRating`

### 13) Brand SCHEMASI alanları ->
- `@type`(Brand), `name`

### 14) Offer SCHEMASI alanları ->
- `@type`(Offer), `url`, `priceCurrency`, `price`, `priceValidUntil`, `availability`, `itemCondition`, `seller`(opsiyonel), `hasMerchantReturnPolicy`, `shippingDetails`

### 15) MerchantReturnPolicy SCHEMASI alanları ->
- `@type`(MerchantReturnPolicy), `applicableCountry`, `returnPolicyCategory`, `merchantReturnDays`, `returnMethod`, `returnFees`

### 16) Country SCHEMASI alanları ->
- `@type`(Country), `name`

### 17) OfferShippingDetails SCHEMASI alanları ->
- `@type`(OfferShippingDetails), `shippingRate`, `shippingDestination`, `deliveryTime`

### 18) MonetaryAmount SCHEMASI alanları ->
- `@type`(MonetaryAmount), `value`, `currency`

### 19) DefinedRegion SCHEMASI alanları ->
- `@type`(DefinedRegion), `addressCountry`

### 20) ShippingDeliveryTime SCHEMASI alanları ->
- `@type`(ShippingDeliveryTime), `handlingTime`, `transitTime`, `businessDays`, `cutoffTime`

### 21) QuantitativeValue SCHEMASI alanları ->
- `@type`(QuantitativeValue), `minValue`, `maxValue`, `unitCode`

### 22) OpeningHoursSpecification SCHEMASI alanları ->
- `@type`(OpeningHoursSpecification), `dayOfWeek`

### 23) AggregateRating SCHEMASI alanları ->
- `@type`(AggregateRating), `ratingValue`, `reviewCount`, `bestRating`, `worstRating`

---

## Ana sayfa FAQ (opsiyonel)

### 24) FAQPage SCHEMASI alanları ->
- `@type`(FAQPage), `mainEntity`

### 25) Question SCHEMASI alanları ->
- `@type`(Question), `name`, `acceptedAnswer`

### 26) Answer SCHEMASI alanları ->
- `@type`(Answer), `text`